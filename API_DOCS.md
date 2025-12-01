# API & Socket Event Documentation

## Socket.IO Events

### Client -> Server

| Event | Payload | Description |
|-------|---------|-------------|
| `find_partner` | `null` | Request to be added to the matching queue. |
| `signal` | `{ target: string, signal: any }` | WebRTC signaling data (offer/answer/candidate) to be relayed to `target`. |
| `message` | `{ message: string }` | Text message to send to the current partner. |
| `disconnect` | `null` | Standard Socket.IO disconnect event. |

### Server -> Client

| Event | Payload | Description |
|-------|---------|-------------|
| `partner_found` | `{ initiator: boolean }` | Notifies that a partner has been found. `initiator` is true if this client should create the WebRTC offer. |
| `signal` | `{ sender: string, signal: any }` | Incoming WebRTC signal from `sender`. |
| `message` | `{ sender: string, message: string }` | Incoming text message. `sender` is 'Partner' or 'You'. |
| `system_message` | `string` | System notification (e.g., "Message blocked"). |
| `partner_disconnected` | `null` | Notifies that the partner has disconnected. |

## HTTP Endpoints

Currently, the server only exposes the Socket.IO endpoint.
- `GET /`: Basic health check (if implemented in `index.ts`, currently just serves 404 for non-socket requests).
