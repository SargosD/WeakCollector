using System.Text.Json;

namespace WeakCollector.Ingestor.WeakApi;

internal sealed record MeterDto(string Type, string Name, JsonElement Payload);
