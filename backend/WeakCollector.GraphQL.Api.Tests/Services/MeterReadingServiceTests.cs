using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;
using WeakCollector.GraphQL.Api.Models;
using WeakCollector.GraphQL.Api.Services;
using WeakCollector.GraphQL.Api.Tests.Support;

namespace WeakCollector.GraphQL.Api.Tests.Services;

public sealed class MeterReadingServiceTests(PostgresFixture postgres) : IClassFixture<PostgresFixture>, IDisposable
{
    private static readonly DateTimeOffset Start = new(2026, 11, 20, 12, 0, 0, TimeSpan.Zero);

    private readonly MeterReadingService _service = new(postgres);

    public void Dispose() => _service.Dispose();

    [Fact]
    public async Task GetLatest_ReturnsReadingsFromTheNewestPollOnly()
    {
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Kitchen", "energy", Start);
        await AddReadingAsync(db, "Hall", "motion", Start.AddMinutes(2));
        var newestEnergy = await AddReadingAsync(db, "Bedroom", "energy", Start.AddMinutes(3));
        var newestAir = await AddReadingAsync(db, "Garage", "air_quality", Start.AddMinutes(3));

        var readings = await _service.GetLatest().ToListAsync(TestContext.Current.CancellationToken);

        readings.Select(r => r.Id).ShouldBe([newestEnergy.Id, newestAir.Id]);
    }

    [Fact]
    public async Task GetLatest_ReturnsTheLocationName()
    {
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Kitchen", "energy", Start);

        var readings = await _service.GetLatest().ToListAsync(TestContext.Current.CancellationToken);

        readings.ShouldHaveSingleItem().Location.ShouldBe("Kitchen");
    }

    [Fact]
    public async Task GetLatest_NoReadings_ReturnsNothing()
    {
        await using var db = await CreateEmptyDbContextAsync();

        var readings = await _service.GetLatest().ToListAsync(TestContext.Current.CancellationToken);

        readings.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetAll_ReturnsReadingsFromEveryPoll()
    {
        await using var db = await CreateEmptyDbContextAsync();
        var first = await AddReadingAsync(db, "Kitchen", "energy", Start);
        var second = await AddReadingAsync(db, "Garage", "air_quality", Start.AddMinutes(1));

        var readings = await _service.GetAll().ToListAsync(TestContext.Current.CancellationToken);

        readings.Select(r => r.Id).ShouldBe([first.Id, second.Id], ignoreOrder: true);
    }

    [Fact]
    public async Task GetMeasurementTrendAsync_ReturnsPointsInsideTheRangeOnly()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Kitchen", "air_quality", minute.AddMinutes(-61), Number("co2", "500"));
        await AddReadingAsync(db, "Kitchen", "air_quality", minute.AddMinutes(-58), Number("co2", "510"));
        await AddReadingAsync(db, "Kitchen", "air_quality", minute, Number("co2", "520"));

        var points = await GetMeasurementTrendAsync("air_quality", "co2", TimeRange.LastHour);

        points.Select(p => p.Value).ShouldBe([510, 520]);
    }

    [Fact]
    public async Task GetMeasurementTrendAsync_ParsesNumbers()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Bedroom", "energy", minute.AddMinutes(-1), Number("energy", "819.12"));
        await AddReadingAsync(db, "Bedroom", "energy", minute, Number("energy", "1.5E+3"));

        var points = await GetMeasurementTrendAsync("energy", "energy", TimeRange.LastHour);

