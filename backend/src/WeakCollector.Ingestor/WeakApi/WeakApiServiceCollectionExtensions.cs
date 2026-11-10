using System.Net;
using Microsoft.Extensions.Http.Resilience;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Timeout;
using WeakCollector.Common.Configuration;
using WeakCollector.Ingestor.Configuration;

namespace WeakCollector.Ingestor.WeakApi;

internal static class WeakApiServiceCollectionExtensions
{
    public static IHttpClientBuilder AddWeakApiClient(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<WeakApiOptions, WeakApiOptionsValidator>(configuration, WeakApiOptions.SectionName);

        var httpClientBuilder = services.AddHttpClient<WeakApiClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<WeakApiOptions>>().Value;
            client.BaseAddress = new Uri(options.BaseUrl);
            client.DefaultRequestHeaders.Add("X-Api-Key", options.ApiKey);
        });

        httpClientBuilder.AddResilienceHandler("weak-api", (builder, context) =>
            {
                var options = context.ServiceProvider.GetRequiredService<IOptions<WeakApiOptions>>().Value;

                builder.AddRetry(new HttpRetryStrategyOptions
                {
                    MaxRetryAttempts = options.RetryCount,
                    Delay = TimeSpan.FromMilliseconds(options.RetryDelayMilliseconds),
                    BackoffType = DelayBackoffType.Exponential,
                    UseJitter = true,
                    ShouldHandle = args => ValueTask.FromResult(IsTransient(args.Outcome)),
                });

                builder.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
                {
                    FailureRatio = 0.9,
                    MinimumThroughput = 10,
                    SamplingDuration = TimeSpan.FromSeconds(60),
                    BreakDuration = TimeSpan.FromSeconds(30),
                    ShouldHandle = args => ValueTask.FromResult(IsTransient(args.Outcome)),
                });

                builder.AddTimeout(TimeSpan.FromSeconds(options.AttemptTimeoutSeconds));
            });

        return httpClientBuilder;
    }

    private static bool IsTransient(Outcome<HttpResponseMessage> outcome)
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
