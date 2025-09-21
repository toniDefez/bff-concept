# Stage 1: Build the production bundle
FROM node:20-bullseye as builder

ARG VITE_API_BASE_URL=http://localhost:3001
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve the static files with a minimal server
FROM node:20-bullseye as runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

RUN npm install --global serve@14.2.1

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
