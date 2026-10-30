using System.Text.Json;

namespace WeakCollector.Contracts.Messages;

public sealed record Reading(MeterType Type, string Location, JsonElement Payload);
