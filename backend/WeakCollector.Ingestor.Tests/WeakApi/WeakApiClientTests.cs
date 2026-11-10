using System.Net;
using WeakCollector.Ingestor.Tests.Support;

namespace WeakCollector.Ingestor.Tests.WeakApi;

public class WeakApiClientTests
{
    [Fact]
    public async Task Retries_server_errors_until_success()
    {
        var handler = new ScriptedHandler()
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.BadGateway)
            .Respond(HttpStatusCode.OK, SampleMeters.ThreeTypes);

        var meters = await IngestorServices.Client(handler).GetMetersAsync(CancellationToken.None);

        handler.Calls.ShouldBe(3);
        meters.Count.ShouldBe(3);
    }

    [Fact]
    public async Task Retries_dropped_connection()
    {
        var handler = new ScriptedHandler()
            .Throw(new HttpRequestException("The response ended prematurely.", new IOException()))
            .Respond(HttpStatusCode.OK, SampleMeters.ThreeTypes);

        var meters = await IngestorServices.Client(handler).GetMetersAsync(CancellationToken.None);

        handler.Calls.ShouldBe(2);
        meters.Count.ShouldBe(3);
    }

    [Fact]
    public async Task Does_not_retry_rate_limit()
    {
        var handler = new ScriptedHandler().Respond(HttpStatusCode.TooManyRequests);

        var exception = await Should.ThrowAsync<HttpRequestException>(
            () => IngestorServices.Client(handler).GetMetersAsync(CancellationToken.None));

        handler.Calls.ShouldBe(1);
        exception.StatusCode.ShouldBe(HttpStatusCode.TooManyRequests);
    }

    [Fact]
    public async Task Gives_up_after_configured_retries()
    {
        var handler = new ScriptedHandler()
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.InternalServerError)
            .Respond(HttpStatusCode.GatewayTimeout);

        var exception = await Should.ThrowAsync<HttpRequestException>(
            () => IngestorServices.Client(handler).GetMetersAsync(CancellationToken.None));

        handler.Calls.ShouldBe(4);
        exception.StatusCode.ShouldBe(HttpStatusCode.GatewayTimeout);
    }

    [Fact]
    public async Task Sends_api_key_header()
    {
        HttpRequestMessage? captured = null;
        var handler = new CapturingHandler(request => captured = request, SampleMeters.ThreeTypes);

        await IngestorServices.Client(handler).GetMetersAsync(CancellationToken.None);

        captured.ShouldNotBeNull();
        captured.RequestUri.ShouldBe(new Uri("http://weak-api.test/meters"));
        captured.Headers.GetValues("X-Api-Key").ShouldBe(["test-key"]);
    }
}
