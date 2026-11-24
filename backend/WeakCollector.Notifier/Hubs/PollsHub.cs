using Microsoft.AspNetCore.SignalR;

namespace WeakCollector.Notifier.Hubs;

internal sealed class PollsHub : Hub<IPollsClient>;
