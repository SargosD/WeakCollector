using System.Text.Json;
using WeakCollector.Data;

namespace WeakCollector.Processor.Consumers;

internal static class PayloadMeasurements
{
    public static List<Measurement> Read(JsonElement payload) =>
        payload.ValueKind == JsonValueKind.Object
            ? [.. payload.EnumerateObject().Select(ToMeasurement)]
            : [];

    private static Measurement ToMeasurement(JsonProperty property) => new()
    {
        Name = property.Name,
        Value = ToValue(property.Value),
        ValueType = ToValueType(property.Value),
    };

    private static string ToValue(JsonElement element) => element.ValueKind == JsonValueKind.String
        ? element.GetString()!
        : element.GetRawText();

    private static MeasurementValueType ToValueType(JsonElement element) => element.ValueKind switch
    {
        JsonValueKind.Number => MeasurementValueType.Number,
        JsonValueKind.True or JsonValueKind.False => MeasurementValueType.Boolean,
        _ => MeasurementValueType.Text,
    };
}
