namespace WeakCollector.Messaging.Messages;

public sealed record StoredReading(long Id, string Location, string Type, IReadOnlyList<StoredMeasurement> Measurements);
