using Microsoft.Extensions.Options;
using WeakCollector.Ingestor.WeakApi;

namespace WeakCollector.Ingestor.Polling;

internal sealed class MeterPoller(
    IngestRunner runner,
    IOptions<WeakApiOptions> options,
    TimeProvider timeProvider,
    ILogger<MeterPoller> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var interval = TimeSpan.FromSeconds(options.Value.PollIntervalSeconds);
        logger.LogInformation("Polling {BaseUrl} every {Interval}", options.Value.BaseUrl, interval);

        using var timer = new PeriodicTimer(interval, timeProvider);
        do
        {
            try
            {
                await runner.RunOnceAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ingest cycle failed");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
