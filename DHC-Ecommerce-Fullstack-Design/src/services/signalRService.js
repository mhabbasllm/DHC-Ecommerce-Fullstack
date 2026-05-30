import * as signalR from '@microsoft/signalr';

const HUB_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5237/api')
    .replace(/\/api$/, '') + '/storeHub';

class SignalRService {
    callbacks = {};

    startConnection = async () => {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        // Re-attach existing listeners if they were registered before connection
        Object.keys(this.callbacks).forEach(methodName => {
            this.connection.on(methodName, this.callbacks[methodName]);
        });

        try {
            await this.connection.start();
            console.log('SignalR Connected.');
        } catch (err) {
            console.error('SignalR Connection Error: ', err);
            setTimeout(() => this.startConnection(), 5000);
        }
    };

    onNewOrder = (callback) => {
        this.callbacks['ReceiveNewOrder'] = callback;
        if (this.connection) {
            this.connection.on('ReceiveNewOrder', callback);
        }
    };

    onOrderStatusUpdated = (callback) => {
        this.callbacks['OrderStatusUpdated'] = callback;
        if (this.connection) {
            this.connection.on('OrderStatusUpdated', callback);
        }
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
