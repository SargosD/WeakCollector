# WeakCollector

Collects meter data from the unstable WeakApp API, stores it in PostgreSQL, and serves a React dashboard over GraphQL.

## Run

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

