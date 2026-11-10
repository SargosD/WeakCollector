using Polly.CircuitBreaker;
using Polly.Timeout;
using WeakCollector.Ingestor.WeakApi;
using WeakCollector.Messaging.Publishing;
using WeakCollector.Messaging.Topology;

namespace WeakCollector.Ingestor.Polling;

internal sealed class IngestRunner(
    WeakApiClient client,
    IMessagePublisher publisher,
    TimeProvider timeProvider,
    ILogger<IngestRunner> logger)
{
    public async Task<bool> RunAsync(CancellationToken cancellationToken)
    {
        var observedAt = timeProvider.GetUtcNow();
        var started = timeProvider.GetTimestamp();

        try
        {
            var meters = await client.GetMetersAsync(cancellationToken);
            var (batch, unknownTypes) = TelemetryMapper.ToBatch(meters, observedAt);

            foreach (var unknownType in unknownTypes)
            {
                logger.LogWarning("Skipped record with unknown meter type {MeterType}", unknownType);
            }

            await publisher.PublishAsync(TopologyNames.RawExchange, TopologyNames.TelemetryReceivedKey, batch, cancellationToken);

            logger.LogInformation(
                "Published batch {BatchId} with {RecordCount} records in {LatencyMs} ms",
                batch.BatchId,
                batch.Records.Count,
                (long)timeProvider.GetElapsedTime(started).TotalMilliseconds);
            return true;
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning("Poll failed with status {StatusCode}: {Error}", (int?)ex.StatusCode, ex.Message);
        }
        catch (BrokenCircuitException)
        {
            logger.LogWarning("Poll skipped because the circuit is open");
        }
        catch (TimeoutRejectedException)
        {
            logger.LogWarning("Poll timed out");
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("Poll timed out");
        }

        return false;
    }
}
