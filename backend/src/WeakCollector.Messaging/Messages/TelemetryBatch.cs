namespace WeakCollector.Messaging.Messages;

public sealed record TelemetryBatch(Guid BatchId, DateTimeOffset ObservedAt, IReadOnlyList<TelemetryRecord> Records);
