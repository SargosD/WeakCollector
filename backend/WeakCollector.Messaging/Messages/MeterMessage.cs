namespace WeakCollector.Messaging.Messages;

public sealed record MeterMessage(Guid BatchId, DateTimeOffset ObservedAt, IReadOnlyList<MeterReading> Readings);
