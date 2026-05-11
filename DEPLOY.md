# Self-Hosting Guide

This guide walks you through running the app completely independently — no Replit account, no subscription, no ongoing cost (beyond optional cloud hosting). All AI features use Google's Gemini, which has a free tier of ~1,500 requests per day.

---

## What you need before starting

1. **A Google Gemini API key** (free) — takes 2 minutes
2. **A PostgreSQL database** — free tier on Neon (cloud) or Docker (local)
3. **A place to run the app** — Railway, Render, Fly.io (all free tiers), or your own machine

---

## Step 1 — Get a free Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API key** → **Create API key**
4. Copy the key (starts with `AIza...`) — you'll need it in the steps below

The free tier gives you ~1,500 AI requests per day at no cost.

---

## Step 2 — Deploy to Railway (recommended, free tier)

Railway gives you a free container + a free PostgreSQL database in one place.

### 2a. Create a Neon database (free)

1. Go to [neon.tech](https://neon.tech) and sign up (free, no credit card)
2. Click **New Project**, give it a name
3. On the project dashboard, click **Connection string** and copy the full URL
   — it looks like `postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

### 2b. Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up with GitHub (free)
2. Click **New Project** → **Deploy from GitHub repo**
3. Connect your GitHub account and select this repository
4. Railway detects the `Dockerfile` automatically — click **Deploy**
5. Go to the **Variables** tab and add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | the Neon connection string from Step 2a |
   | `SESSION_SECRET` | a random 32-character string (see tip below) |
   | `GEMINI_API_KEY` | your key from Step 1 |
   | `SELF_HOSTED` | `true` |

   > **Tip:** Generate a session secret with: `openssl rand -hex 32`

6. Click **Deploy** — Railway builds and starts the app (takes ~3 minutes)
7. Click **Settings** → **Networking** → **Generate Domain** to get a public URL

---

## Step 3 — Deploy to Render (alternative, free tier)

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New** → **Web Service** → **Connect a repository**
3. Select this repo — Render detects the `Dockerfile`
4. Set **Instance Type** to **Free**
5. Under **Environment Variables**, add the same 4 variables as in Step 2b
6. Click **Create Web Service** — Render builds and deploys (~5 minutes)

> Note: The free tier on Render spins down after 15 minutes of inactivity and takes ~30 seconds to wake. Upgrade to the $7/mo tier to keep it always on.

---

## Step 4 — Run locally on your own machine (home server or laptop)

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd <repo-folder>

# 2. Copy the example env file
cp .env.example .env

# 3. Edit .env and fill in:
#    SESSION_SECRET=<run: openssl rand -hex 32>
#    GEMINI_API_KEY=AIza...
#    (DATABASE_URL is wired automatically by docker-compose)

# 4. Start everything
docker compose up --build

# App is now at http://localhost:3000
```

Your data is stored in a Docker volume (`db_data`) and survives restarts. To back it up:
```bash
docker compose exec db pg_dump -U pantryplate pantryplate > backup.sql
```

---

## Install on your phone (PWA)

Once the app is running at its public URL:

**iPhone / iPad:**
1. Open the URL in Safari
2. Tap the Share button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add**

**Android:**
1. Open the URL in Chrome
2. Tap the three-dot menu
3. Tap **Add to Home screen** or **Install app**
4. Tap **Install**

The app icon appears on your home screen and opens in fullscreen like a native app.

---

## Environment variables reference

See `.env.example` for the full list. The minimum required set:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Random string for signing cookies |
| `GEMINI_API_KEY` | Your Google Gemini key |
| `SELF_HOSTED` | Set to `true` to unlock all features |

---

## Migrating your data from the Replit-hosted app

User data (grocery lists, pantry, weekly plans) is stored in the Replit PostgreSQL database. To move it:

1. In Replit, open the Shell and run:
   ```bash
   pg_dump $DATABASE_URL > export.sql
   ```
2. Copy `export.sql` to your new host
3. Import it:
   ```bash
   psql $DATABASE_URL < export.sql
   ```

---

## Updating the app

**Railway / Render:** Push a new commit to GitHub — the platform rebuilds and redeploys automatically.

**Local Docker:**
```bash
git pull
docker compose up --build
```
