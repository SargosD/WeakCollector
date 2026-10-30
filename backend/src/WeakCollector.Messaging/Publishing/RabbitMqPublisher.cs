using System.Text.Json;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using WeakCollector.Contracts.Serialization;
using WeakCollector.Messaging.Connections;
using WeakCollector.Messaging.Topology;

namespace WeakCollector.Messaging.Publishing;

public sealed class RabbitMqPublisher(RabbitMqConnection connection, ILogger<RabbitMqPublisher> logger) : IMessagePublisher, IAsyncDisposable
{
    private readonly SemaphoreSlim _gate = new(1, 1);
    private IChannel? _channel;

    public async Task PublishAsync<TMessage>(string exchange, string routingKey, TMessage message, CancellationToken cancellationToken)
        where TMessage : class
    {
        var body = JsonSerializer.SerializeToUtf8Bytes(message, MessageJson.Options);
        var properties = new BasicProperties
        {
            ContentType = "application/json",
            DeliveryMode = DeliveryModes.Persistent,
            MessageId = Guid.NewGuid().ToString(),
            Type = typeof(TMessage).Name,
            Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds()),
        };

        await _gate.WaitAsync(cancellationToken);
        try
        {
            var channel = await GetChannelAsync(cancellationToken);
            try
            {
                await channel.BasicPublishAsync(exchange, routingKey, mandatory: false, properties, body, cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogWarning(ex, "Publish to {Exchange}/{RoutingKey} failed, channel will be recreated", exchange, routingKey);
                await ResetChannelAsync();
                throw;
            }
        }
        finally
        {
            _gate.Release();
        }
    }

    public async ValueTask DisposeAsync()
    {
        await ResetChannelAsync();
        _gate.Dispose();
    }

    private async Task<IChannel> GetChannelAsync(CancellationToken cancellationToken)
    {
        if (_channel is { IsOpen: true })
        {
            return _channel;
        }

        await ResetChannelAsync();

        var rabbit = await connection.GetConnectionAsync(cancellationToken);
        var options = new CreateChannelOptions(publisherConfirmationsEnabled: true, publisherConfirmationTrackingEnabled: true);
        _channel = await rabbit.CreateChannelAsync(options, cancellationToken);
        await TopologyDeclarer.DeclareAsync(_channel, cancellationToken);
        return _channel;
    }

    private async Task ResetChannelAsync()
    {
        if (_channel is null)
        {
            return;
        }

        var channel = _channel;
        _channel = null;
        await channel.DisposeAsync();
    }
}
