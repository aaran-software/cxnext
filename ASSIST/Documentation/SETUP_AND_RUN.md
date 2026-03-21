# Setup And Run

## Prerequisites

1. Node.js 22 or later
2. npm 10 or later

## Install

```bash
npm install
```

## Development

Web:

```bash
npm run dev:web
```

API:

```bash
npm run dev:api
```

Web and API together:

```bash
npm run dev:stack
```

Desktop:

1. Start the web application
2. Run:

```bash
npm run start:desktop
```

Set `CXNEXT_WEB_URL` if the desktop shell should target a non-default web URL.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```