        points.ShouldBe(
        [
            new TrendPoint("Bedroom", minute.AddMinutes(-1), 819.12),
            new TrendPoint("Bedroom", minute, 1500),
        ]);
    }

    [Fact]
    public async Task GetMeasurementTrendAsync_ReturnsBooleansAsOneAndZero()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Hall", "motion", minute.AddMinutes(-1), Boolean("motionDetected", "true"));
        await AddReadingAsync(db, "Hall", "motion", minute, Boolean("motionDetected", "false"));

        var points = await GetMeasurementTrendAsync("motion", "motionDetected", TimeRange.LastHour);

        points.Select(p => p.Value).ShouldBe([1, 0]);
    }

    [Fact]
    public async Task GetMeasurementTrendAsync_AveragesEachBucketPerLocationAtTheBucketStart()
    {
        var quarter = PreviousSlotStart(TimeSpan.FromMinutes(15));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Kitchen", "air_quality", quarter.AddMinutes(1), Number("co2", "500"));
        await AddReadingAsync(db, "Kitchen", "air_quality", quarter.AddMinutes(2), Number("co2", "520"));
        await AddReadingAsync(db, "Garage", "air_quality", quarter.AddMinutes(2), Number("co2", "300"));

        var points = await GetMeasurementTrendAsync("air_quality", "co2", TimeRange.LastDay);

        points.ShouldBe(
        [
            new TrendPoint("Garage", quarter, 300),
            new TrendPoint("Kitchen", quarter, 510),
        ]);
    }

    [Theory]
    [InlineData(AggregateFunction.Min, 500)]
    [InlineData(AggregateFunction.Max, 520)]
    public async Task GetMeasurementTrendAsync_AppliesTheRequestedFunctionToEachBucket(
        AggregateFunction aggregate,
        double expected)
    {
        var quarter = PreviousSlotStart(TimeSpan.FromMinutes(15));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Kitchen", "air_quality", quarter.AddMinutes(1), Number("co2", "500"));
        await AddReadingAsync(db, "Kitchen", "air_quality", quarter.AddMinutes(2), Number("co2", "520"));

        var points = await GetMeasurementTrendAsync("air_quality", "co2", TimeRange.LastDay, aggregate);

        points.ShouldHaveSingleItem().Value.ShouldBe(expected);
    }

    [Fact]
    public async Task GetMeasurementTrendAsync_ReturnsTheShareOfTrueForBooleanBuckets()
    {
        var quarter = PreviousSlotStart(TimeSpan.FromMinutes(15));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Hall", "motion", quarter.AddMinutes(1), Boolean("motionDetected", "true"));
        await AddReadingAsync(db, "Hall", "motion", quarter.AddMinutes(2), Boolean("motionDetected", "false"));

        var points = await GetMeasurementTrendAsync("motion", "motionDetected", TimeRange.LastDay);

        points.ShouldHaveSingleItem().Value.ShouldBe(0.5);
    }

    [Fact]
    public async Task GetMeasurementTrendAsync_ReturnsOnlyTheRequestedMetric()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Garage", "air_quality", minute, Number("co2", "330"), Number("pm25", "22"));
        await AddReadingAsync(db, "Garage", "co2_meter", minute, Number("co2", "999"));

        var points = await GetMeasurementTrendAsync("air_quality", "co2", TimeRange.LastHour);

        points.ShouldHaveSingleItem().Value.ShouldBe(330);
    }

    [Fact]
    public async Task GetMeasurementTrendAsync_TextMeasurement_ReturnsNothing()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Kitchen", "water_leak", minute, Text("zone", "basement"));

        var points = await GetMeasurementTrendAsync("water_leak", "zone", TimeRange.LastHour);

        points.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetMeasurementTrendAsync_OrdersByBucketThenLocation()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Kitchen", "air_quality", minute, Number("co2", "590"));
        await AddReadingAsync(db, "Garage", "air_quality", minute, Number("co2", "330"));
        await AddReadingAsync(db, "Kitchen", "air_quality", minute.AddMinutes(-1), Number("co2", "580"));

        var points = await GetMeasurementTrendAsync("air_quality", "co2", TimeRange.LastHour);

        points.Select(p => (p.Location, p.Value)).ShouldBe([("Kitchen", 580), ("Garage", 330), ("Kitchen", 590)]);
    }

    [Fact]
    public async Task GetMetricsAsync_ReturnsEachNumberAndBooleanMetricOnceOrderedByTypeAndName()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Hall", "motion", minute, Boolean("motionDetected", "true"));
        await AddReadingAsync(db, "Kitchen", "air_quality", minute, Number("pm25", "8"), Number("co2", "590"));
        await AddReadingAsync(db, "Garage", "air_quality", minute, Number("co2", "330"));
        await AddReadingAsync(db, "Garage", "water_leak", minute, Text("zone", "basement"));

        var metrics = await _service.GetMetricsAsync(TimeRange.LastHour, TestContext.Current.CancellationToken);

        metrics.ShouldBe(
        [
            new MetricInfo("air_quality", "co2", MeasurementValueType.Number),
            new MetricInfo("air_quality", "pm25", MeasurementValueType.Number),
            new MetricInfo("motion", "motionDetected", MeasurementValueType.Boolean),
        ]);
    }

    [Fact]
    public async Task GetMetricsAsync_LeavesOutMetricsWithoutDataInTheRange()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Bedroom", "energy", minute.AddMinutes(-61), Number("energy", "4.21"));
        await AddReadingAsync(db, "Kitchen", "air_quality", minute, Number("co2", "590"));

        var metrics = await _service.GetMetricsAsync(TimeRange.LastHour, TestContext.Current.CancellationToken);

        metrics.ShouldHaveSingleItem().Name.ShouldBe("co2");
    }

    [Theory]
    [InlineData(AggregateFunction.Avg, 510)]
    [InlineData(AggregateFunction.Min, 500)]
    [InlineData(AggregateFunction.Max, 520)]
    public async Task GetAggregationAsync_AppliesTheRequestedFunctionPerLocation(
        AggregateFunction aggregate,
        double expectedKitchen)
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Kitchen", "air_quality", minute.AddMinutes(-1), Number("co2", "500"));
        await AddReadingAsync(db, "Kitchen", "air_quality", minute, Number("co2", "520"));
        await AddReadingAsync(db, "Garage", "air_quality", minute, Number("co2", "300"));

        var aggregation = await GetAggregationAsync("air_quality", "co2", TimeRange.LastHour, aggregate);

        aggregation.ShouldBe([new Aggregation("Garage", 300), new Aggregation("Kitchen", expectedKitchen)]);
    }

    [Fact]
    public async Task GetAggregationAsync_LeavesOutReadingsOutsideTheRange()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Kitchen", "air_quality", minute.AddMinutes(-61), Number("co2", "900"));
        await AddReadingAsync(db, "Kitchen", "air_quality", minute, Number("co2", "500"));

        var aggregation = await GetAggregationAsync("air_quality", "co2", TimeRange.LastHour, AggregateFunction.Max);

        aggregation.ShouldHaveSingleItem().Value.ShouldBe(500);
    }

    [Fact]
    public async Task GetAggregationAsync_ReturnsTheShareOfTrueForBooleans()
    {
        var minute = PreviousSlotStart(TimeSpan.FromMinutes(1));
        await using var db = await CreateEmptyDbContextAsync();
        await AddReadingAsync(db, "Hall", "motion", minute.AddMinutes(-3), Boolean("motionDetected", "true"));
        await AddReadingAsync(db, "Hall", "motion", minute.AddMinutes(-2), Boolean("motionDetected", "false"));
        await AddReadingAsync(db, "Hall", "motion", minute.AddMinutes(-1), Boolean("motionDetected", "true"));
        await AddReadingAsync(db, "Hall", "motion", minute, Boolean("motionDetected", "true"));

        var aggregation = await GetAggregationAsync("motion", "motionDetected", TimeRange.LastHour, AggregateFunction.Avg);

        aggregation.ShouldHaveSingleItem().Value.ShouldBe(0.75);
    }

    private static DateTimeOffset PreviousSlotStart(TimeSpan slot)
    {
        var now = DateTimeOffset.UtcNow;
        return new DateTimeOffset(now.UtcTicks - (now.UtcTicks % slot.Ticks), TimeSpan.Zero) - slot;
    }

    private static Measurement Number(string name, string value) =>
        new() { Name = name, Value = value, ValueType = MeasurementValueType.Number };

    private static Measurement Boolean(string name, string value) =>
        new() { Name = name, Value = value, ValueType = MeasurementValueType.Boolean };

    private static Measurement Text(string name, string value) =>
        new() { Name = name, Value = value, ValueType = MeasurementValueType.Text };

    private static async Task<MeterReading> AddReadingAsync(
        WeakCollectorDbContext db,
        string location,
        string type,
        DateTimeOffset polledAt,
        params Measurement[] measurements)
    {
        var reading = new MeterReading
        {
            PollId = Guid.NewGuid(),
            PolledAt = polledAt,
            Type = type,
            Location = location,
            Measurements = [.. measurements],
        };
        db.MeterReadings.Add(reading);
        await db.SaveChangesAsync();
        return reading;
    }

    private Task<IReadOnlyList<TrendPoint>> GetMeasurementTrendAsync(
        string type,
        string name,
        TimeRange range,
        AggregateFunction aggregate = AggregateFunction.Avg) =>
        _service.GetMeasurementTrendAsync(type, name, range, aggregate, TestContext.Current.CancellationToken);

    private Task<IReadOnlyList<Aggregation>> GetAggregationAsync(
        string type,
        string name,
        TimeRange range,
        AggregateFunction aggregate) =>
        _service.GetAggregationAsync(type, name, range, aggregate, TestContext.Current.CancellationToken);

    private async Task<WeakCollectorDbContext> CreateEmptyDbContextAsync()
    {
        var db = postgres.CreateDbContext();
        await db.MeterReadings.ExecuteDeleteAsync(TestContext.Current.CancellationToken);
        return db;
    }
}
