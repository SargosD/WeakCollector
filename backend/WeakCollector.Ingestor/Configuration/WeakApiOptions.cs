using System.ComponentModel.DataAnnotations;

namespace WeakCollector.Ingestor.Configuration;

public sealed class WeakApiOptions
{
    public const string SectionName = "WeakApi";

    [Required]
    [RegularExpression(@"https?://\S+", ErrorMessage = "BaseUrl must be an absolute http or https URL.")]
    public string BaseUrl { get; set; } = string.Empty;

    [Required]
    public string ApiKey { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int PollIntervalSeconds { get; set; } = 10;

    [Range(1, int.MaxValue)]
    public int AttemptTimeoutSeconds { get; set; } = 5;

    [Range(0, 10)]
    public int RetryCount { get; set; } = 3;

    [Range(0, int.MaxValue)]
    public int RetryDelayMilliseconds { get; set; } = 500;
}
