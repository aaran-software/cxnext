FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends git nano sudo ca-certificates openssh-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/cxnext/app

COPY package.json package-lock.json ./
RUN npm ci

COPY apps ./apps
COPY packages ./packages
COPY public ./public
COPY ASSIST ./ASSIST
COPY .container ./.container
COPY components.json ./
COPY eslint.config.js ./
COPY index.html ./
COPY playwright.config.ts ./
COPY README.md ./
COPY tsconfig.app.json ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY .env.example ./

RUN rm -rf ./apps/web/public/storage && mkdir -p ./apps/web/public/storage
RUN chmod +x ./.container/entrypoint.sh
RUN npm run build:server

ENV PORT=4000
ENV CORS_ORIGIN=*
ENV DB_ENABLED=false
ENV RUNTIME_CONFIG_PATH=/opt/cxnext/runtime/config/runtime-config.json
ENV MEDIA_STORAGE_ROOT=/opt/cxnext/runtime/storage
ENV WEB_DIST_ROOT=apps/web/dist
ENV VITE_API_BASE_URL=

EXPOSE 4000

VOLUME ["/opt/cxnext/runtime"]

ENTRYPOINT ["./.container/entrypoint.sh"]
