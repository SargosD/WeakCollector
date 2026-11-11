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
        RuleFor(options => options.RetryCount).InclusiveBetween(0, 10);
        RuleFor(options => options.RetryDelaySeconds).GreaterThanOrEqualTo(1);
        RuleFor(options => options.MaxRetryDelaySeconds).GreaterThanOrEqualTo(options => options.RetryDelaySeconds);
    }
}
