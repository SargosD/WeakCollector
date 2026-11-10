namespace WeakCollector.Messaging.Topology;

public static class TopologyNames
{
    public const string RawExchange = "telemetry.raw";
    public const string ProcessedExchange = "telemetry.processed";
    public const string DeadLetterExchange = "telemetry.dead-letter";

    public const string ProcessorQueue = "processor.telemetry";
    public const string NotifierQueue = "notifier.telemetry";
    public const string ProcessorDeadLetterQueue = ProcessorQueue + ".dlq";

    public const string TelemetryReceivedKey = "telemetry.received";
    public const string TelemetryStoredKey = "telemetry.stored";
}
