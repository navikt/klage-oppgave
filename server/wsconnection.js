const WebSocket = require("ws");
const { webSocket } = require("rxjs/webSocket");

const createWebSocketConnection = ({ protocol, url }) =>
  webSocket({
    protocol,
    url,
    WebSocketCtor: WebSocket,
  });

module.exports = createWebSocketConnection;
