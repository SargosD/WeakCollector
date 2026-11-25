# WeakCollector
<img width="1901" height="902" alt="image" src="https://github.com/user-attachments/assets/97aac185-8a6a-4cfc-bddf-4f0ad3210e86" />

Collects meter data from the unstable WeakApp API, stores it in PostgreSQL, and serves a React dashboard over GraphQL.

## Run

```sh
cp .env.example .env
docker compose up --build
```
Ports and credentials come from `.env`. `GRAPHQL_URL` is required.

