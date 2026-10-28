# TaskFlow

TaskFlow is a React application for organizing projects and their tasks. It combines a dashboard, project details, task workflows, and a lightweight sign-in flow in a single-page interface.

## Features

- Project dashboard and project detail routes
- Project and task data served by a local JSON Server API
- Client-side state management with Redux Toolkit
- Route protection for dashboard and project pages
- Axios-based API requests

## Architecture

The frontend is built with React 19, TypeScript, and Vite. React Router handles navigation, while Redux Toolkit manages application state. The development API is provided by JSON Server and reads its data from `db.json`.

The sign-in flow is for demonstration purposes. Its token is generated in the browser and is not validated by a secure backend. The sample users and data in `db.json` are local demo content; do not use real credentials or treat this setup as production authentication.

## Requirements

- Node.js and npm

## Run locally

From the repository root, install dependencies:

```bash
npm install
```

Start the API and frontend in separate terminals:

```bash
npm run api
```

```bash
npm run dev
```

Vite prints the local frontend URL in the terminal. The JSON Server API runs on port 4000.

## Quality checks

```bash
npm run lint
npm run build
```

## Main routes

- `/login` — demo sign-in
- `/dashboard` — project overview
- `/projects/:id` — project detail

## Technology

React · TypeScript · Vite · Redux Toolkit · React Router · Axios · JSON Server
