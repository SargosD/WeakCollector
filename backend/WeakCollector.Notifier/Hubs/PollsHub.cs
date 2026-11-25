using Microsoft.AspNetCore.SignalR;

namespace WeakCollector.Notifier.Hubs;

public sealed class PollsHub : Hub<IPollsClient>;
