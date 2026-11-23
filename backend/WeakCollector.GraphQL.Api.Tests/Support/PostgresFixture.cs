using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using WeakCollector.Data;

namespace WeakCollector.GraphQL.Api.Tests.Support;

public sealed class PostgresFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder("postgres:17-alpine").Build();

    public async ValueTask InitializeAsync()
    {
        await _container.StartAsync();

        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();
    }

    public ValueTask DisposeAsync() => _container.DisposeAsync();

    public WeakCollectorDbContext CreateDbContext() =>
        new(new DbContextOptionsBuilder<WeakCollectorDbContext>()
            .UseNpgsql(_container.GetConnectionString())
            .UseSnakeCaseNamingConvention()
            .Options);
}
