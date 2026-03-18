# ng-dynamo-form

Initial workspace for a schema-driven Angular form application backed by DynamoDB and MySQL.

## What is included

- `docker-compose.yml` for LocalStack with DynamoDB enabled and a local MySQL database
- automatic LocalStack init script that creates a `form-configurations` table
- `frontend/` Angular workspace with a single-page dynamic form shell

## Local infrastructure

Start LocalStack and MySQL:

```bash
docker compose up -d
```

The init hook creates a table named `form-configurations` with:

- partition key: `formId` (`S`)
- sort key: `version` (`N`)

It also seeds a single demo item for `customer-intake-demo`.

MySQL is also available with:

- host: `127.0.0.1`
- port: `3306`
- database: `form_app`
- user: `form_user`
- password: `form_password`

The MySQL container persists data in the `mysql-data` Docker volume.

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
