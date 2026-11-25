using System.Text.Json;

namespace WeakCollector.Messaging.Messages;

public sealed record MetersPolled(Guid PollId, DateTimeOffset PolledAt, IReadOnlyList<Meter> Meters);

public sealed record Meter(string Type, string Location, JsonElement Payload);
