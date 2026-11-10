using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using WeakCollector.Common.Configuration;
using WeakCollector.Messaging.Configuration;
using WeakCollector.Messaging.Messages;
using WeakCollector.Messaging.Topology;

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

                rabbit.Publish<MetersPolled>(publish => publish.BindQueue(TopologyNames.ProcessorQueue, TopologyNames.ProcessorQueue));
                rabbit.ConfigureEndpoints(context);
            });
        });
        return services;
    }
}
