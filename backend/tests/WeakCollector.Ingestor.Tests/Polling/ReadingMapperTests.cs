using System.Text.Json;
using WeakCollector.Contracts.Messages;
using WeakCollector.Contracts.Serialization;
using WeakCollector.Ingestor.Polling;
using WeakCollector.Ingestor.Tests.Support;
using WeakCollector.Ingestor.WeakApi;

namespace WeakCollector.Ingestor.Tests.Polling;

public class ReadingMapperTests
{
    private static readonly DateTimeOffset ObservedAt = new(2026, 10, 30, 8, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Maps_all_three_meter_types_with_payload()
    {
        var meters = Parse(SampleMeters.ThreeTypes);

        var mapped = ReadingMapper.ToBatch(meters, ObservedAt);

        mapped.UnknownTypes.ShouldBeEmpty();
        mapped.Batch.ObservedAt.ShouldBe(ObservedAt);
        mapped.Batch.BatchId.ShouldNotBe(Guid.Empty);
        mapped.Batch.Readings.Select(r => (r.Type, r.Location)).ShouldBe(
        [
            (MeterType.AirQuality, "Garage"),
            (MeterType.Energy, "Bedroom"),
            (MeterType.Motion, "Kitchen"),
        ]);
        mapped.Batch.Readings[0].Payload.GetProperty("co2").GetInt32().ShouldBe(330);
        mapped.Batch.Readings[1].Payload.GetProperty("energy").GetDouble().ShouldBe(819.12);
        mapped.Batch.Readings[2].Payload.GetProperty("motionDetected").GetBoolean().ShouldBeTrue();
    }

    [Fact]
    public void Skips_unknown_meter_types()
    {
        var meters = Parse(SampleMeters.WithUnknownType);

        var mapped = ReadingMapper.ToBatch(meters, ObservedAt);

        mapped.Batch.Readings.Count.ShouldBe(1);
        mapped.Batch.Readings[0].Type.ShouldBe(MeterType.Energy);
        mapped.UnknownTypes.ShouldBe(["water"]);
    }

    private static List<MeterDto> Parse(string json) =>
        JsonSerializer.Deserialize<List<MeterDto>>(json, MessageJson.Options)!;
}
