# Moment Mobile

**A daily archive for your circle.**

Moment is an Android mobile application designed to help university friends capture, share, and preserve their memories in a private, shared digital archive.

From campus events and everyday moments to unforgettable experiences with friends, Moment helps groups keep their memories organized by date and accessible over time.

This repository contains the mobile application built with Expo, React Native, and TypeScript.

## Features

- **User Authentication:** Register and log in to your account.
- **Private Groups:** Create groups and connect with university friends.
- **Invite Friends:** Join groups using invitation codes.
- **Daily Memories:** Share photo memories with your group.
- **Date-Based Memories:** Keep photos organized by the dates they represent.
- **Missed-Day Memories:** Add memories for previous dates, subject to the app's rules.
- **Image Uploads:** Upload photos through the backend to cloud image storage.
- **Backend Integration:** Communicate with the existing private-group REST API.
- **Android Support:** Run the app during development and create Android APK builds.

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile UI |
| Expo | Mobile development and builds |
| TypeScript | Type-safe application code |
| Expo Router / Navigation | Screen navigation, if configured in the project |
| Expo SecureStore | Secure local token storage, if used by the current implementation |
| Expo Image Picker | Selecting photos |
| Expo Location | Location-related functionality |
| REST API | Communication with the backend |

The exact dependencies and versions are defined in `package.json`.

## Related Repository

**Backend API:** [campuscapsule-backend](https://github.com/AnusAfzal/campuscapsule-backend)

The backend handles authentication, group membership, memory data, and communication with the database and image-storage service.

## Getting Started

### Prerequisites

Install the following before starting development:

- Node.js (LTS recommended)
- npm
- Git
- Expo development tools
- Expo Go or an Android development environment, depending on your workflow

### 1. Clone the repository

After publishing this mobile repository on GitHub, clone it using:

```bash
git clone YOUR_MOBILE_REPOSITORY_URL
cd campuscapsule-mobile
```

Replace `YOUR_MOBILE_REPOSITORY_URL` with the actual GitHub repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the mobile project root and add:

```env
EXPO_PUBLIC_API_URL=https://campuscapsule-backend.onrender.com/api
```

For local backend development, you can use the appropriate local API URL instead.

**Important:** Expo public environment variables are bundled into the client application. Never put database passwords, JWT signing secrets, Cloudinary API secrets, or other private credentials in `EXPO_PUBLIC_` variables.

Do not commit your `.env` file. Use `.env.example` to document the required configuration.

### 4. Start the development server

```bash
npx expo start
```

Follow the terminal instructions to open the app in a supported development environment.

If you encounter a Metro bundler cache issue, try:

```bash
npx expo start --clear
```

### 5. Check the project

Run Expo's configuration and dependency checks:

```bash
npx expo-doctor
```

If the project defines a type-checking script, you can also run:

```bash
npm run typecheck
```

## Building an Android APK

The project uses EAS Build for Android builds.

Install and configure EAS CLI if needed:

```bash
npm install -g eas-cli
eas login
```

Build an Android APK using the project's configured preview profile:

```bash
eas build -p android --profile preview
```

The build profile should be configured in `eas.json` for internal APK distribution. Check the project's current configuration before building.

## Backend Configuration

The Moment mobile application communicates with the existing backend service.

**Hosted API:**

```text
https://campuscapsule-backend.onrender.com/api
```

Before testing authentication, group creation, invitations, or memory uploads, make sure the backend is available and its required environment variables are configured.

## Project Structure

The source code is organized into application screens, API services, shared components, and configuration. The exact structure may change as development continues.

```text
campuscapsule-mobile/
├── app/                  # Application routes, if using Expo Router
├── src/
│   ├── api/              # API clients and service modules
│   ├── components/       # Reusable UI components
│   ├── screens/          # Application screens, if applicable
│   └── store/            # Application state management, if applicable
├── assets/               # Images, icons, and other assets
├── .env.example          # Environment variable template
├── .gitignore
├── app.json              # Expo configuration
├── eas.json              # EAS build configuration
├── package.json
└── README.md
```

Adjust this tree to match the actual repository structure before publishing.

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a branch for your change.
3. Make your changes and test them.
4. Submit a pull request with a clear description.

For major features or significant UI changes, consider opening an issue first to discuss the proposal.

Please avoid committing credentials, local environment files, generated build artifacts, or unrelated changes.

## License

This project is intended to be released under the MIT License. The actual `LICENSE` file must be added to the repository before the project is formally distributed under that license.

## Author

**Anus Afzal**

GitHub: [@AnusAfzal](https://github.com/AnusAfzal)

## Related Project

- [CampusCapsule Backend](https://github.com/AnusAfzal/campuscapsule-backend)

---

*Moment — A daily archive for your circle.*
