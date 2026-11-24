using WeakCollector.Data;

namespace WeakCollector.GraphQL.Api.Models;

public sealed record MetricInfo(string Type, string Name, MeasurementValueType ValueType);
