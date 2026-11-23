namespace WeakCollector.Data;

public sealed class Measurement
{
    public long Id { get; init; }

    public long MeterReadingId { get; init; }

    public required string Name { get; init; }

    public required string Value { get; init; }

    public required MeasurementValueType ValueType { get; init; }

    public MeterReading MeterReading { get; init; } = null!;
}
