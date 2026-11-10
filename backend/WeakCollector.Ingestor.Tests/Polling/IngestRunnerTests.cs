using System.Net;
using MassTransit.Testing;
using Microsoft.Extensions.DependencyInjection;
using WeakCollector.Ingestor.Polling;
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
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        published.ShouldBeTrue();
        var message = PublishedBatches(services).ShouldHaveSingleItem();
        message.Context.Message.Readings.Count.ShouldBe(3);
        message.Context.DestinationAddress.ShouldNotBeNull().AbsolutePath.ShouldEndWith(TopologyNames.MetersPolledExchange);
    }

    [Fact]
    public async Task Publishes_batch_after_retries()
    {
        var handler = new ScriptedHandler()
            .Respond(HttpStatusCode.InternalServerError)
            .Throw(new HttpRequestException("The response ended prematurely.", new IOException()))
            .Respond(HttpStatusCode.OK, SampleMeters.ThreeTypes);
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        handler.Calls.ShouldBe(3);
        published.ShouldBeTrue();
        PublishedBatches(services).Count.ShouldBe(1);
    }

    [Fact]
    public async Task Publishes_nothing_on_rate_limit()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.TooManyRequests);
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        handler.Calls.ShouldBe(1);
        published.ShouldBeFalse();
        PublishedBatches(services).ShouldBeEmpty();
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
        PublishedBatches(services).ShouldBeEmpty();
    }

    [Fact]
    public async Task Skips_unknown_meter_types_but_publishes_the_rest()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.OK, SampleMeters.WithUnknownType);
        await using var services = await IngestorServices.StartAsync(handler);

        var published = await services.GetRequiredService<IngestRunner>().RunAsync(CancellationToken.None);

        published.ShouldBeTrue();
        PublishedBatches(services).ShouldHaveSingleItem().Context.Message.Readings.Count.ShouldBe(1);
    }

    private static List<IPublishedMessage<MetersPolled>> PublishedBatches(IServiceProvider services) =>
        services.GetRequiredService<ITestHarness>().Published.Select<MetersPolled>().ToList();
}
