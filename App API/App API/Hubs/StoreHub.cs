using Microsoft.AspNetCore.SignalR;

namespace App_API.Hubs
{
    public class StoreHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }
    }
}
