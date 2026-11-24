using WeakCollector.Data;
using WeakCollector.Messaging.Messages;

namespace WeakCollector.Processor.Extensions;

internal static class MeterReadingExtensions
{
    public static StoredReading ToStoredReading(this MeterReading reading) =>
        new(reading.Id, reading.Location, reading.Type, [.. reading.Measurements.Select(ToStoredMeasurement)]);

    private static StoredMeasurement ToStoredMeasurement(Measurement measurement) =>
        new(measurement.Id, measurement.Name, measurement.Value, measurement.ValueType.ToString().ToUpperInvariant());
}
