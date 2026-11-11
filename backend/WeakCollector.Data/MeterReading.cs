using System.Text.Json;

namespace WeakCollector.Data;

public sealed class MeterReading
{
    public long Id { get; init; }

    public required Guid PollId { get; init; }

    public required DateTimeOffset PolledAt { get; init; }

    public required string Type { get; init; }

    public required string Location { get; init; }

    public required JsonDocument Payload { get; init; }
}
