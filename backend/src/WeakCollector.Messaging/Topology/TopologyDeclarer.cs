using RabbitMQ.Client;
using WeakCollector.Contracts.Topology;

namespace WeakCollector.Messaging.Topology;

public static class TopologyDeclarer
{
    public static async Task DeclareAsync(IChannel channel, CancellationToken cancellationToken)
    {
        await channel.ExchangeDeclareAsync(
            MessagingTopology.RawExchange,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            cancellationToken: cancellationToken);

        await channel.ExchangeDeclareAsync(
            MessagingTopology.StoredExchange,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            cancellationToken: cancellationToken);

        await channel.ExchangeDeclareAsync(
            MessagingTopology.DeadLetterExchange,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            cancellationToken: cancellationToken);

        await channel.QueueDeclareAsync(
            MessagingTopology.DeadLetterQueue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            cancellationToken: cancellationToken);

        await channel.QueueBindAsync(
            MessagingTopology.DeadLetterQueue,
            MessagingTopology.DeadLetterExchange,
            "#",
            cancellationToken: cancellationToken);

        var processQueueArguments = new Dictionary<string, object?>
        {
            ["x-dead-letter-exchange"] = MessagingTopology.DeadLetterExchange,
        };

        await channel.QueueDeclareAsync(
            MessagingTopology.ProcessQueue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            processQueueArguments,
            cancellationToken: cancellationToken);

        await channel.QueueBindAsync(
            MessagingTopology.ProcessQueue,
            MessagingTopology.RawExchange,
            "#",
            cancellationToken: cancellationToken);
    }
}
