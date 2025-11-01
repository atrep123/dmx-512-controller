# DMX-512 Controller - Server

Backend server for centralized control and coordination of DMX-512 lighting systems.

## 🎯 Overview

The server component provides centralized control and coordination between multiple clients (Android apps) and hardware nodes (ESP32, Portenta, DMX receivers). It manages DMX universes, handles real-time communication, persists configurations, and coordinates multi-user access.

## ✨ Features

- **Real-time Communication**: WebSocket server for low-latency updates
- **DMX Universe Management**: Coordinate multiple DMX universes
- **REST API**: Configuration and control endpoints
- **Data Persistence**: Store scenes, effects, and configurations
- **Multi-client Support**: Multiple users can connect simultaneously
- **Network Discovery**: Auto-discover hardware nodes on the network
- **Art-Net/sACN Output**: Direct DMX output to lighting networks
- **Authentication**: Optional user authentication and access control
- **Logging**: Comprehensive logging for debugging and monitoring

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- (Optional) PostgreSQL or MongoDB for persistent storage

### Installation

```bash
# Navigate to the server directory
cd packages/server

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env

# Edit .env with your settings
nano .env
```

### Running the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start

# With PM2 (recommended for production)
pm2 start ecosystem.config.js
```

The server will start on `http://localhost:3000` by default.

## 🏗️ Project Structure

```
server/
├── src/
│   ├── api/              # REST API routes
│   │   ├── universes.ts  # Universe endpoints
│   │   ├── fixtures.ts   # Fixture endpoints
│   │   ├── scenes.ts     # Scene endpoints
│   │   └── effects.ts    # Effect endpoints
│   ├── websocket/        # WebSocket handlers
│   │   ├── connection.ts # Connection management
│   │   ├── commands.ts   # Command handlers
│   │   └── events.ts     # Event broadcasting
│   ├── dmx/              # DMX output
│   │   ├── artnet.ts     # Art-Net sender
│   │   ├── sacn.ts       # sACN sender
│   │   └── manager.ts    # DMX universe manager
│   ├── database/         # Data persistence
│   │   ├── models/       # Data models
│   │   └── repositories/ # Data access layer
│   ├── services/         # Business logic
│   │   ├── sceneService.ts
│   │   ├── effectService.ts
│   │   └── nodeService.ts
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration
│   └── index.ts          # Entry point
├── tests/                # Unit and integration tests
├── package.json
├── tsconfig.json
├── .env.example          # Environment template
└── README.md
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# WebSocket Configuration
WS_PORT=3001
WS_PATH=/ws

# Database (Optional - use file-based storage if not set)
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=dmx_controller
DATABASE_USER=dmx
DATABASE_PASSWORD=your_password

# DMX Output
DEFAULT_ARTNET_IP=255.255.255.255
DEFAULT_SACN_MULTICAST=239.255.0.1
DMX_REFRESH_RATE=40

# Authentication (Optional)
AUTH_ENABLED=false
JWT_SECRET=your_secret_key
JWT_EXPIRY=24h

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/server.log
```

## 🔌 API Reference

### REST API

#### Universes

```bash
# Get all universes
GET /api/universes

# Get specific universe
GET /api/universes/:id

# Create universe
POST /api/universes
Content-Type: application/json
{
  "name": "Main Stage",
  "number": 1
}

# Update universe
PUT /api/universes/:id

# Delete universe
DELETE /api/universes/:id
```

#### Fixtures

```bash
# Get all fixtures
GET /api/fixtures

# Add fixture
POST /api/fixtures
{
  "name": "LED PAR 1",
  "universeId": "universe-1",
  "address": 1,
  "channels": 7,
  "type": "rgb-dimmer"
}
```

#### Scenes

```bash
# Get all scenes
GET /api/scenes

# Recall scene
POST /api/scenes/:id/recall

# Save scene
POST /api/scenes
{
  "name": "Opening Look",
  "state": {...}
}
```

### WebSocket API

#### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onopen = () => {
  console.log('Connected to server');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

#### Message Format

```typescript
// Client → Server: Set channel value
{
  "type": "command",
  "command": "setChannel",
  "data": {
    "universe": 1,
    "channel": 1,
    "value": 255
  }
}

// Server → Client: Status update
{
  "type": "status",
  "data": {
    "universe": 1,
    "channels": [0, 255, 128, ...],
    "timestamp": 1635789012345
  }
}

// Server → Client: Event notification
{
  "type": "event",
  "event": "sceneRecalled",
  "data": {
    "sceneId": "scene-1",
    "name": "Opening Look"
  }
}
```

## 🌐 Network Protocols

### Art-Net Output

The server can directly output DMX data via Art-Net:

```typescript
import { ArtNetSender } from './dmx/artnet';

const sender = new ArtNetSender({
  host: '255.255.255.255', // Broadcast
  port: 6454
});

sender.send(universe, channelData);
```

### sACN Output

Or via sACN (E1.31):

```typescript
import { SACNSender } from './dmx/sacn';

const sender = new SACNSender({
  universe: 1,
  priority: 100
});

sender.send(channelData);
```

## 🗄️ Data Persistence

### File-based Storage (Default)

By default, the server uses JSON files for storage:

```
data/
├── universes.json
├── fixtures.json
├── scenes.json
└── effects.json
```

### Database Storage (Optional)

For production deployments, use PostgreSQL or MongoDB:

```bash
# PostgreSQL setup
npm install pg
# Configure DATABASE_* env variables

# MongoDB setup
npm install mongodb
# Set DATABASE_TYPE=mongodb
```

## 🔐 Security

### Authentication

Enable authentication in `.env`:

```env
AUTH_ENABLED=true
JWT_SECRET=your_strong_secret_key
```

Use JWT tokens for API access:

```bash
# Login
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Use token in requests
GET /api/universes
Authorization: Bearer <token>
```

### HTTPS

In production, always use HTTPS:

```bash
# Using a reverse proxy (Nginx/Apache)
# Or with built-in TLS:
npm install https
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- universes.test.ts

# Integration tests
npm run test:integration
```

## 📊 Monitoring

### Health Check

```bash
GET /health

# Response
{
  "status": "healthy",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Metrics

```bash
GET /metrics

# Prometheus-compatible metrics
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t dmx-server .

# Run container
docker run -p 3000:3000 -p 3001:3001 dmx-server
```

### Docker Compose

```yaml
version: '3.8'
services:
  server:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
```

### PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs dmx-server
```

## 🔧 Development

### Available Scripts

```bash
npm run dev         # Start development server with hot reload
npm run build       # Build for production
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run linter
npm run typecheck   # TypeScript type checking
```

### Hot Reload

Development mode uses nodemon for automatic restart on file changes.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

See the [LICENSE](../../LICENSE) file in the root directory.

## 🔗 Related Packages

- [Protocol](../protocol/README.md) - Shared protocol definitions
- [Android App](../android-app/README.md) - Mobile PWA client
- [ESP32 Node](../nodes/esp32/README.md) - ESP32 firmware
- [Portenta Node](../nodes/portenta/README.md) - Portenta firmware

## 📞 Support

For issues or questions, please use GitHub Issues in the main repository.

---

**Note**: The server is optional. The Android app can work standalone for basic functionality. Use the server for multi-client coordination and centralized control.
