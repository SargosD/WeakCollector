using System.Text.Json;
using System.Text.Json.Serialization;

namespace WeakCollector.Contracts.Serialization;

public static class MessageJson
{
    public static JsonSerializerOptions Options { get; } = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };
}
