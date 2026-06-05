  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npx prisma generate --schema=prisma/auth-service/schema.prisma
  RUN npm run build:auth

  FROM node:20-alpine AS production
  WORKDIR /app
  ENV NODE_ENV=production
  RUN apk add --no-cache openssl
  COPY package*.json ./
  RUN npm ci --only=production
  COPY --from=builder /app/dist/apps/auth-service ./dist/apps/auth-service
  COPY --from=builder /app/node_modules/@prisma/auth-client ./node_modules/@prisma/auth-client
  COPY --from=builder /app/prisma/auth-service ./prisma/auth-service
  EXPOSE 3001 3003
  CMD ["node", "dist/apps/auth-service/main"]