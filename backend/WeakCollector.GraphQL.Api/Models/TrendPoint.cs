namespace WeakCollector.GraphQL.Api.Models;

public sealed record TrendPoint(string Location, DateTimeOffset PolledAt, double Value);
