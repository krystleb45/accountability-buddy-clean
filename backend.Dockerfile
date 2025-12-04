FROM node:slim AS base

FROM base AS builder
WORKDIR /app
RUN npm install --global turbo@^2
COPY . .

RUN turbo prune @ab/backend --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN npm ci
COPY --from=builder /app/out/full/ .
RUN npx turbo run build

FROM base AS deps

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/out/json/ .
RUN npm ci

FROM base AS prod
WORKDIR /app
COPY --exclude=node_modules --from=installer /app/ .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
EXPOSE 5050
CMD ["node", "./apps/backend/dist/server.js"]