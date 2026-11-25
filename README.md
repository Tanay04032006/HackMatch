# HackMatch

HackMatch helps builders discover hackathons, create a public skill profile, meet collaborators, and talk in a shared community room. The frontend is React + Vite. The API is Express + MongoDB, with password hashing via Node's `scrypt` and HttpOnly session cookies. Chat messages are stored in MongoDB and refreshed every five seconds so they work across serverless instances.

## Run locally

Use Node.js 20 or newer. Create a MongoDB database (Atlas works) and copy `.env.example` to `.env`. Set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters. Keep `.env` private.

In separate terminals, run:

```sh
npm ci
npm run api
```

```sh
npm run dev
```

The Vite frontend proxies `/api` to the local API on port 5001. Visit the URL printed by Vite. The health endpoint is `http://localhost:5001/api/health`.

Checks: `npm run lint`, `npm run build`, and `npm test`. Run `npm run test:integration` for a full API flow against an ephemeral local MongoDB instance (the first run downloads a MongoDB test binary).

## Deploy on Vercel

Import this repository as one Vercel project with **Root Directory** set to the repository root and the Vite framework preset. Use the default `npm run build` command and `dist` output directory. The `api/index.js` function serves the Express API; `vercel.json` routes API requests to it and sends frontend deep links to the SPA.

Set these **server-side** environment variables in Vercel before deploying:

- `MONGODB_URI`: a MongoDB Atlas connection string for a dedicated HackMatch database.
- `JWT_SECRET`: a fresh random secret of at least 32 characters.

Do not prefix either variable with `VITE_`; they must never be included in the browser bundle. Configure Atlas Network Access so the Vercel Function can reach the database, and create a database user with access only to the HackMatch database. Check `/api/health` after deployment, then create an account, edit a profile, post an event, and send a chat message.

Community members can submit events, so verify event details on each event's linked page. Existing accounts from the old demo that stored plain-text passwords are upgraded to hashed passwords when their owners next log in.
