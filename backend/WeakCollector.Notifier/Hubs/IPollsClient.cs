namespace WeakCollector.Notifier.Hubs;

internal interface IPollsClient
{
    public Task PollStored(Messaging.Messages.PollStored poll);
}
