using MassTransit;
using WeakCollector.Messaging.Topology;

namespace WeakCollector.Messaging.Messages;

[EntityName(TopologyNames.MetersPolledExchange)]
public sealed record MetersPolled(Guid BatchId, DateTimeOffset ObservedAt, IReadOnlyList<MeterReading> Readings);
