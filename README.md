# SportMate Batumi

Mobile-first PWA for finding and joining pickup sports games in Batumi.

## Setup

1. Create a [Firebase project](https://console.firebase.google.com/) and enable **Firestore**.
2. Copy `.env.local.example` → `.env.local` and fill in Firebase client config (from Project Settings → General).
3. Generate a **service account key**: Project Settings → Service Accounts → Generate new private key. Paste the full JSON as one line into `FIREBASE_SERVICE_ACCOUNT_JSON` in `.env.local`.
4. Deploy Firestore rules: `npx firebase deploy --only firestore:rules` (after `firebase login` and selecting project `sportmate-8c36f`).
5. Seed venues (with dev server running): `curl -X POST http://localhost:3000/api/setup/seed`

```bash
npm install
npm run dev
```

## Stack

- Next.js 14 (App Router, TypeScript)
- Firebase Firestore + Realtime listeners
- Leaflet + OpenStreetMap
- Tailwind CSS + shadcn/ui
- next-pwa

## Deploy

Deploy to Vercel. Set all `NEXT_PUBLIC_FIREBASE_*` vars and `FIREBASE_SERVICE_ACCOUNT_JSON` in the Vercel dashboard.
