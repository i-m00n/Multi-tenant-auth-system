FROM node:20-alpine
WORKDIR /app

# 1. Copy the root workspace files
COPY package*.json ./
COPY package/ ./package/
COPY apps/demo/package*.json ./apps/demo/

# 2. Install from the root (this links the local SDK)
RUN npm install

# 3. Copy the rest of the demo code
COPY apps/demo/ ./apps/demo/

WORKDIR /app/apps/demo
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]