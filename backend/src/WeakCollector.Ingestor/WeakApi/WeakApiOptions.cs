namespace WeakCollector.Ingestor.WeakApi;

public sealed class WeakApiOptions
{
    public const string SectionName = "WeakApi";

    public string BaseUrl { get; set; } = string.Empty;

    public string ApiKey { get; set; } = string.Empty;

    public int PollIntervalSeconds { get; set; } = 10;

    public int AttemptTimeoutSeconds { get; set; } = 5;

    public int RetryCount { get; set; } = 3;

    public int RetryDelayMilliseconds { get; set; } = 500;
}
