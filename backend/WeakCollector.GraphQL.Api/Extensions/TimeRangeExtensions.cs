using WeakCollector.GraphQL.Api.Models;

namespace WeakCollector.GraphQL.Api.Extensions;

internal static class TimeRangeExtensions
{
    public static (DateTimeOffset From, TimeSpan Bucket) Window(this TimeRange range)
    {
        var (duration, bucket) = range switch
        {
            TimeRange.LastHour => (TimeSpan.FromHours(1), TimeSpan.FromMinutes(1)),
            TimeRange.LastDay => (TimeSpan.FromDays(1), TimeSpan.FromMinutes(15)),
            TimeRange.LastWeek => (TimeSpan.FromDays(7), TimeSpan.FromHours(1)),
            TimeRange.LastMonth => (TimeSpan.FromDays(30), TimeSpan.FromDays(1)),
            _ => throw new ArgumentOutOfRangeException(nameof(range), range, null),
        };

        return (FloorTo(DateTimeOffset.UtcNow - duration, bucket), bucket);
    }

    private static DateTimeOffset FloorTo(DateTimeOffset time, TimeSpan bucket) =>
        new(time.UtcTicks - (time.UtcTicks % bucket.Ticks), TimeSpan.Zero);
}
