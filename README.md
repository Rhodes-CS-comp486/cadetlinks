# CadetLinks

CadetLinks is a React Native + Expo mobile app used by AFROTC cadets to stay connected through announcements, events, attendance, profile search, and document sharing.

Contributors: Ellen Ouyang, Aduago Nwachuku, Julia Henderson, Camren Stevenson

## Repository Layout

This repository contains multiple project areas:

- `CadetLinks/`: Main Expo application (active app source, tests, and assets)
- `dataconnect/`: Firebase Data Connect config and example queries
- `schema/`: GraphQL schema for Data Connect
- `src/dataconnect-generated/`: Generated client files for Data Connect
- `database.rules.json` and `firebase.json`: Firebase Realtime Database and emulator config

Most development work happens inside `CadetLinks/`.

## Tech Stack

- React Native 0.81
- Expo SDK 54
- TypeScript
- React Navigation (native stack + bottom tabs)
- Firebase
  - Authentication
  - Realtime Database
  - Cloud Storage
- Jest + Testing Library React Native

## Prerequisites

- Node.js 18+
- npm 9+
- Expo tooling for local development

## Getting Started

1. Install dependencies:

	```bash
	cd CadetLinks
	npm install
	```

2. Start the development server:

	```bash
	npm run start
	```

3. Run on a platform:

	```bash
	npm run android
	# or
	npm run ios
	# or
	npm run web
	```

## Available Scripts

From the `CadetLinks/` directory:

- `npm run start`: Starts Expo with development client mode
- `npm run android`: Builds/runs Android
- `npm run ios`: Builds/runs iOS
- `npm run web`: Starts web build
- `npm run test`: Runs all Jest tests
- `npm run test:watch`: Runs Jest in watch mode
- `npm run test:coverage`: Runs Jest with coverage report

## Testing

Tests are organized under `CadetLinks/Tests/`:

- `Screens/`: Screen logic tests
- `UI/`: UI rendering/interaction tests

Jest is configured in `CadetLinks/jest.config.js` and uses mocks in `CadetLinks/jest.setup.js` for Firebase and AsyncStorage.

To run tests:

```bash
cd CadetLinks
npm run test
```

## App Features

- Authenticated login flow
- Home feed with announcements and updates
- Events and RSVP functionality
- Attendance tracking views (PT, LLAB, RMP)
- Cadet profile management
- Public profile search
- Role-based actions/permissions
- Document upload and viewing

## Firebase Configuration

Firebase app initialization is in `CadetLinks/src/firebase/config.ts`.

The app expects Firebase resources for:

- Realtime Database data
- Authentication users
- Storage uploads/downloads

Realtime database rules are stored in `database.rules.json` and referenced by `firebase.json`.

## Architecture Notes

- Main app entry: `CadetLinks/src/App.tsx`
- Navigation setup: `CadetLinks/src/navigation/index.tsx`
- Shared Firebase data/store logic: `CadetLinks/src/firebase/dbController.ts`
- Styling: `CadetLinks/src/styles/`

The app uses a centralized global store pattern for Firebase-backed state, with listener setup/teardown during session lifecycle.

## Build and Release

EAS build configuration is in `CadetLinks/eas.json`.

Defined profiles:

- `development` (internal distribution + dev client)
- `preview` (internal distribution)
- `production` (auto-increment enabled)

## Privacy

See `PRIVACY.md` for the app privacy statement.

## License

This project is licensed under the terms in `LICENSE`.


