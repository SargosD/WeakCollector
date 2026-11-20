using System.ComponentModel.DataAnnotations;
using WeakCollector.Ingestor.Configuration;

namespace WeakCollector.Ingestor.Tests.WeakApi;

public class WeakApiOptionsTests
{
    [Fact]
    public void Accepts_complete_options()
    {
        var options = new WeakApiOptions { BaseUrl = "http://weak-api:8080", ApiKey = "supersecret" };

        Validate(options).ShouldBeEmpty();
    }

    [Fact]
    public void Rejects_missing_api_key()
    {
        var options = new WeakApiOptions { BaseUrl = "http://weak-api:8080" };

        Validate(options).ShouldContain(r => r.MemberNames.Contains(nameof(WeakApiOptions.ApiKey)));
    }

    [Theory]
    [InlineData("")]
    [InlineData("weak-api:8080")]
    [InlineData("ftp://weak-api")]
    public void Rejects_invalid_base_url(string baseUrl)
    {
        var options = new WeakApiOptions { BaseUrl = baseUrl, ApiKey = "supersecret" };

        Validate(options).ShouldContain(r => r.MemberNames.Contains(nameof(WeakApiOptions.BaseUrl)));
    }

    [Fact]
    public void Rejects_zero_poll_interval()
    {
        var options = new WeakApiOptions { BaseUrl = "http://weak-api:8080", ApiKey = "supersecret", PollIntervalSeconds = 0 };

        Validate(options).ShouldContain(r => r.MemberNames.Contains(nameof(WeakApiOptions.PollIntervalSeconds)));
    }

    private static List<ValidationResult> Validate(WeakApiOptions options)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(options, new ValidationContext(options), results, validateAllProperties: true);
        return results;
    }
}
