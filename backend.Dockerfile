FROM node:slim AS base

FROM base AS builder
WORKDIR /app
RUN npm install --global turbo@^2
COPY . .

RUN turbo prune @ab/backend --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN npm ci --include=dev --include=prod --include=peer
COPY --from=builder /app/out/full/ .
RUN npx turbo run build

FROM base AS prod
WORKDIR /app
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/backend/dist .
EXPOSE 5050
CMD ["node", "server.js"]