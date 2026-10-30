using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WeakCollector.Ingestor.WeakApi;

namespace WeakCollector.Ingestor.Tests.Support;

internal static class IngestorServices
{
    public static ServiceProvider Build(HttpMessageHandler handler, Dictionary<string, string?>? settings = null)
    {
        var values = new Dictionary<string, string?>
        {
            ["WeakApi:BaseUrl"] = "http://weak-api.test",
            ["WeakApi:ApiKey"] = "test-key",
            ["WeakApi:RetryCount"] = "3",
            ["WeakApi:RetryDelayMilliseconds"] = "1",
            ["WeakApi:AttemptTimeoutSeconds"] = "5",
        };

        foreach (var (key, value) in settings ?? [])
        {
            values[key] = value;
        }

        var configuration = new ConfigurationBuilder().AddInMemoryCollection(values).Build();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddWeakApiClient(configuration).ConfigurePrimaryHttpMessageHandler(() => handler);

        return services.BuildServiceProvider();
    }

    public static WeakApiClient Client(HttpMessageHandler handler) =>
        Build(handler).GetRequiredService<WeakApiClient>();
}
