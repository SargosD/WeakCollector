using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;
using WeakCollector.GraphQL.Api.Extensions;
using WeakCollector.GraphQL.Api.Models;

namespace WeakCollector.GraphQL.Api.Services;

public sealed class MeterReadingService(IDbContextFactory<WeakCollectorDbContext> dbContextFactory) : IDisposable
{
    private readonly WeakCollectorDbContext _db = dbContextFactory.CreateDbContext();

    public IQueryable<MeterReading> GetAll() => _db.MeterReadings.AsNoTracking();

    public IQueryable<MeterReading> GetLatest() =>
        _db.MeterReadings
            .AsNoTracking()
            .Where(reading => reading.PolledAt == _db.MeterReadings.Max(r => (DateTimeOffset?)r.PolledAt))
            .OrderBy(reading => reading.Location)
            .ThenBy(reading => reading.Type);

    public async Task<IReadOnlyList<MetricInfo>> GetMetricsAsync(
        TimeRange range,
        CancellationToken cancellationToken)
    {
        var (from, _) = range.Window();

        return await _db.Measurements
            .AsNoTracking()
            .Where(m => m.ValueType != MeasurementValueType.Text && m.MeterReading.PolledAt >= from)
            .Select(m => new { m.MeterReading.Type, m.Name, m.ValueType })
            .Distinct()
            .OrderBy(m => m.Type)
            .ThenBy(m => m.Name)
            .Select(m => new MetricInfo(m.Type, m.Name, m.ValueType))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TrendPoint>> GetMeasurementTrendAsync(
        string type,
        string name,
        TimeRange range,
        AggregateFunction aggregate,
        CancellationToken cancellationToken)
    {
        var (from, bucket) = range.Window();
        var bucketSeconds = bucket.TotalSeconds;

        var grouped = _db.Measurements
            .ByTypeAndName(type, name, from)
            .GroupByNumericValue(m => new
            {
                m.MeterReading.Location,
                Bucket = Math.Floor((m.MeterReading.PolledAt - from).TotalSeconds / bucketSeconds),
            });

        var buckets = await grouped
            .OrderBy(g => g.Key.Bucket)
            .ThenBy(g => g.Key.Location)
            .AggregateValues(aggregate)
            .ToListAsync(cancellationToken);

        return buckets
            .Select(b => new TrendPoint(b.Key.Location, from.AddSeconds(b.Key.Bucket * bucketSeconds), b.Value))
            .ToList();
    }

    public async Task<IReadOnlyList<Aggregation>> GetAggregationAsync(
        string type,
        string name,
        TimeRange range,
        AggregateFunction aggregate,
        CancellationToken cancellationToken)
    {
        var (from, _) = range.Window();

        var grouped = _db.Measurements
            .ByTypeAndName(type, name, from)
            .GroupByNumericValue(m => m.MeterReading.Location);

        var locations = await grouped
            .OrderBy(g => g.Key)
            .AggregateValues(aggregate)
            .ToListAsync(cancellationToken);

        return locations
            .Select(a => new Aggregation(a.Key, a.Value))
            .ToList();
    }

    public void Dispose() => _db.Dispose();
}
