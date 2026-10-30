using WeakCollector.Ingestor.WeakApi;

namespace WeakCollector.Ingestor.Tests.WeakApi;

public class WeakApiOptionsValidatorTests
{
    private readonly WeakApiOptionsValidator _validator = new();

    [Fact]
    public void Accepts_complete_options()
    {
        var options = new WeakApiOptions { BaseUrl = "http://weak-api:8080", ApiKey = "supersecret" };

        _validator.Validate(options).IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Rejects_missing_api_key()
    {
        var options = new WeakApiOptions { BaseUrl = "http://weak-api:8080" };

        var result = _validator.Validate(options);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(WeakApiOptions.ApiKey));
    }

    [Theory]
    [InlineData("")]
    [InlineData("weak-api:8080")]
    [InlineData("ftp://weak-api")]
    public void Rejects_invalid_base_url(string baseUrl)
    {
        var options = new WeakApiOptions { BaseUrl = baseUrl, ApiKey = "supersecret" };

        var result = _validator.Validate(options);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(WeakApiOptions.BaseUrl));
    }

    [Fact]
    public void Rejects_zero_poll_interval()
    {
        var options = new WeakApiOptions { BaseUrl = "http://weak-api:8080", ApiKey = "supersecret", PollIntervalSeconds = 0 };

        _validator.Validate(options).IsValid.ShouldBeFalse();
    }
}
