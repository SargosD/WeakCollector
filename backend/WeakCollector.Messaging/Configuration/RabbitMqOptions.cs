namespace WeakCollector.Messaging.Configuration;

public sealed class RabbitMqOptions
{
    public const string SectionName = "RabbitMq";

    public string Host { get; set; } = "localhost";

    public int Port { get; set; } = 5672;

    public string User { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string VirtualHost { get; set; } = "/";

    public int RetryCount { get; set; } = 5;

    public int RetryDelaySeconds { get; set; } = 1;

    public int MaxRetryDelaySeconds { get; set; } = 30;
}
