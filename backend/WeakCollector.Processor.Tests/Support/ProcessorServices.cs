using MassTransit;
using MassTransit.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WeakCollector.Data;
using WeakCollector.Processor.Consumers;

namespace WeakCollector.Processor.Tests.Support;

internal static class ProcessorServices
{
    public static async Task<ServiceProvider> StartAsync(string connectionString)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Database:ConnectionString"] = connectionString })
            .Build();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddWeakCollectorDatabase(configuration);
        services.AddMassTransitTestHarness(bus => bus.AddConsumer<MetersPolledConsumer>());

        var provider = services.BuildServiceProvider();
        await provider.GetRequiredService<ITestHarness>().Start();
        return provider;
    }
}
