namespace WeakCollector.Contracts.Messages;

public sealed record IngestAttempt(
    DateTimeOffset AttemptedAt,
    bool Success,
    int? StatusCode,
    long LatencyMs,
    string? Error);
