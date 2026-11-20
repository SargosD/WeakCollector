using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;
using Location = WeakCollector.Data.Location;

namespace WeakCollector.GraphQL.Api.Queries;

public sealed class Query
{
    public IQueryable<Location> GetLocations(WeakCollectorDbContext db) =>
        db.Locations.AsNoTracking().OrderBy(location => location.Name);

    [UsePaging]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<MeterReading> GetMeterReadings(WeakCollectorDbContext db) =>
        db.MeterReadings.AsNoTracking().OrderByDescending(reading => reading.PolledAt);
}
