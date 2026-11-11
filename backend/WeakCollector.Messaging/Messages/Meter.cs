using System.Text.Json;

namespace WeakCollector.Messaging.Messages;

public sealed record Meter(string Type, string Location, JsonElement Payload);
