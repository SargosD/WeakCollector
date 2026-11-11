namespace WeakCollector.Messaging.Messages;

public sealed record MetersPolled(Guid PollId, DateTimeOffset PolledAt, IReadOnlyList<Meter> Meters);
