using RabbitMQ.Client;

namespace WeakCollector.Messaging.Topology;

public static class TopologyDeclarer
{
    public static async Task DeclareAsync(IChannel channel, CancellationToken cancellationToken)
    {
        await channel.ExchangeDeclareAsync(
            TopologyNames.RawExchange,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            cancellationToken: cancellationToken);

        await channel.ExchangeDeclareAsync(
            TopologyNames.ProcessedExchange,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            cancellationToken: cancellationToken);

        await channel.ExchangeDeclareAsync(
            TopologyNames.DeadLetterExchange,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            cancellationToken: cancellationToken);

        await channel.QueueDeclareAsync(
            TopologyNames.ProcessorDeadLetterQueue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            cancellationToken: cancellationToken);

        await channel.QueueBindAsync(
            TopologyNames.ProcessorDeadLetterQueue,
            TopologyNames.DeadLetterExchange,
            TopologyNames.TelemetryReceivedKey,
            cancellationToken: cancellationToken);

        var processQueueArguments = new Dictionary<string, object?>
        {
            ["x-dead-letter-exchange"] = TopologyNames.DeadLetterExchange,
        };

        await channel.QueueDeclareAsync(
            TopologyNames.ProcessorQueue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            processQueueArguments,
            cancellationToken: cancellationToken);

        await channel.QueueBindAsync(
            TopologyNames.ProcessorQueue,
            TopologyNames.RawExchange,
            TopologyNames.TelemetryReceivedKey,
            cancellationToken: cancellationToken);
    }
}
