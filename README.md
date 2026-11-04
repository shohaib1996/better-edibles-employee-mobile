# Better Edibles Employee (mobile)

React Native app for Better Edibles employees, built from the approved mockups.

**Stack:** Expo SDK 54 · React Native 0.81 · expo-router (file-based navigation) ·
NativeWind v4 (Tailwind CSS) · Redux Toolkit + RTK Query · TypeScript.

## Run it

```bash
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_BASE_URL
npm start                   # scan the QR code with Expo Go (SDK 54) on your phone
```

The phone must reach the backend: use your computer's LAN IP in `.env`, not `localhost`.
All modules used here are included in Expo Go, so no custom build is needed to try it.

Checks: `npm run typecheck` · `npm run doctor`

Release builds (APK / App Store): `npx eas-cli@latest build -p android` (or `-p ios`).
Release builds must point at an **HTTPS** backend.

## Backend

The app only talks to the Better Edibles backend, never to Accounting directly:

| Feature | Endpoint |
|---|---|
| Sign in, password reset email | `POST /api/employee-auth/login`, `/request-reset` |
| Profile, PTO, OLCC permit | `GET /api/employee-app/me` |
| Time clock | `GET /api/employee-app/me/timeclock/state`, `POST .../clock-in` `clock-out` `meal-out` `meal-in` |
| Weekly hours | `GET /api/employee-app/me/week?payPeriodStart=` |
| Pay weeks | `GET /api/employee-app/me/pay-runs`, `/pay-runs/:payPeriodStart` |
| HR documents | `GET /api/employee-app/me/documents`, `/documents/:slug/download` |
| Driver route | `GET /api/employee-app/me/route`, `POST /route/:id/arrived` |
| Voice notes | `POST /api/voice-note/transcribe`, `/api/voice-note/save` |

The backend works out who "me" is from the signed JWT; the app never sends an employee id.
The token is kept in the device keychain/keystore (`expo-secure-store`).

## Project layout

```
src/
  app/                 screens (expo-router). (tabs)/ = bottom tabs, others push on top
  components/ui/       Txt, Button, Card, Screen, BackBar, StatusPill, ComingSoon, ...
  features/            clock (punch + PIN), earnings, route, buddy helper
  store/               Redux store, auth slice, RTK Query API (all endpoints)
  lib/                 formatting, location snapshot, file download, token storage, artwork map
  types/api.ts         response shapes
assets/art/            illustrations cut from the mockups
```

## Behaviour notes

- **Driving or HR**: drivers (`isDriver`) pick one on sign-in and app open. Driving shows only the route; HR never shows it.
- **Fix a punch**: the screen is built, but its button is commented out in `earnings/day/[date].tsx` until the backend has `PATCH /api/employee-app/me/timeclock/punches/:id`.
- **Location** is read once, only when Clock in / Clock out is pressed. Never in the background.
- **PIN**: if the time clock asks for one, the app shows a PIN box.
- **Coming soon** (no database support yet): time-off requests,
  card photo uploads, profile edits, expenses, pay stub taxes/net pay, fingerprint sign-in.
  See `remaining.txt` in the Better-Edibles web repo for the full list and open questions.
