FROM node:24.5-alpine AS frontendbuilder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM node:24.5-alpine AS backendbuilder
WORKDIR /app/backend
COPY backend/package.json ./
RUN npm install
COPY backend/ .
RUN npm run build

FROM node:24.5-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install --omit=dev
COPY --from=backendbuilder /app/backend/build ./
COPY --from=frontendbuilder /app/frontend/build ./frontend
ENV NODE_ENV=production
EXPOSE 4000
CMD ["server.js"]
