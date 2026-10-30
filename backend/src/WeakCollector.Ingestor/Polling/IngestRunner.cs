using Polly.CircuitBreaker;
using Polly.Timeout;
using WeakCollector.Contracts.Messages;
using WeakCollector.Contracts.Topology;
using WeakCollector.Ingestor.WeakApi;
using WeakCollector.Messaging.Publishing;

namespace WeakCollector.Ingestor.Polling;

internal sealed class IngestRunner(
    WeakApiClient client,
    IMessagePublisher publisher,
    TimeProvider timeProvider,
    ILogger<IngestRunner> logger)
{
    public async Task<IngestAttempt> RunOnceAsync(CancellationToken cancellationToken)
    {
        var attemptedAt = timeProvider.GetUtcNow();
        var started = timeProvider.GetTimestamp();
        IngestAttempt attempt;

        try
        {
            var meters = await client.GetMetersAsync(cancellationToken);
            var mapped = ReadingMapper.ToBatch(meters, attemptedAt);

            foreach (var unknownType in mapped.UnknownTypes)
            {
                logger.LogWarning("Skipped reading with unknown meter type {MeterType}", unknownType);
            }

            await publisher.PublishAsync(MessagingTopology.RawExchange, MessagingTopology.ReadingsBatchKey, mapped.Batch, cancellationToken);

            attempt = new IngestAttempt(attemptedAt, true, 200, ElapsedMs(started), null);
            logger.LogInformation(
                "Published batch {BatchId} with {ReadingCount} readings in {LatencyMs} ms",
                mapped.Batch.BatchId,
                mapped.Batch.Readings.Count,
                attempt.LatencyMs);
        }
        catch (HttpRequestException ex)
        {
            attempt = Failed(attemptedAt, started, (int?)ex.StatusCode, ex.Message);
            logger.LogWarning("Poll failed with status {StatusCode}: {Error}", attempt.StatusCode, ex.Message);
        }
        catch (BrokenCircuitException)
        {
            attempt = Failed(attemptedAt, started, null, "Circuit open");
            logger.LogWarning("Poll skipped because the circuit is open");
        }
        catch (TimeoutRejectedException)
        {
            attempt = Failed(attemptedAt, started, null, "Timeout");
            logger.LogWarning("Poll timed out");
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            attempt = Failed(attemptedAt, started, null, "Timeout");
            logger.LogWarning("Poll timed out");
        }

        await publisher.PublishAsync(MessagingTopology.RawExchange, MessagingTopology.IngestAttemptKey, attempt, cancellationToken);
        return attempt;
    }

    private IngestAttempt Failed(DateTimeOffset attemptedAt, long started, int? statusCode, string error) =>
        new(attemptedAt, false, statusCode, ElapsedMs(started), error);

    private long ElapsedMs(long started) => (long)timeProvider.GetElapsedTime(started).TotalMilliseconds;
}
