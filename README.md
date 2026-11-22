# WeakCollector

Collects meter data from the unstable WeakApp API, stores it in PostgreSQL, and serves a React dashboard over GraphQL.

The API fails many calls (500, 502, 504, 429, dropped connections). The ingestor retries, uses a circuit breaker, and logs failed polls.

## Services

| Service | Role |
| --- | --- |
| `weak-api` | Provided unstable API. |
| `WeakCollector.Ingestor` | Polls `/meters`, publishes batches to RabbitMQ. |
| `WeakCollector.Processor` | Splits payloads into measurements, writes PostgreSQL. |
| `WeakCollector.GraphQL.Api` | GraphQL and REST API. |
| `WeakCollector.Notifier` | SignalR hub for live updates. |
| `frontend` | React dashboard. |

## Data

| Table | Holds |
| --- | --- |
| `locations` | Room name, unique. |
| `meter_readings` | One meter at one poll: type, location, poll time. |
| `measurements` | One payload field: name, text value, value type. |

The schema does not depend on WeakApp field names, so new fields need no migration.

## Run

Requires Docker Desktop.

```sh
cp .env.example .env
docker compose up --build
```

| What | URL |
| --- | --- |
| Dashboard | http://localhost:3000 |
| GraphQL health | http://localhost:5000/health |
| Notifier health | http://localhost:5001/health |
| RabbitMQ | http://localhost:15672 (weakcollector / weakcollector) |
| WeakApp API | http://localhost:8080/meters, header `X-Api-Key: supersecret` |

Ports and credentials come from `.env`. `GRAPHQL_URL` is required.

## GraphQL

The browser calls `/graphql` on its own origin. Vite proxies it in development; nginx proxies it in Docker and Azure. Both read `GRAPHQL_URL`.

```sh
# frontend/.env (local development)
GRAPHQL_URL=http://localhost:5000/graphql

# root .env (Compose)
GRAPHQL_URL=http://graphql-api:8080/graphql
```

Use the full URL without a trailing slash. The container fails to start if it is missing.

Queries live in `frontend/src/services/graphql/queries.graphql`. Generated types are committed in `frontend/src/types/graphql`. After schema changes, with the API running:

```sh
cd frontend
npm run codegen
```

## Develop

Requires .NET 10 and Node 24.

```sh
cd backend
dotnet build
dotnet test
dotnet format --verify-no-changes
```

```sh
cd frontend
npm install
npm run dev
npm run lint
npm test
```

## Layout

```text
backend/      .NET services and tests
frontend/     React dashboard
weak-api/     provided unstable API
```

Every change goes through a PR into `main` and is squash-merged. Use `feature/<topic>` branches.
