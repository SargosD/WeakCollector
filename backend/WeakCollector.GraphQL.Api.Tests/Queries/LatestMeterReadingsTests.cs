using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;
using WeakCollector.GraphQL.Api.Queries;
using WeakCollector.GraphQL.Api.Tests.Support;

namespace WeakCollector.GraphQL.Api.Tests.Queries;

public class LatestMeterReadingsTests(PostgresFixture postgres) : IClassFixture<PostgresFixture>
{
    private static readonly DateTimeOffset Start = new(2026, 11, 20, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task GetLatestMeterReadings_ManyPolls_ReturnsNewestReadingPerType()
    {
        await using var db = postgres.CreateDbContext();
        var location = await AddLocationAsync(db);
        await AddReadingAsync(db, location, "energy", Start);
        var newestEnergy = await AddReadingAsync(db, location, "energy", Start.AddMinutes(2));
        await AddReadingAsync(db, location, "energy", Start.AddMinutes(1));
        var newestMotion = await AddReadingAsync(db, location, "motion", Start.AddMinutes(1));
        await AddReadingAsync(db, location, "motion", Start);

        var readings = await new Query().GetLatestMeterReadings(db, location.Id).ToListAsync(TestContext.Current.CancellationToken);

        readings.Select(r => r.Id).ShouldBe([newestEnergy.Id, newestMotion.Id]);
    }

    [Fact]
    public async Task GetLatestMeterReadings_OtherLocationHasNewerReading_IgnoresIt()
    {
        await using var db = postgres.CreateDbContext();
        var location = await AddLocationAsync(db);
        var other = await AddLocationAsync(db);
        var mine = await AddReadingAsync(db, location, "energy", Start);
        await AddReadingAsync(db, other, "energy", Start.AddMinutes(5));

        var readings = await new Query().GetLatestMeterReadings(db, location.Id).ToListAsync(TestContext.Current.CancellationToken);

        readings.Select(r => r.Id).ShouldBe([mine.Id]);
    }

    [Fact]
    public async Task GetLatestMeterReadings_UnknownLocation_ReturnsNothing()
    {
        await using var db = postgres.CreateDbContext();

        var readings = await new Query().GetLatestMeterReadings(db, long.MaxValue).ToListAsync(TestContext.Current.CancellationToken);

        readings.ShouldBeEmpty();
    }

    private static async Task<Location> AddLocationAsync(WeakCollectorDbContext db)
    {
        var location = new Location { Name = $"Room {Guid.NewGuid()}" };
        db.Locations.Add(location);
        await db.SaveChangesAsync();
        return location;
    }

    private static async Task<MeterReading> AddReadingAsync(
        WeakCollectorDbContext db,
        Location location,
        string type,
        DateTimeOffset polledAt)
    {
        var reading = new MeterReading
        {
            PollId = Guid.NewGuid(),
            PolledAt = polledAt,
            Type = type,
            Location = location,
        };
        db.MeterReadings.Add(reading);
        await db.SaveChangesAsync();
        return reading;
    }
}
