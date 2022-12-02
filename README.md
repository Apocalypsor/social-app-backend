# TokTik Backend

## Backend

### 0. Install Deps
```bash
npm install
```

Please save this `.env` to the root directory:

```
BACKEND_PORT=4000
DB_URL=MONGO_DB_URL_PROVIDED_IN_FORM
```

Remember to replace `MONGO_DB_URL_PROVIDED_IN_FORM` with the link we provided.

Note that we are saving all media files locally.

### 1. Start
```bash
npm start
```

## Frontend

**Use the `dev` branch from the frontend repo!**

```bash
git clone https://github.com/cis557/project---frontend-group-x frontend
cd frontend && git checkout dev
npm install
npm start
```

**Do not start the mock API servers!**

## Test

```bash
npm test
```

For lint, you can use `npm run lint`.
