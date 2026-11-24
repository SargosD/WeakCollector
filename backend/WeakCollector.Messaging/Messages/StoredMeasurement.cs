namespace WeakCollector.Messaging.Messages;

public sealed record StoredMeasurement(long Id, string Name, string Value, string ValueType);
