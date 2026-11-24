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
            .AsNoTracking()
            .Where(m => m.MeterReading.Type == type
                && m.Name == name
                && m.ValueType != MeasurementValueType.Text
                && m.MeterReading.PolledAt >= from)
            .GroupBy(
                m => new
                {
                    m.MeterReading.Location,
                    Bucket = Math.Floor((m.MeterReading.PolledAt - from).TotalSeconds / bucketSeconds),
                },
                m => m.ValueType == MeasurementValueType.Boolean
                    ? (m.Value == "true" ? 1.0 : 0.0)
                    : Convert.ToDouble(m.Value));

        var aggregated = aggregate switch
        {
            AggregateFunction.Min => grouped.Select(g => new { g.Key.Location, g.Key.Bucket, Value = g.Min() }),
            AggregateFunction.Max => grouped.Select(g => new { g.Key.Location, g.Key.Bucket, Value = g.Max() }),
            _ => grouped.Select(g => new { g.Key.Location, g.Key.Bucket, Value = g.Average() }),
        };

        var buckets = await aggregated
            .OrderBy(b => b.Bucket)
            .ThenBy(b => b.Location)
            .ToListAsync(cancellationToken);

        return buckets
            .Select(b => new TrendPoint(b.Location, from.AddSeconds(b.Bucket * bucketSeconds), b.Value))
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
            .AsNoTracking()
            .Where(m => m.MeterReading.Type == type
                && m.Name == name
                && m.ValueType != MeasurementValueType.Text
                && m.MeterReading.PolledAt >= from)
            .GroupBy(
                m => m.MeterReading.Location,
                m => m.ValueType == MeasurementValueType.Boolean
                    ? (m.Value == "true" ? 1.0 : 0.0)
                    : Convert.ToDouble(m.Value));

        var aggregated = aggregate switch
        {
            AggregateFunction.Min => grouped.Select(g => new { Location = g.Key, Value = g.Min() }),
            AggregateFunction.Max => grouped.Select(g => new { Location = g.Key, Value = g.Max() }),
            _ => grouped.Select(g => new { Location = g.Key, Value = g.Average() }),
        };

        var locations = await aggregated
            .OrderBy(a => a.Location)
            .ToListAsync(cancellationToken);

        return locations
            .Select(a => new Aggregation(a.Location, a.Value))
            .ToList();
    }

    public void Dispose() => _db.Dispose();
}
