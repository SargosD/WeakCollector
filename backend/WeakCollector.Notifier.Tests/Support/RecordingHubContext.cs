using Microsoft.AspNetCore.SignalR;
using WeakCollector.Notifier.Hubs;

namespace WeakCollector.Notifier.Tests.Support;

internal sealed class RecordingHubContext : IHubContext<PollsHub, IPollsClient>, IHubClients<IPollsClient>, IPollsClient
{
    public List<Messaging.Messages.PollStored> SentToAll { get; } = [];

    public IHubClients<IPollsClient> Clients => this;

    public IGroupManager Groups => throw new NotSupportedException();

    public IPollsClient All => this;

    public IPollsClient AllExcept(IReadOnlyList<string> excludedConnectionIds) => throw new NotSupportedException();

    public IPollsClient Client(string connectionId) => throw new NotSupportedException();

    public IPollsClient Group(string groupName) => throw new NotSupportedException();

    public IPollsClient GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds) =>
        throw new NotSupportedException();

    public IPollsClient User(string userId) => throw new NotSupportedException();

    public IPollsClient Users(IReadOnlyList<string> userIds) => throw new NotSupportedException();

    IPollsClient IHubClients<IPollsClient>.Clients(IReadOnlyList<string> connectionIds) =>
        throw new NotSupportedException();

    IPollsClient IHubClients<IPollsClient>.Groups(IReadOnlyList<string> groupNames) =>
        throw new NotSupportedException();

    public Task PollStored(Messaging.Messages.PollStored poll)
    {
        SentToAll.Add(poll);
        return Task.CompletedTask;
    }
}
