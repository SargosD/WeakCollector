namespace WeakCollector.Data;

public sealed class MeterReading
{
    public long Id { get; init; }

    public required Guid PollId { get; init; }

    public required DateTimeOffset PolledAt { get; init; }

    public required string Type { get; init; }

    public long LocationId { get; init; }

    public required Location Location { get; init; }

    public List<Measurement> Measurements { get; init; } = [];
}
