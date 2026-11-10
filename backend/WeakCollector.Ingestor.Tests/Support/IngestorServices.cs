using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WeakCollector.Ingestor.Polling;
using WeakCollector.Ingestor.WeakApi;
using WeakCollector.Messaging.Publishing;

namespace WeakCollector.Ingestor.Tests.Support;

internal static class IngestorServices
{
    public static ServiceProvider Build(HttpMessageHandler handler, FakePublisher publisher, Dictionary<string, string?>? settings = null)
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
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<IMessagePublisher>(publisher);
        services.AddSingleton<IngestRunner>();
        services.AddWeakApiClient(configuration).ConfigurePrimaryHttpMessageHandler(() => handler);

        return services.BuildServiceProvider();
    }

    public static IngestRunner Runner(HttpMessageHandler handler, FakePublisher publisher) =>
        Build(handler, publisher).GetRequiredService<IngestRunner>();

    public static WeakApiClient Client(HttpMessageHandler handler) =>
        Build(handler, new FakePublisher()).GetRequiredService<WeakApiClient>();
}
