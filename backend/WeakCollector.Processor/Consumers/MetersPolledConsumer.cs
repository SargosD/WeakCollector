using MassTransit;
using Microsoft.EntityFrameworkCore;
using WeakCollector.Data;
using WeakCollector.Messaging.Messages;
using WeakCollector.Processor.Extensions;

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

        var readings = message.Meters.Select(meter => new MeterReading
        {
            PollId = message.PollId,
            PolledAt = message.PolledAt,
            Type = meter.Type,
            Location = meter.Location,
            Measurements = PayloadMeasurements.Read(meter.Payload),
        }).ToList();

        db.MeterReadings.AddRange(readings);
        await db.SaveChangesAsync(context.CancellationToken);

        logger.LogInformation("Saved {ReadingCount} readings for poll {PollId}", readings.Count, message.PollId);

        await context.Publish(
            new PollStored(message.PollId, message.PolledAt, [.. readings.Select(r => r.ToStoredReading())]),
            context.CancellationToken);
    }
}
