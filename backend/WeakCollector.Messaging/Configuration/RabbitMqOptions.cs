using System.ComponentModel.DataAnnotations;

namespace WeakCollector.Messaging.Configuration;

public sealed class RabbitMqOptions
{
    public const string SectionName = "RabbitMq";

    [Required]
    public string Host { get; set; } = "localhost";

    [Range(1, 65535)]
    public int Port { get; set; } = 5672;

    [Required]
    public string User { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string VirtualHost { get; set; } = "/";

    [Range(0, 10)]
    public int RetryCount { get; set; } = 5;

    [Range(1, int.MaxValue)]
    public int RetryDelaySeconds { get; set; } = 1;

    public int MaxRetryDelaySeconds { get; set; } = 30;
}
