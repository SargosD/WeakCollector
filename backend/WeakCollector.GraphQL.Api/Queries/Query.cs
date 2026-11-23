using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;
using Location = WeakCollector.Data.Location;

namespace WeakCollector.GraphQL.Api.Queries;

public sealed class Query
{
    public IQueryable<Location> GetLocations(WeakCollectorDbContext db) =>
        db.Locations.AsNoTracking().OrderBy(location => location.Name);

    [UseProjection]
    public IQueryable<MeterReading> GetLatestMeterReadings(WeakCollectorDbContext db, long locationId) =>
        db.MeterReadings
            .AsNoTracking()
            .Where(reading => reading.LocationId == locationId
                && !db.MeterReadings.Any(newer => newer.LocationId == locationId
                    && newer.Type == reading.Type
                    && newer.PolledAt > reading.PolledAt))
            .OrderBy(reading => reading.Type);
}
