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

RUN cp .env.example .env
RUN rm -rf ./apps/web/public/storage && mkdir -p ./apps/web/public/storage
RUN chmod +x ./.container/entrypoint.sh
RUN npm run build:server

EXPOSE 4000

VOLUME ["/opt/cxnext/runtime"]

ENTRYPOINT ["./.container/entrypoint.sh"]
