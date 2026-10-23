FROM node:24.22.1-bookworm-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205

RUN apt-get update && apt-get upgrade -y && apt-get clean \
    && find /var/lib/apt/lists -type f -delete

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY index.js ./
COPY lib ./lib

CMD ["npm", "start"]
