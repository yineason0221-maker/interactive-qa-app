FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json backend/
RUN cd backend && npm install

COPY frontend/package*.json frontend/
RUN cd frontend && npm install

COPY frontend/ frontend/
COPY backend/ backend/

RUN cd frontend && npm run build

EXPOSE 3000

CMD ["sh", "-c", "cd backend && node server.js"]
