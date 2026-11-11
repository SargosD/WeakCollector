using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using WeakCollector.Common.Configuration;
using WeakCollector.Messaging.Configuration;

namespace WeakCollector.Messaging;

public static class MessagingServiceCollectionExtensions
{
    public static IServiceCollection AddRabbitMqMessaging(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<IBusRegistrationConfigurator>? configureBus = null)
    {
        services.AddValidatedOptions<RabbitMqOptions, RabbitMqOptionsValidator>(configuration, RabbitMqOptions.SectionName);

        services.AddMassTransit(bus =>
        {
            configureBus?.Invoke(bus);

            bus.UsingRabbitMq((context, rabbit) =>
            {
                var options = context.GetRequiredService<IOptions<RabbitMqOptions>>().Value;
                rabbit.Host(options.Host, (ushort)options.Port, options.VirtualHost, host =>
                {
                    host.Username(options.User);
                    host.Password(options.Password);
                });

                var retryDelay = TimeSpan.FromSeconds(options.RetryDelaySeconds);
                var maxRetryDelay = TimeSpan.FromSeconds(options.MaxRetryDelaySeconds);
                rabbit.UseMessageRetry(retry => retry.Exponential(options.RetryCount, retryDelay, maxRetryDelay, retryDelay));

                rabbit.ConfigureEndpoints(context);
            });
        });
        return services;
    }
}
