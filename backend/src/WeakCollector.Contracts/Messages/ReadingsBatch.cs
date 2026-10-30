namespace WeakCollector.Contracts.Messages;

public sealed record ReadingsBatch(Guid BatchId, DateTimeOffset ObservedAt, IReadOnlyList<Reading> Readings);
