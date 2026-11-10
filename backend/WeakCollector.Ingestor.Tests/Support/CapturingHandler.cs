using System.Net;
using System.Text;

namespace WeakCollector.Ingestor.Tests.Support;

internal sealed class CapturingHandler(Action<HttpRequestMessage> capture, string body) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        capture(request);
        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        });
    }
}
