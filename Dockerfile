FROM node:24-slim AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config + root tsconfig (all packages extend from it)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./

# Copy all package.json + tsconfig files for dependency resolution
COPY packages/shared/package.json packages/shared/tsconfig.json packages/shared/
COPY packages/db/package.json packages/db/tsconfig.json packages/db/
COPY packages/server/package.json packages/server/tsconfig.json packages/server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY packages/db/ packages/db/
COPY packages/server/ packages/server/

# Build all packages
RUN pnpm run build

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "packages/server/dist/index.js"]
