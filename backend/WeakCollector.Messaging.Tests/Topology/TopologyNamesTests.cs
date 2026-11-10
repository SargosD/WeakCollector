using WeakCollector.Messaging.Topology;

namespace WeakCollector.Messaging.Tests.Topology;

public class TopologyNamesTests
{
    private static readonly string Segment = "[a-z]+(-[a-z]+)*";

    [Fact]
    public void Exchange_and_queue_names_are_distinct()
    {
        string[] names =
        [
            TopologyNames.MetersPolledExchange,
            TopologyNames.ProcessorQueue,
            TopologyNames.NotifierQueue,
        ];

        names.ShouldBeUnique();
    }

    [Fact]
    public void Exchanges_are_named_entity_event()
    {
        TopologyNames.MetersPolledExchange.ShouldMatch($@"^{Segment}\.{Segment}$");
    }

    [Theory]
    [InlineData(TopologyNames.ProcessorQueue, "processor")]
    [InlineData(TopologyNames.NotifierQueue, "notifier")]
    public void Queues_are_named_consumer_entity(string queue, string consumer)
    {
        queue.ShouldMatch($@"^{consumer}\.{Segment}$");
    }
}
