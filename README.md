# Find Decisions

A production-ready NestJS backend application for capturing and reviewing human decisions, featuring projects, member invites, and a structured decision log.

## Features

- **RESTful API** for projects, invites, and decisions
- **TypeScript** with strict typing throughout
- **Modular Architecture** with clear separation of concerns
- **Input Validation** with comprehensive error handling
- **Consistent API Response Format** across all endpoints
- **Environment-based Configuration** for dev/prod environments
- **PostgreSQL + Prisma** with clean data access patterns
- **Auth** with email verification and password reset

## Project Structure

```
src/
 auth/             # Auth module (sign-up, sign-in, verification, reset)
 decisions/        # Decision logging module
 invites/          # Project invite module
 lib/              # Shared auth setup
 pipes/            # Validation pipes
 prisma/           # Prisma module/service
 projects/         # Project module
 types/            # Shared types
 utils/            # RabbitMQ + email helpers
 app.module.ts     # Root Nest module
 main.ts           # Application entry point
 redis.ts          # Redis client
```

## Architecture Decisions

### 1. Modular Architecture
The application follows NestJS module boundaries to keep concerns isolated:

- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain business logic and validation
- **Modules**: Wire dependencies and encapsulate features
- **DTOs + Zod**: Validate request input at the edge

This design keeps each module focused and testable.

### 2. Prisma Data Access
Prisma is used for type-safe access to PostgreSQL. It provides:
- Strong typing from the schema
- Consistent data access patterns
- Easy migrations and schema evolution

### 3. Centralized Error Handling
Errors are surfaced through NestJS exceptions which:
- Normalize API error responses
- Avoid leaking internal details
- Make controller logic consistent

### 4. Input Validation
Zod schemas power the validation pipe to:
- Validate request bodies and params
- Provide clear errors on invalid input
- Keep validation logic close to DTOs

### 5. Configuration Management
Environment-based configuration keeps secrets and environment settings separate from code using `.env`.

## API Endpoints

Base path: `/api/v1`

### Auth
- `POST /auth/sign-up/email`
- `GET /auth/verify-email`
- `POST /auth/sign-in/email`
- `POST /auth/sign-out`
- `POST /auth/resend-verify-email`
- `POST /auth/request-password-reset`
- `POST /auth/reset-password/:token`
- `POST /auth/change-password`
- `GET /auth/get-session`

### Projects
- `POST /projects`
- `GET /projects` (paginated)
- `GET /projects/mine` (paginated)
- `GET /projects/:id`
- `PUT /projects/:id`
- `DELETE /projects/:id`

### Decisions
- `POST /decisions`
- `GET /decisions` (requires `projectId`, paginated)
- `GET /decisions/:id`
- `PUT /decisions/:id`
- `DELETE /decisions/:id`

### Invites
- `POST /invites`
- `GET /invites/me` (paginated)
- `GET /invites/:projectId`
- `POST /invites/:inviteId/accept`
- `POST /invites/:inviteId/reject`
- `DELETE /invites/:inviteId`

## Setup Instructions

### Prerequisites
- Node.js
- pnpm
- PostgreSQL
- Redis
- RabbitMQ

### Installation

1. **Install dependencies**
   ```bash
   pnpm install --frozen-lockfile
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

3. **Run Prisma migrations and generate client**
   ```bash
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

4. **Start the application**
   ```bash
   # Development
   pnpm run start:dev

   # Production
   pnpm run build
   pnpm run start:prod
   ```

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "message": "...",
  "data": null,
  "error": { ... }
}
```

## Data Models

### Project
```typescript
interface Project {
  id: string;
  name: string;
  adminId: string;
  description?: string;
  isPublic: boolean;
}
```

### Decision
```typescript
interface Decision {
  id: string;
  projectId: string;
  actorType: 'admin' | 'member';
  actorId: string;
  action: string;
  reason: string;
  context?: Record<string, unknown>;
  outcome: string;
  createdAt: Date;
}
```

### ProjectInvite
```typescript
interface ProjectInvite {
  id: string;
  projectId: string;
  invitedBy: string;
  target: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVOKED';
  createdAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
}
```

## Background Jobs

Email verification and password reset emails are queued through RabbitMQ (`sendVerificationEmail` queue) and delivered via Resend. Redis is used for rate limiting and email send throttling.

## Contributing

Contributions, issues, and feature requests are welcome!
If you want to contribute to Find Decisions, please follow the guidelines outlined in the [contributing.md](contributing.md) file.

## License

MIT License
