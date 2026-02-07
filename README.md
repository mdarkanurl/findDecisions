# Find Decisions

## Description
A NestJS backend that logs decisions made by humans. Each log explains what decision was made and why, making it easy to understand and review decisions and behavior.

## Tech Stack
- Backend: Node.js, TypeScript, NestJS, Better-Auth
- Database: PostgreSQL, Prisma ORM
- Messaging & Streaming: RabbitMQ
- Caching: Redis
- Tools: Docker, pnpm
- Testing: Jest / Supertest, Postman

## Setup Instructions
1. Clone the repository:  
   ```bash
   git clone <repo-url>
   cd findDecisions
   ```
2. Copy `.env.example` to `.env` and configure API keys and database URLs.
3. Install necessary packages
    ```bash
    pnpm install --frozen-lockfile
    ```
4. Run the app:
    ```bash
    pnpm run build
    pnpm run start
    ```
5. Logs will be available in the configured Winston/Better Stack outputs as well as in the console.

## Contributing
Contributions, issues, and feature requests are welcome!
If you want to contribute to Find Decisions, please follow the guidelines outlined in the [contributing.md](contributing.md) file.

## License
MIT License
