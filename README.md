# ng-dynamo-form

Initial workspace for a schema-driven Angular form application backed by DynamoDB, a Fastify API, and MySQL.

## What is included

- `docker-compose.yml` for LocalStack with DynamoDB enabled, a Fastify API, and a local MySQL database
- automatic LocalStack init script that creates a `form-configurations` table
- `backend/` Fastify service that resolves a form config by `formId` and `year`
- `frontend/` Angular workspace with a single-page dynamic form shell

## Local infrastructure

Start LocalStack and MySQL:

```bash
docker compose up -d
```

If you changed Dockerfiles, backend dependencies, or Compose service definitions, use:

```bash
docker compose up --build
```

If you changed Dynamo seed files or MySQL init scripts, recreate the persisted volumes before starting the stack so the local data stays synchronized with the repo:

```bash
docker compose down --volumes
docker compose up --build
```

For a shorter reminder-oriented startup guide, see [LOCAL-DEV.md](/Users/Matt.Maloney/projects/play/ng-dynamo-form/LOCAL-DEV.md).

The init hook creates a table named `form-configurations` with:

- partition key: `formId` (`S`)
- sort key: `year` (`N`)

It also seeds demo items for `generic-configurable-form` for years `2025` and `2026`.

LocalStack persistence uses the `localstack-data` Docker volume, so the stack does not need to create or chown a `./.localstack` folder on the host.

MySQL is also available with:

- host: `127.0.0.1`
- port: `3306`
- database: `form_app`
- user: `form_user`
- password: `form_password`

The MySQL container persists data in the `mysql-data` Docker volume.

On first startup, MySQL also runs the init scripts in [docker/mysql/init](/Users/Matt.Maloney/projects/play/ng-dynamo-form/docker/mysql/init), including the table that stores the persisted 2025 and 2026 step submissions. If the `mysql-data` volume already exists, recreate that volume before expecting new init scripts to run.

## Backend API

The Fastify backend exposes:

```bash
GET /api/forms/:formId/years/:year/config
POST /api/forms/:formId/years/:year/submissions
POST /api/forms/:formId/years/:year/steps/:stepId/submissions
POST /api/forms/generic-configurable-form/years/2025/steps/contact-preferences/submissions
POST /api/forms/generic-configurable-form/years/2026/steps/application-questions/submissions
POST /api/forms/generic-configurable-form/years/2026/steps/supplemental-background/submissions
```

Example:

```bash
curl http://localhost:3001/api/forms/generic-configurable-form/years/2026/config
```

If a resolved step includes `submissionUrl`, the frontend posts that step payload there and still prints the same step payload to the browser console. If `submissionUrl` is absent on a step, the frontend falls back to console-only preview mode for that step.

The concrete step endpoints for `2025/contact-preferences`, `2026/application-questions`, and `2026/supplemental-background` now upsert into MySQL using `primary_email` plus the form/year combination as the stable record key. Re-submitting the same email for the same year updates the existing row.

The backend uses DynamoDB through LocalStack by default when started with Docker Compose.

## Frontend

The Angular app renders a config-driven, step-based form from the backend response. Question configs can now attach validations such as `required`, `requiredTrue`, `email`, `min`, `max`, `minLength`, `maxLength`, and `pattern`.

Install dependencies and start the app:

```bash
cd frontend
npm install
npm start
```

## Next step

Once you provide the real configuration schema, the next pass should:

1. map that schema into the Angular field model
2. replace the mock frontend data source with the Fastify API
3. add save/update endpoints for draft and submitted form responses
4. wire the MySQL side for relational reporting or workflow data if needed
