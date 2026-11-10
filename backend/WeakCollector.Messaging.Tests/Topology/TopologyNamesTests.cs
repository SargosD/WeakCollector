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
            TopologyNames.RawExchange,
            TopologyNames.ProcessedExchange,
            TopologyNames.DeadLetterExchange,
            TopologyNames.ProcessorQueue,
            TopologyNames.NotifierQueue,
            TopologyNames.ProcessorDeadLetterQueue,
        ];

        names.ShouldBeUnique();
    }

    [Theory]
    [InlineData(TopologyNames.RawExchange)]
    [InlineData(TopologyNames.ProcessedExchange)]
    [InlineData(TopologyNames.DeadLetterExchange)]
    [InlineData(TopologyNames.MetersReceivedKey)]
    [InlineData(TopologyNames.MetersStoredKey)]
    public void Exchanges_and_routing_keys_have_entity_and_one_more_segment(string name)
    {
        name.ShouldMatch($@"^{Segment}\.{Segment}$");
    }

    [Theory]
    [InlineData(TopologyNames.ProcessorQueue, "processor")]
    [InlineData(TopologyNames.NotifierQueue, "notifier")]
    public void Queues_are_named_consumer_entity(string queue, string consumer)
    {
        queue.ShouldMatch($@"^{consumer}\.{Segment}$");
    }
}
