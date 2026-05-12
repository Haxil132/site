FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY server/package.json ./package.json
RUN npm install --omit=dev
COPY server ./ 
COPY .env.example /app/.env.example
RUN mkdir -p /app/data/uploads

EXPOSE 8080
CMD ["node", "server.js"]
