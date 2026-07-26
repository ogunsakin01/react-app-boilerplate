# Adding Docker

Docker isn't shipped by default. most projects deploy to Vercel / Netlify / Cloudflare Pages, which don't need it. If you're going to a container host, drop these files at the project root.

## Dockerfile (multi-stage)

```dockerfile
# --- Build stage ---
FROM node:22-alpine AS build

RUN corepack enable
WORKDIR /app

# Copy manifests first for better layer caching.
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# --- Runtime stage ---
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## nginx.conf

Because TanStack Router uses client-side routing, unknown paths must fall through to `index.html`:

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Long-cache hashed assets.
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

## .dockerignore

```
node_modules
dist
coverage
storybook-static
playwright-report
test-results
.git
.github
.vscode
.idea
*.log
```

## Build & run

```bash
docker build -t my-app .
docker run --rm -p 8080:80 my-app
```

Open [http://localhost:8080](http://localhost:8080).

## Notes

- MSW does **not** run in production builds. the mocked API is dev-only. Your prod container will need a real backend (or a proxy in nginx to one).
- Env vars: only `VITE_*` variables are baked into the client bundle at build time. Set them via `docker build --build-arg` or a `.env.production` file before `pnpm build`.
