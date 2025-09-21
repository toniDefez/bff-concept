FROM node:20-bullseye as base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY README.md tsconfig.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npx", "tsx", "src/main.ts"]
