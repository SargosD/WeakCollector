using System.Text.Json;
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

        db.MeterReadings.AddRange(message.Meters.Select(meter => new MeterReading
        {
            PollId = message.PollId,
            PolledAt = message.PolledAt,
            Type = meter.Type,
            Location = meter.Location,
            Payload = JsonSerializer.SerializeToDocument(meter.Payload),
        }));

        await db.SaveChangesAsync(context.CancellationToken);

        logger.LogInformation("Saved {ReadingCount} readings for poll {PollId}", message.Meters.Count, message.PollId);
    }
}
