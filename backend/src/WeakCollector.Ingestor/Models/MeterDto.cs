using System.Text.Json;

namespace WeakCollector.Ingestor.Models;

internal sealed record MeterDto(string Type, string Name, JsonElement Payload);
