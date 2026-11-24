using MassTransit;
using MassTransit.Testing;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using WeakCollector.Messaging.Messages;
using WeakCollector.Notifier.Consumers;
using WeakCollector.Notifier.Hubs;
using WeakCollector.Notifier.Tests.Support;

namespace WeakCollector.Notifier.Tests.Consumers;

public class PollStoredConsumerTests
{
    [Fact]
    public async Task Consume_sends_the_stored_poll_to_all_clients()
    {
        var hub = new RecordingHubContext();
        await using var services = new ServiceCollection()
            .AddLogging()
            .AddSingleton<IHubContext<PollsHub, IPollsClient>>(hub)
            .AddMassTransitTestHarness(cfg => cfg.AddConsumer<PollStoredConsumer>())
            .BuildServiceProvider(true);
        var harness = services.GetRequiredService<ITestHarness>();
        await harness.Start();

        var poll = new PollStored(
            Guid.NewGuid(),
            new DateTimeOffset(2026, 11, 24, 12, 0, 0, TimeSpan.Zero),
            [new StoredReading(1, "Kitchen", "energy", [new StoredMeasurement(1, "energy", "418.67", "NUMBER")])]);

        await harness.Bus.Publish(poll, TestContext.Current.CancellationToken);

        (await harness.GetConsumerHarness<PollStoredConsumer>().Consumed.Any<PollStored>(TestContext.Current.CancellationToken))
            .ShouldBeTrue();
        var sent = hub.SentToAll.ShouldHaveSingleItem();
        sent.PollId.ShouldBe(poll.PollId);
        sent.PolledAt.ShouldBe(poll.PolledAt);
        var reading = sent.Readings.ShouldHaveSingleItem();
        (reading.Id, reading.Location, reading.Type).ShouldBe((1L, "Kitchen", "energy"));
        reading.Measurements.ShouldHaveSingleItem().ShouldBe(new StoredMeasurement(1, "energy", "418.67", "NUMBER"));
    }
}
