using System.Net;
using System.Text;

namespace WeakCollector.Ingestor.Tests.Support;

internal sealed class ScriptedHandler : HttpMessageHandler
{
    private readonly Queue<Func<HttpResponseMessage>> _steps = new();

    public int Calls { get; private set; }

    public ScriptedHandler Respond(HttpStatusCode status, string body = "")
    {
        _steps.Enqueue(() => new HttpResponseMessage(status)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        });
        return this;
    }

    public ScriptedHandler Throw(Exception exception)
    {
        _steps.Enqueue(() => throw exception);
        return this;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Calls++;
        if (_steps.Count == 0)
        {
            throw new InvalidOperationException($"No scripted response left for call {Calls}");
        }

        return Task.FromResult(_steps.Dequeue()());
    }
}
