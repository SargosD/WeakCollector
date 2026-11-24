using Serilog;
using Serilog.Formatting.Compact;
using WeakCollector.Messaging;
using WeakCollector.Notifier.Consumers;
using WeakCollector.Notifier.Hubs;

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
        .Enrich.WithProperty("Service", "notifier")
        .WriteTo.Console(new CompactJsonFormatter()));

    builder.Services.AddSignalR();
    builder.Services.AddHealthChecks();
    builder.Services.AddRabbitMqMessaging(builder.Configuration, cfg => cfg.AddConsumer<PollStoredConsumer>());

    var app = builder.Build();

    app.UseSerilogRequestLogging();
    app.MapHealthChecks("/health");
    app.MapHub<PollsHub>("/hubs/polls");

    app.Run();
    return 0;
}
catch (Exception ex)
{
    Log.Fatal(ex, "Notifier terminated unexpectedly");
    return 1;
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program
{
}
