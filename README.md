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

Coming with the compose step. The target is one command:

```
docker compose up --build
```

## Develop

Requires the .NET 10 SDK, Node 24, and Docker Desktop.

```
dotnet build
dotnet test
dotnet format --verify-no-changes
```

Every change goes through a pull request into `main` and is squash-merged. Branch names follow `feature/<topic>`.
