using System.Text.Json;

namespace WeakCollector.Ingestor.WeakApi;

internal static class WeakApiJson
{
    public static JsonSerializerOptions Options { get; } = new(JsonSerializerDefaults.Web)
    {
        RespectNullableAnnotations = true,
        RespectRequiredConstructorParameters = true,
    };
}
