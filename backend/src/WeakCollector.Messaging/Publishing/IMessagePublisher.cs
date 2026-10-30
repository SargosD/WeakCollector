namespace WeakCollector.Messaging.Publishing;

public interface IMessagePublisher
{
    public Task PublishAsync<TMessage>(string exchange, string routingKey, TMessage message, CancellationToken cancellationToken)
        where TMessage : class;
}
