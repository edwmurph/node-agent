FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS dependencies
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --ignore-scripts && npm audit --omit=dev

FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53
RUN apk upgrade --no-cache \
    && node -e "const fs = require('node:fs'); for (const p of ['/usr/local/lib/node_modules', '/usr/local/bin/npm', '/usr/local/bin/npx', '/usr/local/bin/corepack', '/usr/local/bin/yarn', '/usr/local/bin/yarnpkg', ...fs.readdirSync('/opt').filter(n => n.startsWith('yarn-v')).map(n => '/opt/' + n)]) fs.rmSync(p, { recursive: true, force: true });"
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY index.js ./
COPY lib ./lib

CMD ["node", "index.js"]
