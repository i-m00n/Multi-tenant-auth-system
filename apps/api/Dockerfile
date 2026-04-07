FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
COPY package/ ./package/
COPY apps/api/package*.json ./apps/api/

RUN npm install

COPY apps/api/ ./apps/api/

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["npm", "run", "start:dev"]