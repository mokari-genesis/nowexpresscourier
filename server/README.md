# Skeletor (ESM Version)

> [!NOTE]
> This branch (`man-esm`) uses **ECMAScript Modules (ESM)**.
> For the CommonJS version, please switch to the `main` branch.

This project is a Serverless application structured for AWS Lambda, using shared layers and libraries.

## 📂 Project Structure

- **`layers/`**: Contains shared dependencies (node_modules) for all Lambda functions.
  - `layers/nodejs`: The primary Node.js layer (`nodejs/` is required by Lambda). Dependencies are installed here to optimize deployment size.
- **`libs/`**: Shared utility code used across different services (Database connections, Logging, JWT, etc.).
- **`services/`**: Contains the actual microservices (Lambda functions).
  - `services/api`: The core API service.
- **`entityQueries/`**: Stores SQL queries and database usage examples.
- **`vendor/`**: Third-party or custom logic specific to certain providers.

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18+)
- NPM
- Serverless Framework (optional, as it's included in layers)

### 2. Installation

First, install the **Tooling** (Prettier, Husky) at the root level:

```bash
npm install
```

This ensures that your code is automatically formatted when you commit.

Next, install the **Runtime Dependencies** in the shared layer:

```bash
cd layers/nodejs
npm install
```

### 3. Running Locally

To run the API service locally using `serverless-offline`:

```bash
cd services/api
npm run local
```

The server will start at `http://localhost:3000`.

## 🛠 Development Workflow

### Formatting

We use **Prettier** to enforce code style. This is configured to run automatically:

- **On Commit**: Husky and lint-staged will automatically format your changed files.
- **Manual**: Run `npm run format` in the root directory to format the entire project.

### Adding Dependencies

If you need to add a dependency that is shared across services, add it to `layers/nodejs/package.json` and run `npm install` there.

### Imports

Since this branch uses ESM:

- Use `import` / `export` syntax.
- We simulate absolute imports by symlinking `libs`. You can import directly from `libs/` (e.g., `import utils from 'libs/utils.js'`).
- Always include file extensions for local imports.
