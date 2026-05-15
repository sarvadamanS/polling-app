FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Install and build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy backend source
COPY backend/ ./backend/

RUN cd backend && npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "cd backend && npx prisma migrate deploy && node prisma/seed.js && node src/server.js"]