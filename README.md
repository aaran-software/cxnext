# CXNext

CXNext is the foundation for a full stack ERP, CRM, commerce, billing, and reporting platform with a shared TypeScript codebase across web and desktop delivery channels.

Primary stack:

- React for the web client
- Electron for the desktop client
- Node.js for the backend
- Shared TypeScript domain and validation packages

Repository guidance lives in `ASSIST/`.

- Start with `ASSIST/Documentation/PROJECT_OVERVIEW.md`
- Follow `ASSIST/Discipline/CODING_STANDARDS.md`
- Read `ASSIST/AI_RULES.md` before using an AI agent on this repository

## Structure

```text
apps/
  api/        Node.js backend
  desktop/    Electron shell
  web/        React frontend
packages/
  shared/     Domain types, schemas, guardrails
  ui/         Reusable UI primitives
ASSIST/
  Discipline/ Repository rules
  Documentation/ Living product and engineering docs
```

## Commands

```bash
npm install
npm run dev:web
npm run dev:api
npm run dev:stack
npm run build
npm run lint
npm run typecheck
```

Desktop shell:

```bash
npm run start:desktop
```

The desktop app expects the web app to be available at `http://localhost:5173` during development unless `CXNEXT_WEB_URL` is set.
