using MassTransit;
using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;
using WeakCollector.Messaging.Messages;

namespace WeakCollector.Processor.Consumers;

internal sealed class MetersPolledConsumer(WeakCollectorDbContext db, ILogger<MetersPolledConsumer> logger) : IConsumer<MetersPolled>
{
    public async Task Consume(ConsumeContext<MetersPolled> context)
    {
        var message = context.Message;

        if (await db.MeterReadings.AnyAsync(r => r.PollId == message.PollId, context.CancellationToken))
        {
            logger.LogInformation("Skipped poll {PollId}, already saved", message.PollId);
            return;
        }

        var names = message.Meters.Select(meter => meter.Location).Distinct().ToList();
        var locations = await db.Locations
            .Where(location => names.Contains(location.Name))
            .ToDictionaryAsync(location => location.Name, context.CancellationToken);

        foreach (var name in names.Where(name => !locations.ContainsKey(name)))
        {
            locations[name] = new Location { Name = name };
        }

        db.MeterReadings.AddRange(message.Meters.Select(meter => new MeterReading
        {
            PollId = message.PollId,
            PolledAt = message.PolledAt,
            Type = meter.Type,
            Location = locations[meter.Location],
            Measurements = PayloadMeasurements.Read(meter.Payload),
        }));

        await db.SaveChangesAsync(context.CancellationToken);

        logger.LogInformation("Saved {ReadingCount} readings for poll {PollId}", message.Meters.Count, message.PollId);
    }
}
