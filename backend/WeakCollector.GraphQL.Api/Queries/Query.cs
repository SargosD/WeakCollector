using HotChocolate.Data;
using WeakCollector.Data;
using WeakCollector.GraphQL.Api.Models;
using WeakCollector.GraphQL.Api.Services;

namespace WeakCollector.GraphQL.Api.Queries;

public sealed class Query
{
    [UsePaging(IncludeTotalCount = true, MaxPageSize = 50)]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<MeterReading> GetAllReadings(MeterReadingService meterReadings) =>
        meterReadings.GetAll();

    [UseProjection]
    public IQueryable<MeterReading> GetLatestMeterReadings(MeterReadingService meterReadings) =>
        meterReadings.GetLatest();

    public Task<IReadOnlyList<MetricInfo>> GetMetrics(
        TimeRange range,
        MeterReadingService meterReadings,
        CancellationToken cancellationToken) =>
        meterReadings.GetMetricsAsync(range, cancellationToken);

    public Task<IReadOnlyList<TrendPoint>> GetMeasurementTrend(
        string type,
        string name,
        TimeRange range,
        AggregateFunction aggregate,
        MeterReadingService meterReadings,
        CancellationToken cancellationToken) =>
        meterReadings.GetMeasurementTrendAsync(type, name, range, aggregate, cancellationToken);

    public Task<IReadOnlyList<Aggregation>> GetAggregation(
        string type,
        string name,
        TimeRange range,
        AggregateFunction aggregate,
        MeterReadingService meterReadings,
        CancellationToken cancellationToken) =>
        meterReadings.GetAggregationAsync(type, name, range, aggregate, cancellationToken);
}
