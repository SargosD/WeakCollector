using FluentValidation;

namespace WeakCollector.Ingestor.WeakApi;

public sealed class WeakApiOptionsValidator : AbstractValidator<WeakApiOptions>
{
    public WeakApiOptionsValidator()
    {
        RuleFor(options => options.BaseUrl)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            .WithMessage("BaseUrl must be an absolute http or https URL.");
        RuleFor(options => options.ApiKey).NotEmpty();
        RuleFor(options => options.PollIntervalSeconds).GreaterThanOrEqualTo(1);
        RuleFor(options => options.AttemptTimeoutSeconds).GreaterThanOrEqualTo(1);
        RuleFor(options => options.RetryCount).InclusiveBetween(0, 10);
        RuleFor(options => options.RetryDelayMilliseconds).GreaterThanOrEqualTo(0);
    }
}
