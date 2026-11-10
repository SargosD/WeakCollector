using System.Text.Json;

namespace WeakCollector.Messaging.Messages;

public sealed record TelemetryRecord(MeterType Type, string Location, JsonElement Payload);
