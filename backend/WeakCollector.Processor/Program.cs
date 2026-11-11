using Serilog;
using Serilog.Formatting.Compact;
using WeakCollector.Messaging;
using WeakCollector.Processor.Consumers;

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
        .Enrich.WithProperty("Service", "processor")
        .WriteTo.Console(new CompactJsonFormatter()));

    builder.Services.AddRabbitMqMessaging(builder.Configuration, cfg => cfg.AddConsumer<MetersPolledConsumer>());

    var host = builder.Build();
    host.Run();
    return 0;
}
catch (Exception ex)
{
    Log.Fatal(ex, "Processor terminated unexpectedly");
    return 1;
}
finally
{
    Log.CloseAndFlush();
}
