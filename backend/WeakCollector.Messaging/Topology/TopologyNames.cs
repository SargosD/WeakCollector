namespace WeakCollector.Messaging.Topology;

public static class TopologyNames
{
    public const string RawExchange = "meters.raw";
    public const string ProcessedExchange = "meters.processed";
    public const string DeadLetterExchange = "meters.dead-letter";

    public const string ProcessorQueue = "processor.meters";
    public const string NotifierQueue = "notifier.meters";
    public const string ProcessorDeadLetterQueue = ProcessorQueue + ".dlq";

    public const string MetersReceivedKey = "meters.received";
    public const string MetersStoredKey = "meters.stored";
}
