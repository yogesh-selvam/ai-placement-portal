# CareerConnect AI — Firebase Email/Password Auth Patch

This patch changes the existing CareerConnect AI authentication from the old email-OTP/JWT flow to Firebase Email/Password authentication while keeping the existing PostgreSQL/Prisma user/profile data.

## Files to copy

- `client/src/firebase.js` -> create this file
- `client/src/main.jsx` -> replace your current file
- `server/src/server.js` -> replace your current file
- `server.env.example` -> reference for Firebase Admin environment variables

## Client install

From:
`ai-placement-portal-fullstack/client`

Run:
`npm install firebase`

## Server install

From:
`ai-placement-portal-fullstack/server`

Run:
`npm install firebase-admin`

## Firebase Console

Authentication -> Sign-in method -> Email/Password -> Enabled.

## Firebase Admin credentials

Firebase Console:
Project settings -> Service accounts -> Generate new private key.

Do NOT put the downloaded JSON file into GitHub.

Copy its values into `server/.env`:

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

## Run

Terminal 1:
`cd server`
`npm run dev`

Terminal 2:
`cd client`
`npm run dev`

The browser login now supports:
- Sign in with email + password
- Create account with email + password
- Firebase session persistence
- Firebase ID token sent to the existing backend
- Backend verifies Firebase token with Firebase Admin
- Existing PostgreSQL user record is automatically matched/upserted by email

The old OTP endpoints may remain in the server file for backward compatibility, but the frontend no longer calls them.
