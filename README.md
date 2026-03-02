# Ori App

> **Flourish Naturally, Live Better**
>
> Investor-ready mobile & web application for Ori Company DC — a licensed medical cannabis dispensary in Washington, DC.

---

## Overview

Ori App is a cross-platform React Native application built with Expo SDK 52. It serves as the primary digital touchpoint for Ori Company DC customers, offering:

| Feature | Description |
|---|---|
| **Menu** | Cannabis product catalog with pickup reservation system (pay onsite) |
| **Shop** | "Ori Clothing & Co" — non-cannabis merch with full Stripe checkout |
| **About** | CMS-driven company story, values, events, and community content |
| **Ori AI** | RAG-powered cannabis education chatbot ("Ori") built on GPT-4o |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 52 + Expo Router v4 (file-based routing) |
| **Language** | TypeScript (strict) |
| **Styling** | NativeWind v4 (Tailwind CSS for React Native) |
| **State** | Zustand v5 (auth, cart, reservation draft) |
| **Server State** | TanStack Query v5 (React Query) |
| **Backend** | Supabase (Auth, Postgres, Edge Functions, Storage) |
| **Payments** | Stripe React Native SDK (merch only) |
| **AI** | OpenAI GPT-4o + text-embedding-ada-002 (RAG) |
| **Email** | Resend API (reservation confirmations) |
| **Vector DB** | pgvector (Supabase Postgres extension) |
| **Fonts** | PlayfairDisplay (headings) + Inter (body) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Bun](https://bun.sh/) (preferred) or npm/yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/eas/): `npm install -g eas-cli`
- [Supabase CLI](https://supabase.com/docs/guides/cli): `brew install supabase/tap/supabase`
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for webhook testing)
- iOS Simulator / Android Emulator or physical device with [Expo Go](https://expo.dev/client)

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-org/ori-company-app.git
cd ori-company-app
bun install          # or: npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe (publishable key — safe for client)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
EXPO_PUBLIC_APP_ENV=development
```

### 3. Set up Supabase

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed demo data
supabase db execute --file supabase/seed.sql
```

#### Edge Function environment variables

Set these in [Supabase Dashboard → Settings → Edge Functions](https://supabase.com/dashboard):

| Variable | Value |
|---|---|
| `OPENAI_API_KEY` | `sk-...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from Stripe Dashboard) |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `FROM_EMAIL` | `noreply@oricompanydc.com` |

Deploy edge functions:

```bash
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
supabase functions deploy reservation-confirm
supabase functions deploy chat-completion
```

### 4. Start the development server

```bash
bun run start        # Expo dev server
# or
bun run ios          # iOS Simulator
bun run android      # Android Emulator
bun run web          # Web browser
```

---

## Project Structure

```
ori-company-app/
├── app/                          # Expo Router screens (file-based)
│   ├── _layout.tsx               # Root layout (providers)
│   ├── index.tsx                 # Auth redirect entry point
│   ├── (auth)/                   # Auth flow (no tab bar)
│   │   ├── welcome.tsx           # Animated landing/hero
│   │   ├── sign-up.tsx           # Registration + 21+ verification
│   │   ├── sign-in.tsx
│   │   ├── verify-email.tsx
│   │   └── forgot-password.tsx
│   └── (tabs)/                   # Main app (tab bar)
│       ├── menu/                 # Cannabis menu + reservations
│       │   ├── index.tsx         # Product catalog
│       │   ├── [id].tsx          # Product detail
│       │   ├── reservation.tsx   # Pickup scheduler
│       │   └── confirmation.tsx  # QR code + receipt
│       ├── shop/                 # Merch store (Stripe)
│       │   ├── index.tsx         # Product grid
│       │   ├── [id].tsx          # Product detail + variants
│       │   ├── cart.tsx          # Cart
│       │   ├── checkout.tsx      # Stripe PaymentSheet
│       │   └── orders.tsx        # Order history
│       ├── about/
│       │   └── index.tsx         # CMS-driven about page
│       └── chat/
│           └── index.tsx         # Ori AI chatbot
├── src/
│   ├── components/ui/            # Shared UI components
│   ├── hooks/                    # React Query hooks
│   ├── lib/                      # Supabase, Stripe, analytics clients
│   ├── stores/                   # Zustand stores (auth, cart, reservation)
│   ├── theme/                    # Design tokens + useTheme() hook
│   ├── types/                    # TypeScript interfaces
│   └── utils/                    # Constants, validation (Zod), formatting
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── seed.sql                  # Demo data + RAG knowledge docs
│   └── functions/
│       ├── create-payment-intent/ # Stripe PaymentIntent creation
│       ├── stripe-webhook/        # Stripe event handler
│       ├── reservation-confirm/   # Confirmation email via Resend
│       └── chat-completion/       # OpenAI RAG pipeline
├── assets/                       # App icons, splash screen
├── app.json                      # Expo config
├── tailwind.config.js            # Design tokens
└── eas.json                      # EAS Build config
```

---

## Design System

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `forest[950]` | `#0D1B12` | Dark background, primary surfaces |
| `forest[600]` | `#2D5016` | Text, accents |
| `gold[500]` | `#C8922A` | Primary accent, CTAs, prices |
| `gold[400]` | `#D4A843` | Secondary gold |
| `warm[100]` | `#F5F0E8` | Light background |

### Typography

- **Headings**: PlayfairDisplay Bold/SemiBold (serif — premium feel)
- **Body**: Inter Regular/Medium/SemiBold (clean, readable)

### Theme

The `useTheme()` hook returns context-aware design tokens:

```tsx
const { colors, fontFamilies, gold, forest, spacing } = useTheme();
```

Supports automatic light/dark mode switching.

---

## Key Architecture Decisions

### Cannabis vs. Merch (Compliance)

Cannabis products use a **reservation-only** flow — no in-app payment. Customers reserve items for pickup and pay onsite. The Stripe integration is exclusively for `shop_products` (non-cannabis merch).

### Age Gate

21+ verification is enforced at signup via `z.literal(true)` in the Zod schema. The `is_21_plus` field is stored in the user's `profiles` row and passed as Supabase Auth metadata.

### Ori AI (RAG)

1. User message → OpenAI `text-embedding-ada-002` → 1536-dim vector
2. `match_knowledge_docs()` pgvector RPC → top-5 similar docs (cosine similarity > 0.75)
3. Docs injected into GPT-4o system prompt
4. Streamed response via Server-Sent Events (SSE)
5. Full response saved to `chat_messages` table

### CMS (About Page)

All About page content is driven by the `content_blocks` table (`section`/`key`/`value`). No code changes required to update company copy, video URLs, or social links — edit directly in Supabase Dashboard.

---

## Supabase Database

13 tables with Row Level Security (RLS):

```
profiles              — Extends auth.users
menu_categories       — Cannabis menu sections
menu_products         — Cannabis products (flower, concentrates, etc.)
reservations          — Pickup reservations (pay onsite)
reservation_items     — Line items per reservation
shop_categories       — Merch categories
shop_products         — Non-cannabis merchandise
orders                — Stripe orders
order_items           — Line items per order
events                — Community events
content_blocks        — CMS for About page
chat_sessions         — Ori AI conversation sessions
chat_messages         — Individual messages
knowledge_docs        — RAG knowledge base (pgvector embeddings)
```

---

## Deployment

### Mobile (EAS Build)

```bash
# Development build
eas build --profile development --platform ios

# Production
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Web (Expo Web / Vercel)

```bash
# Export static web build
npx expo export --platform web

# Deploy to Vercel
vercel deploy ./dist
```

### Stripe Webhooks

1. In Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `checkout.session.completed`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Supabase Edge Function env

**Local testing:**
```bash
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

---

## Replacing Brand Assets

| Asset | Location | Format |
|---|---|---|
| App icon | `assets/images/icon.png` | 1024×1024 PNG |
| Splash screen | `assets/images/splash.png` | 1284×2778 PNG |
| Adaptive icon | `assets/images/adaptive-icon.png` | 1024×1024 PNG |
| About hero video | Supabase Storage or CDN URL | MP4 (H.264) |
| Founder video | Supabase Storage or CDN URL | MP4 (H.264) |

Update video URLs in `content_blocks` table (section: `company_video`, `founder_video`).

---

## Adding Knowledge Base Content (RAG)

1. Write your cannabis education content as plain text
2. Insert into `knowledge_docs` table via Supabase Dashboard or API
3. Generate embeddings (run the embed script or use the Supabase Dashboard)
4. Ori AI will automatically use it in future responses

---

## Environment Variables Reference

| Variable | Client/Server | Required | Description |
|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Client | ✓ | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Client | ✓ | Supabase anon public key |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | ✓ | Stripe publishable key |
| `EXPO_PUBLIC_APP_ENV` | Client | | `development` or `production` |
| `OPENAI_API_KEY` | Edge Function | ✓ | OpenAI API key (GPT-4o) |
| `STRIPE_SECRET_KEY` | Edge Function | ✓ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Edge Function | ✓ | Stripe webhook signing secret |
| `RESEND_API_KEY` | Edge Function | | Resend email API key |
| `FROM_EMAIL` | Edge Function | | Sender email address |

---

## Scripts

```bash
bun run start          # Start Expo dev server
bun run ios            # iOS Simulator
bun run android        # Android Emulator
bun run web            # Web browser
bun run lint           # ESLint
bun run type-check     # TypeScript check
```

---

## Compliance Notes

- All cannabis products are designated for **adults 21+** only
- The app displays compliance disclaimers at sign-up and on the Menu tab
- Cannabis reservations are for **educational/pickup purposes only** — no in-app payment
- Ori AI includes mandatory educational disclaimers and never provides medical advice
- The app is designed for operation under Washington, DC Initiative 71 gifting regulations

---

## License

Proprietary — © Ori Company DC. All rights reserved.

---

*Built with React Native + Expo · Powered by Supabase + OpenAI*
