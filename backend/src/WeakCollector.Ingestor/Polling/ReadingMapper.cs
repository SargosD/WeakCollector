using WeakCollector.Contracts.Messages;
using WeakCollector.Ingestor.WeakApi;

namespace WeakCollector.Ingestor.Polling;

internal static class ReadingMapper
{
    public static MappedBatch ToBatch(IReadOnlyList<MeterDto> meters, DateTimeOffset observedAt)
    {
        var readings = new List<Reading>(meters.Count);
        var unknownTypes = new List<string>();

        foreach (var meter in meters)
        {
            if (TryParseType(meter.Type, out var type))
            {
                readings.Add(new Reading(type, meter.Name, meter.Payload));
            }
            else
            {
                unknownTypes.Add(meter.Type);
            }
        }

        return new MappedBatch(new ReadingsBatch(Guid.NewGuid(), observedAt, readings), unknownTypes);
    }

    private static bool TryParseType(string value, out MeterType type)
    {
        switch (value.ToUpperInvariant())
        {
            case "AIR_QUALITY":
                type = MeterType.AirQuality;
                return true;
            case "ENERGY":
                type = MeterType.Energy;
                return true;
            case "MOTION":
                type = MeterType.Motion;
                return true;
            default:
                type = default;
                return false;
        }
    }
}
