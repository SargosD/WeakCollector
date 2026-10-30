using System.Net;
using WeakCollector.Contracts.Messages;
using WeakCollector.Contracts.Topology;
using WeakCollector.Ingestor.Tests.Support;

namespace WeakCollector.Ingestor.Tests.Polling;

public class IngestRunnerTests
{
    [Fact]
    public async Task Publishes_batch_and_successful_attempt()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.OK, SampleMeters.ThreeTypes);
        var publisher = new FakePublisher();

        var attempt = await IngestorServices.Runner(handler, publisher).RunOnceAsync(CancellationToken.None);

        attempt.Success.ShouldBeTrue();
        attempt.StatusCode.ShouldBe(200);

        var batch = publisher.MessagesOf<ReadingsBatch>().ShouldHaveSingleItem();
        batch.Readings.Count.ShouldBe(3);
        batch.ObservedAt.ShouldBe(attempt.AttemptedAt);

        publisher.MessagesOf<IngestAttempt>().ShouldHaveSingleItem().ShouldBe(attempt);
        publisher.Published.Select(p => (p.Exchange, p.RoutingKey)).ShouldBe(
        [
            (MessagingTopology.RawExchange, MessagingTopology.ReadingsBatchKey),
            (MessagingTopology.RawExchange, MessagingTopology.IngestAttemptKey),
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

        var attempt = await IngestorServices.Runner(handler, publisher).RunOnceAsync(CancellationToken.None);

        handler.Calls.ShouldBe(3);
        attempt.Success.ShouldBeTrue();
        publisher.MessagesOf<ReadingsBatch>().Count.ShouldBe(1);
    }

    [Fact]
    public async Task Records_failed_attempt_on_rate_limit_without_batch()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.TooManyRequests);
        var publisher = new FakePublisher();

        var attempt = await IngestorServices.Runner(handler, publisher).RunOnceAsync(CancellationToken.None);

        handler.Calls.ShouldBe(1);
        attempt.Success.ShouldBeFalse();
        attempt.StatusCode.ShouldBe(429);
        attempt.Error.ShouldNotBeNullOrEmpty();
        publisher.MessagesOf<ReadingsBatch>().ShouldBeEmpty();
        publisher.MessagesOf<IngestAttempt>().ShouldHaveSingleItem();
    }

    [Fact]
    public async Task Records_failed_attempt_when_retries_are_exhausted()
    {
        var handler = new ScriptedHandler()
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError);
        var publisher = new FakePublisher();

        var attempt = await IngestorServices.Runner(handler, publisher).RunOnceAsync(CancellationToken.None);

        handler.Calls.ShouldBe(4);
        attempt.Success.ShouldBeFalse();
        attempt.StatusCode.ShouldBe(500);
        publisher.MessagesOf<ReadingsBatch>().ShouldBeEmpty();
    }

    [Fact]
    public async Task Skips_unknown_meter_types_but_publishes_the_rest()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.OK, SampleMeters.WithUnknownType);
        var publisher = new FakePublisher();

        var attempt = await IngestorServices.Runner(handler, publisher).RunOnceAsync(CancellationToken.None);

        attempt.Success.ShouldBeTrue();
        publisher.MessagesOf<ReadingsBatch>().ShouldHaveSingleItem().Readings.Count.ShouldBe(1);
    }
}
