# Opulence — Headless Shopify Storefront (Next.js)

Full premium ecommerce frontend, Shopify backend (Storefront API + read-only Admin API).

## Full Page List

### Customer-facing
| Page | Path | Notes |
|---|---|---|
| Homepage | `/` | Hero, new arrivals, all products |
| New Arrivals | `/new-arrivals` | Sorted by CREATED_AT |
| Product Listing | `/collections/[handle]` | Per-collection products |
| Product Detail | `/products/[handle]` | Variants, add to cart, related products |
| Search | `/search?q=` | Shopify product search |
| Cart | `/cart` | Line items, checkout redirect |
| Wishlist | `/wishlist` | localStorage-based (see note below) |
| Login | `/login` | Shopify customer auth |
| Register | `/register` | Shopify customer auth |
| Account Dashboard | `/account` | Profile summary, recent orders |
| Order History | `/account/orders` | Full order list |
| Saved Addresses | `/account/addresses` | Read-only from Shopify customer data |

### Admin (read-only overview only — see note)
| Page | Path |
|---|---|
| Admin login | `/admin/login` |
| Admin overview | `/admin` — recent products + orders, quick glance |

## Important Notes (please read)

**1. Wishlist** — Shopify Storefront API-te kono native wishlist feature nei.
Tai eta ekhon **localStorage-based** (device-specific, login chara-o kaj
korবে). Cross-device sync chaile customer metafields (Admin API) diye
backend-e save kora jay — seta future upgrade, ekhon scope-e rakhini
karon complexity onek beshi baড়e jay ekta simple feature-r jonno.

**2. Custom Admin Panel** — Ami purposefully **full admin panel banaini**.
Shopify-r nijer Admin dashboard already product/order/inventory/customer
management-r jonno complete, secure, ar battle-tested. Custom-e rebuild
kora mane double maintenance + security risk (Admin API token exposure
risk) kono real benefit chara. Er bodole ekta **read-only overview**
dashboard dilam jate quick glance pawa jay, kintu actual product/order
management **Shopify Admin (`your-store.myshopify.com/admin`)** theke i
korte hobe.

**3. Customer Accounts type check korben** — Shopify duita customer
account system support kore: "Classic customer accounts" (Storefront
API mutations — eta ei code use korche) ar "New customer accounts"
(OAuth-based Customer Account API). Shopify Admin → Settings →
Customer accounts e giye check koren kon type active ache. Notun store
hole default "New" hote pare — sekhetre login/register code-ta
different approach lagbe (janaben, update kore debo).

**4. OP26M07 fabric spec** — Product copy লেখার আগে fabric spec
inconsistency (60/40 vs 100% cotton claim) resolve kore নেবেন, নাহলে PDP-তে
ভুল তথ্য যাবে।

## Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` + `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` — Storefront API (public-safe token)
- `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_API_TOKEN` — Admin API (SECRET, server-only, never expose to browser)
- `ADMIN_DASHBOARD_PASSWORD` — simple gate for `/admin` overview page

### Getting the Admin API token
Shopify Admin → Settings → Apps and sales channels → Develop apps →
[your app] → Configuration → **Admin API integration** → enable scopes:
`read_products`, `read_orders` → install → copy Admin API access token.

## Setup

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploy

```bash
npm i -g vercel
vercel
```

Add all env variables in Vercel dashboard before deploying (Admin API
token especially — never commit it or prefix with `NEXT_PUBLIC_`).

## Folder Structure

