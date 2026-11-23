using Microsoft.EntityFrameworkCore;

namespace WeakCollector.Data;

public sealed class WeakCollectorDbContext(DbContextOptions<WeakCollectorDbContext> options) : DbContext(options)
{
    public DbSet<MeterReading> MeterReadings { get; set; }

    public DbSet<Measurement> Measurements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var reading = modelBuilder.Entity<MeterReading>();

        reading.Property(r => r.Id).UseIdentityAlwaysColumn();

        reading.HasIndex(r => r.PollId);
        reading.HasIndex(r => r.PolledAt);
        reading.HasIndex(r => new { r.Type, r.Location, r.PolledAt })
            .IsDescending(false, false, true);

        reading.HasMany(r => r.Measurements)
            .WithOne(m => m.MeterReading)
            .HasForeignKey(m => m.MeterReadingId);

        var measurement = modelBuilder.Entity<Measurement>();

        measurement.Property(m => m.Id).UseIdentityAlwaysColumn();
        measurement.Property(m => m.ValueType).HasConversion<string>();
    }
}
