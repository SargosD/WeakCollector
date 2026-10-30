using WeakCollector.Contracts.Topology;

namespace WeakCollector.Contracts.Tests.Topology;

public class MessagingTopologyTests
{
    [Fact]
    public void Exchange_and_queue_names_are_distinct()
    {
        string[] names =
        [
            MessagingTopology.RawExchange,
            MessagingTopology.StoredExchange,
            MessagingTopology.DeadLetterExchange,
            MessagingTopology.ProcessQueue,
            MessagingTopology.NotifyQueue,
            MessagingTopology.DeadLetterQueue,
        ];

        names.ShouldBeUnique();
    }

    [Fact]
    public void Names_use_the_meters_prefix()
    {
        MessagingTopology.RawExchange.ShouldStartWith("meters.");
        MessagingTopology.StoredExchange.ShouldStartWith("meters.");
        MessagingTopology.ProcessQueue.ShouldStartWith("meters.");
        MessagingTopology.NotifyQueue.ShouldStartWith("meters.");
    }
}
