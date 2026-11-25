using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;
using WeakCollector.GraphQL.Api.Models;

namespace WeakCollector.GraphQL.Api.Extensions;

internal static class MeasurementQueryExtensions
{
    public static IQueryable<Measurement> ByTypeAndName(
        this IQueryable<Measurement> measurements,
        string type,
        string name,
        DateTimeOffset from) =>
        measurements
            .AsNoTracking()
            .Where(m => m.MeterReading.Type == type
                && m.Name == name
                && m.ValueType != MeasurementValueType.Text
                && m.MeterReading.PolledAt >= from);

    public static IQueryable<IGrouping<TKey, double>> GroupByNumericValue<TKey>(
        this IQueryable<Measurement> measurements,
        Expression<Func<Measurement, TKey>> keySelector) =>
        measurements.GroupBy(
            keySelector,
            m => m.ValueType == MeasurementValueType.Boolean
                ? (m.Value == "true" ? 1.0 : 0.0)
                : Convert.ToDouble(m.Value));

    public static IQueryable<GroupAggregate<TKey>> AggregateValues<TKey>(
        this IQueryable<IGrouping<TKey, double>> groups,
        AggregateFunction aggregate) =>
        aggregate switch
        {
            AggregateFunction.Min => groups.Select(g => new GroupAggregate<TKey>(g.Key, g.Min())),
            AggregateFunction.Max => groups.Select(g => new GroupAggregate<TKey>(g.Key, g.Max())),
            _ => groups.Select(g => new GroupAggregate<TKey>(g.Key, g.Average())),
        };

    internal sealed record GroupAggregate<TKey>(TKey Key, double Value);
}
