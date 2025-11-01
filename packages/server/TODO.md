# Server - TODO a Chybějící Funkce

## ✅ Již Implementováno

- [x] Základní TypeScript setup
- [x] Závislost na protocol package

## 📋 Co Chybí a Je Třeba Přidat

### Síťový Stack

- [ ] **WebSocket Server**
  - ws nebo socket.io server
  - Connection management
  - Room/channel support pro multi-user
  - Heartbeat/ping-pong
  - Soubor: `src/websocket/server.ts`

- [ ] **HTTP REST API**
  - Express server
  - CRUD endpointy pro universes, fixtures, scenes
  - Authentication middleware
  - Rate limiting
  - Soubor: `src/api/routes/`

- [ ] **Art-Net Output**
  - UDP sender pro Art-Net
  - Multiple universe support
  - Broadcast/unicast modes
  - Soubor: `src/dmx/artnet-output.ts`

- [ ] **sACN Output**
  - UDP sender pro sACN
  - Multicast support
  - Priority handling
  - Soubor: `src/dmx/sacn-output.ts`

### Databáze a Persistence

- [ ] **Database Layer**
  - PostgreSQL nebo MongoDB integrace
  - Connection pooling
  - Migration system
  - Soubor: `src/database/connection.ts`

- [ ] **Models/Schemas**
  - Universe model
  - Fixture model
  - Scene model
  - Effect model
  - User model
  - Soubor: `src/database/models/`

- [ ] **Repositories**
  - Data access layer
  - CRUD operace
  - Query builders
  - Soubor: `src/database/repositories/`

- [ ] **File-based Storage** (fallback)
  - JSON soubory jako databáze
  - Atomic writes
  - Backup system
  - Soubor: `src/storage/file-storage.ts`

### Business Logic

- [ ] **Universe Manager**
  - Správa DMX univerz
  - Channel allocation
  - Konflikt detection
  - Soubor: `src/services/universe-manager.ts`

- [ ] **Fixture Service**
  - CRUD pro fixtures
  - Address validation
  - Channel overlap detection
  - Soubor: `src/services/fixture-service.ts`

- [ ] **Scene Service**
  - Scene CRUD
  - Scene recall
  - Transition effects
  - Soubor: `src/services/scene-service.ts`

- [ ] **Effect Engine**
  - Effect execution
  - Multi-effect coordination
  - Effect blending
  - Soubor: `src/services/effect-engine.ts`

- [ ] **Node Discovery Service**
  - Auto-discover hardware nodes
  - Node registration
  - Health checking
  - Soubor: `src/services/node-discovery.ts`

### Autentizace a Autorizace

- [ ] **Authentication**
  - JWT token generation
  - Login/logout endpoints
  - Password hashing (bcrypt)
  - Refresh tokens
  - Soubor: `src/auth/authentication.ts`

- [ ] **Authorization**
  - Role-based access control
  - Permission middleware
  - User roles (admin, operator, viewer)
  - Soubor: `src/auth/authorization.ts`

- [ ] **User Management**
  - User CRUD
  - Profile management
  - Password reset
  - Soubor: `src/services/user-service.ts`

### Real-time Features

- [ ] **Event Broadcasting**
  - Broadcast změny všem klientům
  - Selective broadcasting (rooms)
  - Event filters
  - Soubor: `src/websocket/broadcaster.ts`

- [ ] **State Synchronization**
  - Keep all clients in sync
  - Conflict resolution
  - Optimistic updates
  - Soubor: `src/sync/state-sync.ts`

- [ ] **Live DMX Monitor**
  - Real-time DMX hodnoty
  - Frame rate monitoring
  - Network statistics
  - Soubor: `src/monitoring/dmx-monitor.ts`

### Configuration

- [ ] **Config Management**
  - Environment variables
  - Config validation
  - Runtime config updates
  - Soubor: `src/config/config-manager.ts`

- [ ] **Settings API**
  - DMX output settings
  - Network settings
  - Performance tuning
  - Soubor: `src/api/routes/settings.ts`

### Logging a Monitoring

- [ ] **Structured Logging**
  - Winston nebo Pino logger
  - Log levels
  - Log rotation
  - Soubor: `src/logging/logger.ts`

- [ ] **Metrics Collection**
  - Prometheus metrics
  - Request counting
  - Response times
  - Error rates
  - Soubor: `src/monitoring/metrics.ts`

- [ ] **Health Checks**
  - /health endpoint
  - Database connectivity
  - DMX output status
  - Soubor: `src/health/health-check.ts`

### Scheduler

- [ ] **Task Scheduler**
  - Cron-like scheduler
  - Planned effects/scenes
  - Show automation
  - Soubor: `src/scheduler/task-scheduler.ts`

- [ ] **Show Playback**
  - Timeline-based playback
  - Cue list support
  - SMPTE sync
  - Soubor: `src/scheduler/show-playback.ts`

### API Documentation

- [ ] **Swagger/OpenAPI**
  - Auto-generated API docs
  - Interactive API explorer
  - API versioning
  - Soubor: `src/api/swagger.ts`

### Testing

- [ ] **Unit Tests**
  - Jest nebo Vitest
  - Mock dependencies
  - Code coverage

- [ ] **Integration Tests**
  - API endpoint tests
  - Database tests
  - WebSocket tests

- [ ] **Load Tests**
  - Artillery nebo k6
  - Concurrent connections
  - DMX throughput

### Deployment

- [ ] **Docker Configuration**
  - Dockerfile
  - Docker compose
  - Multi-stage builds
  - Soubor: `Dockerfile`, `docker-compose.yml`

- [ ] **Environment Setup**
  - .env.example
  - Environment validation
  - Production config

- [ ] **CI/CD Pipeline**
  - GitHub Actions
  - Automated tests
  - Deployment scripts

## 🔧 Technické Dluhy

- [ ] Implementovat error handling
- [ ] Přidat input validation
- [ ] Setup TypeScript strict mode
- [ ] Implementovat graceful shutdown

## 📦 Chybějící Závislosti

Závislosti k přidání do `package.json`:

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "ws": "^8.14.0",
    "socket.io": "^4.6.0",
    "dgram": "^1.0.1",
    "pg": "^8.11.0",
    "mongoose": "^8.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/ws": "^8.5.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.0",
    "artillery": "^2.0.0",
    "nodemon": "^3.0.0"
  }
}
```

## 🎯 Priority

### Vysoká Priorita (P0)
1. WebSocket server
2. REST API základy
3. Art-Net/sACN output
4. File-based storage

### Střední Priorita (P1)
5. Database integration
6. Authentication
7. Event broadcasting
8. Node discovery

### Nízká Priorita (P2)
9. Scheduler
10. Show playback
11. Load testing
12. Cloud deployment

## 📝 Poznámky

- Server je volitelný - Android app může pracovat standalone
- Priorita na real-time výkon
- WebSocket má přednost před REST pro real-time operace
- Databáze je volitelná - file-based storage jako fallback
- DMX output musí mít latenci < 10ms
- Testovat s více simultánními klienty
