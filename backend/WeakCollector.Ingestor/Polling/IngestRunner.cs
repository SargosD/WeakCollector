using System.Text.Json;
using MassTransit;
using Polly.CircuitBreaker;
using Polly.Timeout;
using WeakCollector.Ingestor.Models;
using WeakCollector.Ingestor.WeakApi;
using WeakCollector.Messaging.Messages;

namespace WeakCollector.Ingestor.Polling;

internal sealed class IngestRunner(
    WeakApiClient client,
    IBus bus,
    TimeProvider timeProvider,
    ILogger<IngestRunner> logger)
{
    public async Task<bool> RunAsync(CancellationToken cancellationToken)
    {
        try
        {
            var meters = await client.GetMetersAsync(cancellationToken);
            var polledAt = timeProvider.GetUtcNow();
            if (meters.Count == 0)
            {
                logger.LogWarning("Poll returned no meters");
                return false;
            }

            var message = CreateMetersPolledMessage(meters, polledAt);

            await bus.Publish(message, cancellationToken);

            return true;
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning("Poll failed with status {StatusCode}: {Error}", (int?)ex.StatusCode, ex.Message);
        }
        catch (JsonException ex)
        {
            logger.LogWarning("Poll returned invalid data: {Error}", ex.Message);
        }
        catch (BrokenCircuitException)
        {
            logger.LogWarning("Poll skipped because the circuit is open");
        }
        catch (Exception ex) when (ex is TimeoutRejectedException or OperationCanceledException && !cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Poll timed out");
        }

        return false;
    }

    private static MetersPolled CreateMetersPolledMessage(IReadOnlyList<MeterDto> meters, DateTimeOffset polledAt) =>
        new(Guid.NewGuid(), polledAt, [.. meters.Select(meter => new Meter(meter.Type, meter.Name, meter.Payload))]);
}
