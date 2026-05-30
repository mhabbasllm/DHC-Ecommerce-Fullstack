import * as signalR from '@microsoft/signalr';

const HUB_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5237/api')
    .replace(/\/api$/, '') + '/storeHub';

class SignalRService {
    connection = null;

    startConnection = async () => {
        if (this.connection) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        try {
            await this.connection.start();
            console.log('SignalR Connected.');
        } catch (err) {
            console.error('SignalR Connection Error: ', err);
            setTimeout(this.startConnection, 5000);
        }
    };

    onNewOrder = (callback) => {
        if (!this.connection) return;
        this.connection.on('ReceiveNewOrder', callback);
    };

    onOrderStatusUpdated = (callback) => {
        if (!this.connection) return;
        this.connection.on('OrderStatusUpdated', callback);
    };

    stopConnection = async () => {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    };
}

const signalRService = new SignalRService();
export default signalRService;
