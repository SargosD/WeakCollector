using Serilog;
using Serilog.Formatting.Compact;
using WeakCollector.Data;
using WeakCollector.GraphQL.Api.Queries;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(new CompactJsonFormatter())
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Services.AddSerilog((services, configuration) => configuration
        .ReadFrom.Configuration(builder.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Service", "graphql-api")
        .WriteTo.Console(new CompactJsonFormatter()));

    builder.Services.AddHealthChecks();
    builder.Services.AddWeakCollectorDatabase(builder.Configuration);

    builder.Services
        .AddGraphQLServer()
        .RegisterDbContextFactory<WeakCollectorDbContext>()
        .AddQueryType<Query>()
        .AddFiltering()
        .AddSorting()
        .AddProjections();

    var app = builder.Build();

    app.UseSerilogRequestLogging();
    app.MapHealthChecks("/health");
    app.MapGraphQL();

    app.Run();
    return 0;
}
catch (Exception ex)
{
    Log.Fatal(ex, "GraphQL API terminated unexpectedly");
    return 1;
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program
{
}
