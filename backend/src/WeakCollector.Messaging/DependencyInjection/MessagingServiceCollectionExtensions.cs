using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using WeakCollector.Messaging.Configuration;
using WeakCollector.Messaging.Connections;
using WeakCollector.Messaging.Publishing;

namespace WeakCollector.Messaging.DependencyInjection;

public static class MessagingServiceCollectionExtensions
{
    public static IServiceCollection AddRabbitMqMessaging(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<RabbitMqOptions>()
            .Bind(configuration.GetSection(RabbitMqOptions.SectionName))
            .ValidateOnStart();
        services.AddSingleton<IValidator<RabbitMqOptions>, RabbitMqOptionsValidator>();
        services.AddSingleton<IValidateOptions<RabbitMqOptions>, FluentValidateOptions<RabbitMqOptions>>();

        services.AddSingleton<RabbitMqConnection>();
        services.AddSingleton<IMessagePublisher, RabbitMqPublisher>();
        return services;
    }
}
