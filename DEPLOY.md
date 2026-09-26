# Deploying ONCE (about 10 minutes)

## 1. Put the code in your repository
Replace the contents of your existing GitHub repo with this folder. **Keep the `.git` folder and your existing `.agent-logs/`.** Then:

```bash
npm install
git add -A
git commit -m "Rebuild: ONCE limited-drops store with Postgres backend"
git push
```

## 2. Create the database on Vercel
1. Open your project on vercel.com → **Storage** → **Create Database** → **Neon (Postgres)** → Free plan → **Connect** it to the project for all environments.
2. This adds `DATABASE_URL` to the project automatically. Check it under **Settings → Environment Variables**.

## 3. Create the tables and seed the drops (from your computer)
```bash
npm i -g vercel        # once
vercel link            # pick your existing project
vercel env pull .env.local
npm run db:reset       # creates tables + seeds 12 drops with a fresh schedule
```
Run `db:reset` **shortly before you submit**. Drop times are worked out from that moment, so reviewers see live drops, a countdown, and a drop that opens about 30 minutes later (a nice moment to show in the video).

## 4. Redeploy and check
- Vercel → **Deployments** → **Redeploy** (so the build picks up `DATABASE_URL`).
- Open `https://<your-app>.vercel.app/api/health`. You should see `"ok": true, "drops": 12`.
- Open the site in a **private window** (not signed in). Reserve something, choose "Continue as a guest collector", check out, and see your edition number.

## Troubleshooting
- `DATABASE_URL is not set` → the variable isn't in the environment you deployed. Add it and redeploy.
- SSL or connection errors → use Neon's **pooled** connection string (the host contains `-pooler`).
