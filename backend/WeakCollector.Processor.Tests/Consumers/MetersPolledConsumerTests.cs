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
        readings.Select(r => (r.Type, r.Location)).ShouldBe([("air_quality", "Garage"), ("energy", "Bedroom")]);
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
    public async Task Consume_publishes_the_stored_readings()
    {
        await using var services = await ProcessorServices.StartAsync(postgres.ConnectionString);
        var poll = SamplePolls.TwoMeters();

        await PublishAndWaitAsync(services, poll);

        var harness = services.GetRequiredService<ITestHarness>();
        var cancellationToken = TestContext.Current.CancellationToken;
        (await harness.Published.Any<PollStored>(m => m.Context.Message.PollId == poll.PollId, cancellationToken))
            .ShouldBeTrue();
        var stored = harness.Published
            .Select<PollStored>(m => m.Context.Message.PollId == poll.PollId, cancellationToken)
            .Single()
            .Context.Message;
        var readings = await ReadingsOfAsync(poll.PollId);

        stored.PolledAt.ShouldBe(poll.PolledAt);
        stored.Readings.Select(r => (r.Id, r.Location, r.Type)).ShouldBe(
            readings.Select(r => (r.Id, r.Location, r.Type)),
            ignoreOrder: true);
        stored.Readings.Single(r => r.Type == "air_quality").Measurements
            .Select(m => (m.Name, m.Value, m.ValueType))
            .ShouldBe([("co2", "330", "NUMBER"), ("pm25", "22", "NUMBER"), ("humidity", "32", "NUMBER")], ignoreOrder: true);
    }

    [Fact]
    public async Task Consume_does_not_publish_for_a_poll_that_is_already_saved()
    {
        var poll = SamplePolls.TwoMeters();

        await using (var first = await ProcessorServices.StartAsync(postgres.ConnectionString))
        {
            await PublishAndWaitAsync(first, poll);
        }

        await using var second = await ProcessorServices.StartAsync(postgres.ConnectionString);
        await PublishAndWaitAsync(second, poll);

        second.GetRequiredService<ITestHarness>()
            .Published.Select<PollStored>(TestContext.Current.CancellationToken)
            .ShouldBeEmpty();
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
            .Include(r => r.Measurements)
            .Where(r => r.PollId == pollId)
            .OrderBy(r => r.Type)
            .ToListAsync(TestContext.Current.CancellationToken);
    }
}
