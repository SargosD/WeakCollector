using MassTransit;
using Microsoft.AspNetCore.SignalR;
using WeakCollector.Messaging.Messages;
using WeakCollector.Notifier.Hubs;

namespace WeakCollector.Notifier.Consumers;

internal sealed class PollStoredConsumer(
    IHubContext<PollsHub, IPollsClient> hub,
    ILogger<PollStoredConsumer> logger) : IConsumer<PollStored>
{
    public async Task Consume(ConsumeContext<PollStored> context)
    {
        await hub.Clients.All.PollStored(context.Message);

        logger.LogInformation("Broadcast poll {PollId}", context.Message.PollId);
    }
}
