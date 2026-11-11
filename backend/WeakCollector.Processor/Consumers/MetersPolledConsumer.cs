using MassTransit;
using WeakCollector.Messaging.Messages;

namespace WeakCollector.Processor.Consumers;

internal sealed class MetersPolledConsumer(ILogger<MetersPolledConsumer> logger) : IConsumer<MetersPolled>
{
    public Task Consume(ConsumeContext<MetersPolled> context)
    {
        var message = context.Message;

        logger.LogInformation("Consumed poll {PollId} with {MeterCount} meters", message.PollId, message.Meters.Count);

        return Task.CompletedTask;
    }
}
