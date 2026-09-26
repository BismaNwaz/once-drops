# ONCE — limited drops from independent makers

A shop where nothing is restocked. Objects are released at a set hour in small, numbered editions. When an edition sells out, it is gone for good, and every buyer gets a permanent edition number (Nº 047 of 120).

This started as an Amazon rebuild. For round two I kept the idea (an online store) and the goal of real shopping flows. I rebuilt the frontend with my own concept and visual design, and replaced the hardcoded product file with a real Postgres backend.

**Live:** _add your Vercel URL_ · **Health check:** `/api/health`

## Why this idea

Amazon is built around endless choice. ONCE goes the other way: few products, told well, with urgency that is real rather than fake. That creates hard backend problems worth solving:

- **No overselling.** Reserving a piece places a 10-minute *hold*. The drop row is locked (`SELECT … FOR UPDATE`) while availability is checked, so two shoppers can never get the last piece. Tested with 20 simultaneous requests for 16 remaining pieces: exactly 16 were held and the rest were refused cleanly.
- **Holds expire by themselves.** Availability is always `edition − sold − active holds`, worked out in SQL, so a hold that runs out returns its piece to the edition with no cron job.
- **Edition numbers.** Checkout turns holds into an order in one transaction and gives each piece the next sequential number.
- **Per-collector limits** also count pieces you already bought.

## What's built

| Flow | Details |
| --- | --- |
| Browse | Home page with live drops (live stock meter and closing countdown), opening-soon drops (countdown and waitlist), and an archive ("all 30 sold in 3 minutes") |
| Drop page | The product story, live stock that updates every 4 s, and a quantity picker. What you see depends on the drop's state: live, upcoming or sold out |
| Bag | A drawer showing each hold's own countdown. Items drop out when a hold expires, and you can release a piece yourself |
| Guest → account | Guests can reserve. When they sign in, their holds move into the account |
| Checkout | Shipping details and a demo card (never charged or stored). Totals are calculated on the server |
| Collection | Every piece you own, with its edition number and a certificate page |
| Auth | Email and password (bcrypt), sessions in the database with httpOnly cookies, and a one-click private guest account for reviewers |

**Left out on purpose:** real payments, emails (the waitlist is stored but no emails are sent), an admin area for scheduling drops (drops are seeded), and search. With a dozen curated drops, search adds nothing.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Postgres (Neon) through `postgres.js` with plain parameterised SQL · bcryptjs · SWR.

```
app/api/            REST endpoints (below)
lib/                db client, auth/sessions, drops, bag (holds), orders
db/schema.sql       tables and constraints
db/setup.ts         creates schema + seeds drops relative to "now"
components/         UI
```

### API

| Method | Route | |
| --- | --- | --- |
| GET | `/api/drops` | live / upcoming / archive |
| GET | `/api/drops/:slug` | one drop |
| GET | `/api/drops/:slug/stock` | light payload the page polls |
| POST | `/api/drops/:slug/waitlist` | join the waitlist |
| GET / POST | `/api/bag` | list holds / place a 10-minute hold |
| DELETE | `/api/bag/:holdId` | release a hold |
| POST | `/api/auth/signup` · `login` · `logout` · `demo` | |
| GET | `/api/auth/me` | current user |
| POST | `/api/checkout` | holds → order with edition numbers |
| GET | `/api/orders` · `/api/orders/:number` | your orders |
| GET | `/api/health` | database check |

## Run locally

```bash
npm install
cp .env.example .env.local        # put your Postgres URL in DATABASE_URL
npm run db:setup                  # creates tables and seeds drops
npm run dev
```

`npm run db:reset` wipes the data and reseeds with a fresh schedule, with drop times worked out from the moment you run it.
