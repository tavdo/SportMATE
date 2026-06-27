# SportMate Batumi

Mobile-first PWA for finding and joining pickup sports games in Batumi.

## Local setup

```bash
npm install
cp .env.local.example .env.local
# Fill in Firebase values (see below)
npm run dev
```

1. Enable **Firestore** in [Firebase Console](https://console.firebase.google.com/).
2. Add client config from Project Settings → General → `NEXT_PUBLIC_FIREBASE_*`.
3. For local dev, save service account JSON as `firebase-service-account.json` (gitignored), or set split admin vars.
4. Seed venues: `npm run firebase:seed`
5. Deploy rules: `npx firebase deploy --only firestore:rules`

## Deploy on Vercel (from GitHub)

1. Import repo: https://github.com/tavdo/SportMATE
2. Framework: **Next.js** (auto-detected)
3. Add **Environment Variables** (Production + Preview):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `sportmate-8c36f.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `sportmate-8c36f` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `sportmate-8c36f.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `601356775683` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:601356775683:web:0878d504a242094ded7936` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-NTVY0GRK6Q` |
| `FIREBASE_PROJECT_ID` | `sportmate-8c36f` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-...@sportmate-8c36f.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Full private key including `-----BEGIN...` — paste as-is; Vercel handles `\n` |
| `SETUP_SECRET` | Random string for one-time seed |

4. Deploy. After first deploy, seed production venues:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/setup/seed \
  -H "x-setup-secret: YOUR_SETUP_SECRET"
```

5. In Firebase Console → Firestore → Rules, publish `firestore.rules` (or run `firebase deploy --only firestore:rules`).

## Stack

- Next.js 14 · Firebase Firestore · Leaflet · Tailwind · PWA
