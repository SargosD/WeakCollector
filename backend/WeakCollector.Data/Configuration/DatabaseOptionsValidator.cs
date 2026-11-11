using FluentValidation;

namespace WeakCollector.Data.Configuration;

public sealed class DatabaseOptionsValidator : AbstractValidator<DatabaseOptions>
{
    public DatabaseOptionsValidator()
    {
        RuleFor(options => options.ConnectionString).NotEmpty();
    }
}
