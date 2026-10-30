using Serilog;
using Serilog.Formatting.Compact;
using WeakCollector.Ingestor.Polling;
using WeakCollector.Ingestor.WeakApi;
using WeakCollector.Messaging.DependencyInjection;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(new CompactJsonFormatter())
    .CreateBootstrapLogger();

try
{
    var builder = Host.CreateApplicationBuilder(args);

    builder.Services.AddSerilog((services, configuration) => configuration
        .ReadFrom.Configuration(builder.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Service", "ingestor")
        .WriteTo.Console(new CompactJsonFormatter()));

    builder.Services.AddSingleton(TimeProvider.System);
    builder.Services.AddWeakApiClient(builder.Configuration);
    builder.Services.AddRabbitMqMessaging(builder.Configuration);
    builder.Services.AddSingleton<IngestRunner>();
    builder.Services.AddHostedService<MeterPoller>();

    var host = builder.Build();
    host.Run();
    return 0;
}
catch (Exception ex)
{
    Log.Fatal(ex, "Ingestor terminated unexpectedly");
    return 1;
}
finally
{
    Log.CloseAndFlush();
}
