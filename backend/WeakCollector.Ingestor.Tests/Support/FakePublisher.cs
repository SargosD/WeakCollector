using WeakCollector.Messaging.Publishing;

namespace WeakCollector.Ingestor.Tests.Support;

internal sealed class FakePublisher : IMessagePublisher
{
    public List<PublishedMessage> Published { get; } = [];

    public Task PublishAsync<TMessage>(string exchange, string routingKey, TMessage message, CancellationToken cancellationToken)
        where TMessage : class
    {
        Published.Add(new PublishedMessage(exchange, routingKey, message));
        return Task.CompletedTask;
    }

    public IReadOnlyList<TMessage> MessagesOf<TMessage>() => Published.Select(p => p.Message).OfType<TMessage>().ToList();

    internal sealed record PublishedMessage(string Exchange, string RoutingKey, object Message);
}
