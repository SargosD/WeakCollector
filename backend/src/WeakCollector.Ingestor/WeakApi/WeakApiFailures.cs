using System.Net;
using Polly;
using Polly.Timeout;

namespace WeakCollector.Ingestor.WeakApi;

internal static class WeakApiFailures
{
    public static bool IsTransient(Outcome<HttpResponseMessage> outcome)
    {
        if (outcome.Exception is not null)
        {
            return outcome.Exception is HttpRequestException or TimeoutRejectedException or IOException;
        }

        if (outcome.Result is null)
        {
            return false;
        }

        var status = outcome.Result.StatusCode;
        return (int)status >= 500 || status == HttpStatusCode.RequestTimeout;
    }
}
