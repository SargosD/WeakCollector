namespace WeakCollector.Contracts;

public static class MessagingTopology
{
    public const string RawExchange = "meters.raw";
    public const string StoredExchange = "meters.stored";
    public const string DeadLetterExchange = "meters.dlx";

    public const string ProcessQueue = "meters.process";
    public const string NotifyQueue = "meters.notify";
    public const string DeadLetterQueue = "meters.dead";

    public const string ReadingsBatchKey = "readings.batch";
    public const string IngestAttemptKey = "ingest.attempt";
    public const string ReadingsStoredKey = "readings.stored";
}
