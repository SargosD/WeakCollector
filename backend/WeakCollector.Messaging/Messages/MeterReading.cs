using System.Text.Json;

namespace WeakCollector.Messaging.Messages;

public sealed record MeterReading(MeterType Type, string Location, JsonElement Payload);
