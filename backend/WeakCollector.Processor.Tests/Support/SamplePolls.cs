using System.Text.Json;
using WeakCollector.Messaging.Messages;

namespace WeakCollector.Processor.Tests.Support;

internal static class SamplePolls
{
    public static readonly DateTimeOffset PolledAt = new(2026, 11, 20, 12, 0, 0, TimeSpan.Zero);

    public static MetersPolled TwoMeters(Guid? pollId = null) =>
        new(
            pollId ?? Guid.NewGuid(),
            PolledAt,
            [
                new Meter("air_quality", "Garage", Payload("""{"co2":330,"pm25":22,"humidity":32}""")),
                new Meter("energy", "Bedroom", Payload("""{"energy":819.12}""")),
            ]);

    public static JsonElement Payload(string json) => JsonDocument.Parse(json).RootElement.Clone();
}
