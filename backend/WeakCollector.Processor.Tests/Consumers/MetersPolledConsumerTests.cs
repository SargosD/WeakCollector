using MassTransit;
using MassTransit.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WeakCollector.Data;
using WeakCollector.Messaging.Messages;
using WeakCollector.Processor.Consumers;
using WeakCollector.Processor.Tests.Support;

namespace WeakCollector.Processor.Tests.Consumers;

public class MetersPolledConsumerTests(PostgresFixture postgres) : IClassFixture<PostgresFixture>
{
    [Fact]
    public async Task Consume_saves_a_reading_per_meter()
    {
        await using var services = await ProcessorServices.StartAsync(postgres.ConnectionString);
        var poll = SamplePolls.TwoMeters();

        await PublishAndWaitAsync(services, poll);

        var readings = await ReadingsOfAsync(poll.PollId);
        readings.Select(r => (r.Type, r.Location.Name)).ShouldBe([("air_quality", "Garage"), ("energy", "Bedroom")]);
        readings.ShouldAllBe(r => r.PolledAt == poll.PolledAt);
    }

    [Fact]
    public async Task Consume_skips_a_poll_that_is_already_saved()
    {
        var poll = SamplePolls.TwoMeters();

        await using (var first = await ProcessorServices.StartAsync(postgres.ConnectionString))
        {
            await PublishAndWaitAsync(first, poll);
        }

        await using (var second = await ProcessorServices.StartAsync(postgres.ConnectionString))
        {
            await PublishAndWaitAsync(second, poll);
        }

        (await ReadingsOfAsync(poll.PollId)).Count.ShouldBe(2);
    }

    [Fact]
    public async Task Consume_saves_the_payload_values_as_measurements()
    {
        await using var services = await ProcessorServices.StartAsync(postgres.ConnectionString);
        var poll = SamplePolls.TwoMeters();

        await PublishAndWaitAsync(services, poll);

        var readings = await ReadingsOfAsync(poll.PollId);
        var garage = readings.Single(r => r.Type == "air_quality");
        garage.Measurements.Select(m => (m.Name, m.Value, m.ValueType)).ShouldBe(
            [
                ("co2", "330", MeasurementValueType.Number),
                ("pm25", "22", MeasurementValueType.Number),
                ("humidity", "32", MeasurementValueType.Number),
            ],
            ignoreOrder: true);
    }

    [Fact]
    public async Task Consume_reuses_an_existing_location()
    {
        await using (var first = await ProcessorServices.StartAsync(postgres.ConnectionString))
        {
            await PublishAndWaitAsync(first, SamplePolls.TwoMeters());
        }

        await using (var second = await ProcessorServices.StartAsync(postgres.ConnectionString))
        {
            await PublishAndWaitAsync(second, SamplePolls.TwoMeters());
        }

        await using var db = postgres.CreateDbContext();
        (await db.Locations.CountAsync(l => l.Name == "Garage", TestContext.Current.CancellationToken)).ShouldBe(1);
    }

    private static async Task PublishAndWaitAsync(IServiceProvider services, MetersPolled poll)
    {
        var harness = services.GetRequiredService<ITestHarness>();
        var messageId = NewId.NextGuid();

        await harness.Bus.Publish(poll, context => context.MessageId = messageId);

        var consumer = harness.GetConsumerHarness<MetersPolledConsumer>();
        (await consumer.Consumed.Any<MetersPolled>(m => m.Context.MessageId == messageId)).ShouldBeTrue();
        consumer.Consumed.Select<MetersPolled>(m => m.Context.MessageId == messageId).Single().Exception.ShouldBeNull();
    }

    private async Task<List<MeterReading>> ReadingsOfAsync(Guid pollId)
    {
        await using var db = postgres.CreateDbContext();
        return await db.MeterReadings
            .Include(r => r.Location)
            .Include(r => r.Measurements)
            .Where(r => r.PollId == pollId)
            .OrderBy(r => r.Type)
            .ToListAsync(TestContext.Current.CancellationToken);
    }
}
