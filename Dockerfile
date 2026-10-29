FROM node:24.22.2-trixie AS development
WORKDIR /app
USER node

FROM node:24.22.2-trixie AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm run tsc && npm run build && npm run test:client
RUN npm prune --omit=dev --ignore-scripts && npm cache clean --force

FROM node:24.22.2-trixie-slim AS production
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl tini \
    && rm -rf /var/lib/apt/lists/*
USER node
WORKDIR /app
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 8080
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/server/app.js"]
