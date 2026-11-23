using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;
using WeakCollector.GraphQL.Api.Queries;
using WeakCollector.GraphQL.Api.Tests.Support;

namespace WeakCollector.GraphQL.Api.Tests.Queries;

public class LatestMeterReadingsTests(PostgresFixture postgres) : IClassFixture<PostgresFixture>
{
    private static readonly DateTimeOffset Start = new(2026, 11, 20, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task GetLatestMeterReadings_ReturnsReadingsFromTheNewestPollOnly()
    {
        await using var db = postgres.CreateDbContext();
        await AddReadingAsync(db, "Kitchen", "energy", Start);
        await AddReadingAsync(db, "Hall", "motion", Start.AddMinutes(2));
        var newestEnergy = await AddReadingAsync(db, "Bedroom", "energy", Start.AddMinutes(3));
        var newestAir = await AddReadingAsync(db, "Garage", "air_quality", Start.AddMinutes(3));

        var readings = await new Query()
            .GetLatestMeterReadings(db)
            .ToListAsync(TestContext.Current.CancellationToken);

        readings.Select(r => r.Id).ShouldBe([newestEnergy.Id, newestAir.Id]);
    }

    [Fact]
    public async Task GetLatestMeterReadings_ReturnsTheLocationName()
    {
        await using var db = postgres.CreateDbContext();
        await AddReadingAsync(db, "Kitchen", "energy", Start);

        var readings = await new Query()
            .GetLatestMeterReadings(db)
            .ToListAsync(TestContext.Current.CancellationToken);

        readings.ShouldHaveSingleItem().Location.ShouldBe("Kitchen");
    }

    [Fact]
    public async Task GetLatestMeterReadings_NoReadings_ReturnsNothing()
    {
        await using var db = postgres.CreateDbContext();
        await db.MeterReadings.ExecuteDeleteAsync(TestContext.Current.CancellationToken);

        var readings = await new Query()
            .GetLatestMeterReadings(db)
            .ToListAsync(TestContext.Current.CancellationToken);

        readings.ShouldBeEmpty();
    }

    private static async Task<MeterReading> AddReadingAsync(
        WeakCollectorDbContext db,
        string location,
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
