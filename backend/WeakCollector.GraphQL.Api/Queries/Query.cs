using HotChocolate.Data;
using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;

namespace WeakCollector.GraphQL.Api.Queries;

public sealed class Query
{
    [UseProjection]
    public IQueryable<MeterReading> GetLatestMeterReadings(WeakCollectorDbContext db) =>
        db.MeterReadings
            .AsNoTracking()
            .Where(reading => reading.PolledAt == db.MeterReadings.Max(r => (DateTimeOffset?)r.PolledAt))
            .OrderBy(reading => reading.Location)
            .ThenBy(reading => reading.Type);
}
