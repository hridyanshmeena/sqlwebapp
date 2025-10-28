# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Run optimized production build
EXPOSE 3000
CMD ["npm", "start"]
