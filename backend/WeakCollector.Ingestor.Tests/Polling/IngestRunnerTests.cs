using System.Net;
using WeakCollector.Ingestor.Tests.Support;
using WeakCollector.Messaging.Messages;
using WeakCollector.Messaging.Topology;

namespace WeakCollector.Ingestor.Tests.Polling;

public class IngestRunnerTests
{
    [Fact]
    public async Task Publishes_batch_to_raw_exchange()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.OK, SampleMeters.ThreeTypes);
        var publisher = new FakePublisher();

        var published = await IngestorServices.Runner(handler, publisher).RunAsync(CancellationToken.None);

        published.ShouldBeTrue();
        publisher.MessagesOf<MeterMessage>().ShouldHaveSingleItem().Readings.Count.ShouldBe(3);
        publisher.Published.Select(p => (p.Exchange, p.RoutingKey)).ShouldBe(
        [
            (TopologyNames.RawExchange, TopologyNames.MetersReceivedKey),
        ]);
    }

    [Fact]
    public async Task Publishes_batch_after_retries()
    {
        var handler = new ScriptedHandler()
            .Respond(HttpStatusCode.InternalServerError)
            .Throw(new HttpRequestException("The response ended prematurely.", new IOException()))
            .Respond(HttpStatusCode.OK, SampleMeters.ThreeTypes);
        var publisher = new FakePublisher();

        var published = await IngestorServices.Runner(handler, publisher).RunAsync(CancellationToken.None);

        handler.Calls.ShouldBe(3);
        published.ShouldBeTrue();
        publisher.MessagesOf<MeterMessage>().Count.ShouldBe(1);
    }

    [Fact]
    public async Task Publishes_nothing_on_rate_limit()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.TooManyRequests);
        var publisher = new FakePublisher();

        var published = await IngestorServices.Runner(handler, publisher).RunAsync(CancellationToken.None);

        handler.Calls.ShouldBe(1);
        published.ShouldBeFalse();
        publisher.Published.ShouldBeEmpty();
    }

    [Fact]
    public async Task Publishes_nothing_when_retries_are_exhausted()
    {
        var handler = new ScriptedHandler()
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError);
        var publisher = new FakePublisher();

        var published = await IngestorServices.Runner(handler, publisher).RunAsync(CancellationToken.None);

        handler.Calls.ShouldBe(4);
        published.ShouldBeFalse();
        publisher.Published.ShouldBeEmpty();
    }

    [Fact]
    public async Task Skips_unknown_meter_types_but_publishes_the_rest()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.OK, SampleMeters.WithUnknownType);
        var publisher = new FakePublisher();

        var published = await IngestorServices.Runner(handler, publisher).RunAsync(CancellationToken.None);

        published.ShouldBeTrue();
        publisher.MessagesOf<MeterMessage>().ShouldHaveSingleItem().Readings.Count.ShouldBe(1);
    }
}
