# Agent Capture Log — Amazon Clone

**Session:** 001  
**Date:** 2026-09-23  
**Task:** Rebuild Amazon.com — Next.js + Tailwind, deploy to Vercel

---

## Prompt 1 — Project Setup

**User:** Rebuild Amazon.com. Next.js + Tailwind + Vercel. Create GitHub repo.

**Agent Response:**
- Explored amazon.com to understand layout: hero banner, category cards, product rows, sticky header with search, cart, account
- Checked 8x agent capture setup at 8x-internal.com/p/8x-agent-capture-setup
- Created Next.js 15 + Tailwind app scaffold
- Installed lucide-react for icons
- Created .agent-logs/ directory for capture

**Key UI observations from Amazon:**
1. **Header**: Logo left, search bar center (with category dropdown), account/orders/cart right
2. **Nav bar**: All menu, Prime, categories, Gift Cards, Sell
3. **Hero**: Large rotating banner cards (Kitchen, Beauty, Fashion, Toys, Electronics)
4. **Product rows**: Horizontal scrolling cards organized by category
5. **Product card**: Image, title, price, rating stars, review count, Prime badge
6. **Search results**: Left sidebar filters (category, brand, price, rating), main grid
7. **Product detail**: Image gallery, title, rating, price, buy box (Add to Cart / Buy Now), Prime shipping info, description/features
8. **Cart**: Line items with qty selector, order summary panel, subtotal/shipping/tax
9. **Checkout**: Address → Payment → Review → Confirm

---

## Prompt 2 — Core Build

Building: homepage, search, product detail, cart, checkout, account pages.
