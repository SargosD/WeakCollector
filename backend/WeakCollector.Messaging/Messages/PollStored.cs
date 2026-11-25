namespace WeakCollector.Messaging.Messages;

public sealed record PollStored(Guid PollId, DateTimeOffset PolledAt, IReadOnlyList<StoredReading> Readings);

public sealed record StoredReading(long Id, string Location, string Type, IReadOnlyList<StoredMeasurement> Measurements);

public sealed record StoredMeasurement(long Id, string Name, string Value, string ValueType);
