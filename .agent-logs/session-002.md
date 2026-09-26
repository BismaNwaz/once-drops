# Agent session 002: Round two, own design with a real backend

**Date:** 2026-09-26
**Agent:** Claude (Cowork)
**Context:** 8x changed the brief: keep the idea and backend, rebuild the frontend with my own design, and make the backend real (database and API, no mock data).

---

## Prompt 1
> Shared the project zip and the new email from 8x. Asked which direction to take so the submission passes.

**Agent findings:**
- The project had **no backend**. Products were hardcoded in `lib/data.ts` and the cart lived in React context. That fails the new "real and connected" requirement.
- `.agent-logs/session-001.md` was a short summary, not a capture.
- First suggestion: a search-first store on Postgres and Drizzle.

## Prompt 2
> "I need to make something outstanding… catches attention… modern." Approved building it in this session.

## Prompt 3
> Stopped the agent and asked to make sure this is not an Amazon clone.

**Agent:** Explained that "keep your idea" means the store stays, but the layout, brand and visual design must be new. Offered concepts.

## Prompt 4
> Asked for something more interesting, with a website and backend, that looks sophisticated.

**Agent:** Warned that leaving e-commerce completely goes against "keep your idea". Offered four concepts in the shopping space: limited drops store, natural-language shopping, gift registry, or something totally new.

## Prompt 5
> Chose **Limited drops store**.

**Decisions made by the agent (and why):**
- **Concept "ONCE":** small numbered editions, released at set hours, never restocked. The urgency is real, so the backend has to handle concurrency correctly. That is the engineering story.
- **Stack:** switched to `postgres.js` with plain parameterised SQL instead of Drizzle, because row locks (`FOR UPDATE`) and transactions read more clearly in SQL. The schema lives in `db/schema.sql`.
- **Holds:** a 10-minute hold per shopper per drop. Availability = edition − sold − active holds, worked out in SQL, so expired holds free themselves without a cron job.
- **Checkout:** one transaction locks each drop, assigns sequential edition numbers, updates `sold` and `sold_out_at`, writes the order and items, and clears the holds.
- **Auth:** bcrypt; the session token is stored only as a SHA-256 hash; httpOnly cookie. A guest's holds move to the account on sign-in.
- **Reviewer experience:** "Continue as a guest collector" creates a private throwaway account. A shared demo login would mix reviewers' orders and use up the per-collector limits.
- **Design:** warm paper background, ink black, one oxblood accent. Instrument Serif for headlines, Inter for text, IBM Plex Mono for labels. Countdowns, a live stock meter (sold, on hold, remaining), a certificate-style order page.
- **Left out:** payments (demo card only), emails, an admin area, search (not useful with a small curated catalogue).

**Verification the agent ran:**
- `next build` and ESLint pass.
- API tested with curl against a local Postgres 16: hold, over-limit, upcoming drop, guest checkout blocked, login moves holds into the account, checkout gives numbers 383–384, the owned limit is enforced, waitlist, validation errors.
- **Race test:** 20 simultaneous hold requests for the last 16 pieces → exactly 16 held, 12 clean `409` responses, no overselling.
- Playwright walkthrough (desktop and 390 px mobile): home → drop → reserve → bag → sign in → checkout → certificate → collection. No hydration errors (an earlier one from locale dates was fixed) and no horizontal scroll on mobile.
- Checked that every Unsplash image ID resolves (a fake ID returns 404 as a control).
