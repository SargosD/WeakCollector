using Microsoft.EntityFrameworkCore;

namespace WeakCollector.Data;

public sealed class WeakCollectorDbContext(DbContextOptions<WeakCollectorDbContext> options) : DbContext(options)
{
    public DbSet<MeterReading> MeterReadings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var reading = modelBuilder.Entity<MeterReading>();

        reading.Property(r => r.Id).UseIdentityAlwaysColumn();
        reading.Property(r => r.Payload).HasColumnType("jsonb");

        reading.HasIndex(r => r.PollId);
        reading.HasIndex(r => r.PolledAt);
        reading.HasIndex(r => new { r.Type, r.Location, r.PolledAt })
            .IsDescending(false, false, true);
    }
}
