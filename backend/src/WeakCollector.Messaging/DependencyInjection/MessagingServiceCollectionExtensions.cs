using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WeakCollector.Common.Configuration;
using WeakCollector.Messaging.Configuration;
using WeakCollector.Messaging.Connections;
using WeakCollector.Messaging.Publishing;

namespace WeakCollector.Messaging.DependencyInjection;

public static class MessagingServiceCollectionExtensions
{
    public static IServiceCollection AddRabbitMqMessaging(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<RabbitMqOptions, RabbitMqOptionsValidator>(configuration, RabbitMqOptions.SectionName);

        services.AddSingleton<RabbitMqConnection>();
        services.AddSingleton<IMessagePublisher, RabbitMqPublisher>();
        return services;
    }
}
