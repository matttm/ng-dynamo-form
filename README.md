# ng-dynamo-form

Initial workspace for a schema-driven Angular form application backed by DynamoDB.

## What is included

- `docker-compose.yml` for LocalStack with DynamoDB enabled
- automatic LocalStack init script that creates a `form-configurations` table
- `frontend/` Angular workspace with a single-page dynamic form shell

## Local DynamoDB

Start LocalStack:

```bash
docker compose up -d localstack
```

The init hook creates a table named `form-configurations` with:

- partition key: `formId` (`S`)
- sort key: `version` (`N`)

It also seeds a single demo item for `customer-intake-demo`.

## Frontend

The Angular app currently renders a configurable one-page form from a mock service so we can swap in your real schema later without rewriting the UI.

Install dependencies and start the app:

```bash
cd frontend
npm install
npm start
```

## Next step

Once you provide the real configuration schema, the next pass should:

1. map that schema into the Angular field model
2. add a service or API layer that resolves a form definition by `formId`
3. replace the mock data source with persisted DynamoDB-backed data

