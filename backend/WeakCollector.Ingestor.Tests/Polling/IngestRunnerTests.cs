using System.Net;
using MassTransit.Testing;
using Microsoft.Extensions.DependencyInjection;
using WeakCollector.Ingestor.Polling;
using WeakCollector.Ingestor.Tests.Support;
using WeakCollector.Messaging.Messages;

namespace WeakCollector.Ingestor.Tests.Polling;

public class IngestRunnerTests
{
    [Fact]
    public async Task Publishes_polled_meters()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.OK, SampleMeters.ThreeTypes);
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        published.ShouldBeTrue();
        PublishedPolls(services).ShouldHaveSingleItem().Context.Message.Meters.Count.ShouldBe(3);
    }

    [Fact]
    public async Task Publishes_polled_meters_after_retries()
    {
        var handler = new ScriptedHandler()
            .Respond(HttpStatusCode.InternalServerError)
            .Throw(new HttpRequestException("The response ended prematurely.", new IOException()))
            .Respond(HttpStatusCode.OK, SampleMeters.ThreeTypes);
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        handler.Calls.ShouldBe(3);
        published.ShouldBeTrue();
        PublishedPolls(services).Count.ShouldBe(1);
    }

    [Fact]
    public async Task Publishes_nothing_on_rate_limit()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.TooManyRequests);
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        handler.Calls.ShouldBe(1);
        published.ShouldBeFalse();
        PublishedPolls(services).ShouldBeEmpty();
    }

    [Fact]
    public async Task Publishes_nothing_when_retries_are_exhausted()
    {
        var handler = new ScriptedHandler()
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError);
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        handler.Calls.ShouldBe(4);
        published.ShouldBeFalse();
        PublishedPolls(services).ShouldBeEmpty();
    }

    [Fact]
    public async Task Publishes_unknown_meter_types_as_received()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.OK, SampleMeters.WithUnknownType);
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        published.ShouldBeTrue();
        PublishedPolls(services).ShouldHaveSingleItem().Context.Message.Meters.Select(meter => meter.Type).ShouldBe(["energy", "water"]);
    }

    [Theory]
    [InlineData(SampleMeters.Corrupted)]
    [InlineData(SampleMeters.MissingPayload)]
    [InlineData(SampleMeters.NullName)]
    [InlineData("[]")]
    public async Task Publishes_nothing_when_response_is_invalid(string body)
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.OK, body);
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        handler.Calls.ShouldBe(1);
        published.ShouldBeFalse();
        PublishedPolls(services).ShouldBeEmpty();
    }

    private static List<IPublishedMessage<MetersPolled>> PublishedPolls(IServiceProvider services) =>
        services.GetRequiredService<ITestHarness>().Published.Select<MetersPolled>().ToList();
}
