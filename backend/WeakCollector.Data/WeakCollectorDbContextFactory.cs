using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace WeakCollector.Data;

internal sealed class WeakCollectorDbContextFactory : IDesignTimeDbContextFactory<WeakCollectorDbContext>
{
    public WeakCollectorDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<WeakCollectorDbContext>()
            .UseNpgsql()
            .UseSnakeCaseNamingConvention()
            .Options;

        return new WeakCollectorDbContext(options);
    }
}
