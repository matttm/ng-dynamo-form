# Local Development

## Docker startup

Use this when you want Docker Compose to rebuild images before starting containers:

```bash
docker compose up --build
```

Use this when images are already current and you just want to start the stack in the background:

```bash
docker compose up -d
```

## When to use `--build`

Use `docker compose up --build` after changes to:

- `backend/Dockerfile`
- `backend/package.json`
- `docker-compose.yml`
- environment or container wiring that affects image startup

## Current services

- `localstack` on `4566`
- `backend` on `3001`
- `mysql` on `3306`

## Cleanup

Stop and remove the project containers, network, and named volumes:

```bash
docker compose down --volumes
```

Stop and remove the project containers, network, named volumes, and images built or used by this compose project:

```bash
docker compose down --volumes --rmi local
```

If you also want to remove downloaded service images for this stack, use:

```bash
docker compose down --volumes --rmi all
```

## Full Docker cleanup

Remove all stopped containers, unused networks, dangling images, and unused build cache across Docker:

```bash
docker system prune
```

Remove all of the above plus unused volumes:

```bash
docker system prune --volumes
```

Use the system prune commands carefully. They are not limited to this project.
