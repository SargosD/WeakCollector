using FluentValidation;

namespace WeakCollector.Messaging.Configuration;

public sealed class RabbitMqOptionsValidator : AbstractValidator<RabbitMqOptions>
{
    public RabbitMqOptionsValidator()
    {
        RuleFor(options => options.Host).NotEmpty();
        RuleFor(options => options.Port).InclusiveBetween(1, 65535);
        RuleFor(options => options.User).NotEmpty();
        RuleFor(options => options.Password).NotEmpty();
        RuleFor(options => options.VirtualHost).NotEmpty();
    }
}
