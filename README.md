# WeakCollector

WeakCollector collects data from the unstable WeakApp API.

It polls the API, pushes every reading through RabbitMQ, stores it in PostgreSQL, and shows it on a React dashboard that reads over GraphQL and updates live over SignalR. The source API fails about half of its calls with 500, 502, 504, 429, or a dropped connection, so the collector is built around retries, a circuit breaker, and a record of every attempt.

## Services

| Service | Role |
| --- | --- |
| `weak-api` | The provided unstable API. Unchanged. |
| `WeakCollector.Ingestor` | Polls `/meters` and publishes each batch to RabbitMQ. |
| `WeakCollector.Processor` | Validates batches and stores them in PostgreSQL. |
| `WeakCollector.Gateway` | GraphQL and REST API over the database. |
| `WeakCollector.Notifier` | SignalR hub that pushes new batches to browsers. |
| `frontend` | React dashboard. |

## Run it

Requires Docker Desktop.

```
docker compose up --build
```

| What | URL |
| --- | --- |
| Dashboard | http://localhost:3000 |
| Gateway health | http://localhost:5000/health |
| Notifier health | http://localhost:5001/health |
| RabbitMQ management | http://localhost:15672 (weakcollector / weakcollector) |
| WeakApp API | http://localhost:8080/meters with header `X-Api-Key: supersecret` |

Ports and credentials come from `.env`. Copy `.env.example` to `.env` to change them. Without a `.env` the defaults above apply.

## Develop

Requires the .NET 10 SDK and Node 24.

```
cd backend
dotnet build
dotnet test
dotnet format --verify-no-changes
```

```
cd frontend
npm install
npm run dev
npm run lint
npm test
```

Tests run on Microsoft.Testing.Platform with xunit v3, which `backend/global.json` turns on.

## Layout

```
backend/
  WeakCollector.slnx
  src/        one project per service plus WeakCollector.Contracts
  tests/      one xunit project per service
frontend/     React dashboard
weak-api/     the provided unstable API
```

Every change goes through a pull request into `main` and is squash-merged. Branch names follow `feature/<topic>`.
