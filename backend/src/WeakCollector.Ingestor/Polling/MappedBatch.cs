using WeakCollector.Contracts.Messages;

namespace WeakCollector.Ingestor.Polling;

internal sealed record MappedBatch(ReadingsBatch Batch, IReadOnlyList<string> UnknownTypes);
