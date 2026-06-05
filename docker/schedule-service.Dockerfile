 FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npx prisma generate --schema=prisma/schedule-service/schema.prisma
  RUN npm run build:schedule
  
  FROM node:20-alpine AS production
  WORKDIR /app
  ENV NODE_ENV=production
  RUN apk add --no-cache openssl
  COPY package*.json ./
  RUN npm ci --only=production
  COPY --from=builder /app/dist/apps/schedule-service ./dist/apps/schedule-service
  COPY --from=builder /app/node_modules/@prisma/schedule-client ./node_modules/@prisma/schedule-client
  COPY --from=builder /app/prisma/schedule-service ./prisma/schedule-service
  EXPOSE 3002
  CMD ["node", "dist/apps/schedule-service/main"]