```
app/
├── page.tsx                        → Homepage
├── new-arrivals/page.tsx
├── search/page.tsx
├── collections/[handle]/page.tsx
├── products/[handle]/page.tsx
├── cart/page.tsx
├── wishlist/page.tsx
├── login/page.tsx
├── register/page.tsx
├── account/
│   ├── page.tsx                    → Dashboard
│   ├── orders/page.tsx
│   └── addresses/page.tsx
├── admin/
│   ├── login/page.tsx
│   └── page.tsx                    → Read-only overview
└── api/admin-login/route.ts        → Admin gate check

components/
├── ProductCard.tsx                 → Reused everywhere
├── AddToCartButton.tsx
└── RelatedProducts.tsx

lib/
├── shopify.ts                      → Storefront API (client-safe)
├── shopify-admin.ts                → Admin API (SERVER ONLY)
├── cart-context.tsx
├── auth-context.tsx
└── wishlist-context.tsx
```

## Still To Do (Design/Enhancement Layer)

- Scarcity indicators ("Only X left") on PDP — data already available
  via `totalInventory`, needs UI added
- Size guide page/modal
- Countdown timer for drops
- Premium visual design pass (currently minimal Tailwind styling, functional not final)

## Shopify Backend — Manual Setup Checklist (Admin e giye korte hobe)

Eta code na, Shopify Admin (`your-store.myshopify.com/admin`) e login kore
manually korte hobe. Kono automation tool eta korte pare na, karon apnar
store-r actual business data:

### Must-do before launch
- [ ] **Products add** — 11 designs, shob image (multiple angles), variants (size/color), price, description, product type set (e.g. "Tee", "Oversized Tee", "Polo" — homepage category tiles ei field use kore)
- [ ] **Collections banano** — e.g. "Elevated Capsule", "Graphic Tees", "New Arrivals" (Shopify auto-collection rules diye bananoja jay, jemon product type = Polo)
- [ ] **Inventory set kora** — proti variant-r stock count (2,000-piece total lot onujayi divide kore)
- [ ] **Payment provider setup** — Razorpay/Shopify Payments (India-r jonno Razorpay common)
- [ ] **Shipping rates configure** — zones, rates, free shipping threshold
- [ ] **Tax settings** — GST setup (India-specific)
- [ ] **Customer accounts type check** — Settings → Customer accounts → "Classic" na "New" — eta code-r auth flow determine kore
- [ ] **Storefront API app create + token generate** (age bola hoyeche)
- [ ] **Admin API app create + token generate** (admin overview dashboard-r jonno)
- [ ] **Legal pages** — Privacy Policy, Terms, Refund Policy (Shopify-e built-in template ache, edit korte hobe)
- [ ] **Domain connect** — custom domain (e.g. opulence.com)

### Optional but recommended for a "premium" feel
- [ ] **Review app install** — Judge.me/Loox (Testimonials section-e real review dekhate)
- [ ] **Email marketing app** — Klaviyo/Shopify Email (Newsletter signup-r jonno)
- [ ] **Analytics** — GA4 + Meta Pixel connect

Eta shob manually Shopify Admin-e korte hobe. Kono step-e stuck hole seta
niye specific guide dite pari, kintu actual click-through kaj ta apnake e
korte hobe karon eta apnar store-r credentials/data lagbe.

## Demo / Mock Mode (Client Approval Stage)

**`.env.local` file na thakle app automatically mock/demo data diye run
hobe** — kono config lagbe na. Eta client-ke design/flow dekhaার jonno
perfect, real Shopify store na thakleও.

- 11 demo products (Tees + Polos), demo images, demo prices — Opulence-r
  actual catalogue-r structure follow kore
- Login/Register/Cart/Wishlist shob kaj korবে (in-memory/localStorage-e,
  session-only)
- Checkout button demo mode-e kaj korবে na (real Shopify checkout URL
  lagবে) — eta client-ke bole rakhben demo-tে

### Real Shopify-te switch korার somoy
Jokhon client approve korবে ar real store-e connect korতে hobে:
1. `.env.local` file banান (`.env.local.example` copy kore)
2. Real Shopify Storefront API credentials bosান
3. `npm run dev` restart korুন

**Kono component/page code change lagবে na** — shob function real
Shopify-r shape onujayi likha, tai switch instant.
