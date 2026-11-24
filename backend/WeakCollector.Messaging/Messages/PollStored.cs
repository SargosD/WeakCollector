namespace WeakCollector.Messaging.Messages;

public sealed record PollStored(Guid PollId, DateTimeOffset PolledAt, IReadOnlyList<StoredReading> Readings);
