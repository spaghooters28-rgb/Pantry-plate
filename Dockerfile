FROM node:24-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@9

# Copy workspace manifests and lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.json tsconfig.base.json ./

# Copy all packages
COPY lib/ lib/
COPY artifacts/api-server/ artifacts/api-server/
COPY artifacts/meal-planner/ artifacts/meal-planner/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build shared libs (TypeScript composite build)
RUN pnpm run typecheck:libs

# Build the React frontend
# BASE_PATH=/ because the server serves it at the root
ENV BASE_PATH=/
ENV PORT=3000
ENV NODE_ENV=production
RUN pnpm --filter @workspace/meal-planner run build

# Build the API server (esbuild bundle)
RUN pnpm --filter @workspace/api-server run build

# ---
FROM node:24-alpine AS runtime
WORKDIR /app

# Copy the bundled API server
COPY --from=builder /app/artifacts/api-server/dist ./dist

# Copy the built frontend (Vite outputs to dist/public inside the artifact)
COPY --from=builder /app/artifacts/meal-planner/dist/public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
