namespace WeakCollector.Notifier.Hubs;

public interface IPollsClient
{
    public Task PollStored(Messaging.Messages.PollStored poll);
}
