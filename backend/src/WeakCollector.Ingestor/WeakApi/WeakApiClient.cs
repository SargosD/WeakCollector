using System.Net.Http.Json;
using WeakCollector.Contracts.Serialization;

namespace WeakCollector.Ingestor.WeakApi;

internal sealed class WeakApiClient(HttpClient http)
{
    public async Task<IReadOnlyList<MeterDto>> GetMetersAsync(CancellationToken cancellationToken)
    {
        using var response = await http.GetAsync("meters", cancellationToken);
        response.EnsureSuccessStatusCode();
        var meters = await response.Content.ReadFromJsonAsync<List<MeterDto>>(MessageJson.Options, cancellationToken);
        return meters ?? [];
    }
}
