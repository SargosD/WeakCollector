using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using WeakCollector.Notifier.Hubs;

namespace WeakCollector.Notifier.Tests.Hubs;

public class PollsHubTests
{
    [Fact]
    public void Hub_context_builds_the_typed_client()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSignalR();
        using var provider = services.BuildServiceProvider(true);

        var hub = provider.GetRequiredService<IHubContext<PollsHub, IPollsClient>>();

        hub.ShouldNotBeNull();
    }
}
