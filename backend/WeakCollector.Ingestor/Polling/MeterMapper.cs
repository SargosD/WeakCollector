using WeakCollector.Ingestor.Models;
using WeakCollector.Messaging.Messages;

namespace WeakCollector.Ingestor.Polling;

internal static class MeterMapper
{
    public static (MeterMessage Batch, IReadOnlyList<string> UnknownTypes) ToBatch(IReadOnlyList<MeterDto> meters, DateTimeOffset observedAt)
    {
        var readings = new List<MeterReading>(meters.Count);
        var unknownTypes = new List<string>();

        foreach (var meter in meters)
        {
            if (TryParseType(meter.Type, out var type))
            {
                readings.Add(new MeterReading(type, meter.Name, meter.Payload));
            }
            else
            {
                unknownTypes.Add(meter.Type);
            }
        }

        return (new MeterMessage(Guid.NewGuid(), observedAt, readings), unknownTypes);
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
