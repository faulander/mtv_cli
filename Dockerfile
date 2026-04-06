FROM oven/bun:1 AS builder

WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# --- Production ---
FROM oven/bun:1-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget xz-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

ENV NODE_ENV=production
ENV MTV_DB_PATH=/data/filme.sqlite
ENV ORIGIN=http://localhost:3000

EXPOSE 3000

VOLUME ["/data", "/downloads"]

CMD ["bun", "build/index.js"]
