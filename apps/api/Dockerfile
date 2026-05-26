FROM node:20-alpine AS base
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json           ./apps/api/
COPY packages/database/package.json  ./packages/database/
COPY packages/trpc/package.json      ./packages/trpc/
COPY packages/schemas/package.json   ./packages/schemas/
COPY packages/email/package.json     ./packages/email/
COPY packages/logger/package.json    ./packages/logger/
COPY packages/services/package.json  ./packages/services/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json     ./packages/eslint-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build --filter @repo/api

EXPOSE 8000
ENV NODE_ENV=production

CMD ["node", "apps/api/dist/index.js"]
