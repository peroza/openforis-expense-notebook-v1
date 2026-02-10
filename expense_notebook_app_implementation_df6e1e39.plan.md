---
name: Expense Notebook App Implementation
overview: Create a React Native Expo mobile app for expense tracking that integrates with Ground and Arena Mobile via deep links, uses Firebase for authentication and Firestore for data storage, and supports offline-first functionality with sync capabilities.
todos:
  - id: setup-expo
    content: Initialize Expo project with TypeScript and configure app.json for deep linking
    status: completed
  - id: install-deps
    content: Install core dependencies (Firebase, navigation, UI library, forms, etc.)
    status: completed
  - id: firebase-config
    content: Set up Firebase project, authentication, and Firestore database
    status: completed
  - id: project-structure
    content: Create project folder structure (app/, src/, components/, services/, etc.)
    status: completed
  - id: deep-linking
    content: Implement deep link handler to receive plotId, userId, projectId, authToken from Ground/Arena
    status: completed
  - id: auth-service
    content: Implement Firebase authentication service with SSO support
    status: completed
  - id: data-models
    content: Create TypeScript types and Firestore data models for expenses
    status: completed
  - id: expense-list
    content: Build expense list screen showing expenses filtered by plotId
    status: completed
  - id: add-expense
    content: Create add expense form screen with all required fields
    status: completed
  - id: edit-expense
    content: Implement edit/delete expense functionality
    status: completed
  - id: offline-sync
    content: Implement offline storage and sync service with status indicators
    status: completed
  - id: ui-polish
    content: Apply UI/UX design, implement loading states, error handling, and i18n
    status: completed
isProject: false
---

# Expense Notebook App - Implementation Plan

## Project Overview

Build a React Native mobile app using Expo that allows users to record expenses linked to Ground/Arena plots. The app will be launched via deep links from Ground Android and Arena Mobile apps, use Firebase Authentication (SSO with Ground), and store data in Firestore with offline sync support.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│  Ground/Arena   │         │  Expense Notebook│
│     Mobile      │────────▶│      App         │
│                 │ Deep    │  (React Native)  │
└─────────────────┘ Link    └────────┬─────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │    Firebase      │
                            │  - Auth (SSO)    │
                            │  - Firestore     │
                            └──────────────────┘
```

## Phase 1: Project Setup & Configuration

### 1.1 Initialize Expo Project

- Create new Expo project with TypeScript template
- Configure `app.json`/`app.config.js` for deep linking
- Set up custom URL scheme: `expense-notebook://`
- Configure app name, bundle ID, and package name

### 1.2 Install Core Dependencies

- `expo-router` - Navigation and routing
- `@react-native-firebase/app` & `@react-native-firebase/auth` & `@react-native-firebase/firestore` - Firebase integration
- `expo-linking` - Deep link handling
- `@react-native-async-storage/async-storage` - Local storage
- `react-native-paper` or `@rneui/themed` - UI components
- `date-fns` - Date handling
- `react-hook-form` - Form management
- `zod` - Schema validation

### 1.3 Project Structure

```
openforis-expense-notebook/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Auth screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── services/          # Business logic & API
│   │   ├── auth.ts        # Firebase auth service
│   │   ├── firestore.ts   # Firestore operations
│   │   └── sync.ts        # Offline sync logic
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── constants/         # App constants
├── firebase/              # Firebase config
│   └── config.ts
└── app.json               # Expo configuration
```

## Phase 2: Firebase Configuration

### 2.1 Firebase Project Setup

- Create/configure Firebase project (reuse Ground's or separate)
- Set up Firebase Authentication (Google Sign-In)
- Configure Firestore database
- Create `plotExpenses` collection structure

### 2.2 Firestore Security Rules

- User can only read/write expenses for plots they have access to
- Validate `plotId`, `userId`, `projectId` on write
- Implement rules based on Ground's authentication context

### 2.3 Data Model Implementation

Create TypeScript interfaces matching the expense entity:

- `expenseId`, `plotId`, `projectId`, `userId`
- `category`, `type`, `technology`
- `date`, `amount`, `currency`
- `note`, `paymentMethod`
- `attachments[]`, `syncStatus`
- `createdAt`, `updatedAt`

## Phase 3: Deep Linking & Integration

### 3.1 Deep Link Configuration

- Configure URL scheme in `app.json`: `expense-notebook://`
- Set up universal links (optional for iOS)
- Handle deep link parameters: `plotId`, `userId`, `projectId`, `authToken`, `returnUrl`, `language`

### 3.2 Deep Link Handler

- Create service to parse incoming deep links
- Extract and validate required parameters
- Store context (plotId, userId, etc.) in app state/AsyncStorage
- Navigate to expense list screen with plot context

### 3.3 Integration Contract

- Document expected URL format: `expense-notebook://expense?plotId={id}&userId={id}&projectId={id}&authToken={token}`
- Provide integration guide for Ground/Arena developers
- Handle missing/invalid parameters gracefully

## Phase 4: Authentication

### 4.1 SSO Integration

- Implement Firebase Auth with Google Sign-In
- Validate `authToken` passed from Ground
- Create auth context/provider for app-wide auth state
- Handle token refresh and session management

### 4.2 Auth Flow

- If token provided via deep link, authenticate automatically
- If no token, show login screen (fallback)
- Store auth state in AsyncStorage for offline access
- Implement logout functionality

## Phase 5: Core Features Implementation

### 5.1 Expense List Screen

- Display expenses filtered by `plotId`
- Show sync status indicator
- Implement pull-to-refresh
- Add pagination for large lists
- Show empty state when no expenses
- Display summary (total amount, count)

### 5.2 Add Expense Screen

- Form with fields: category, type, technology, date, amount, currency, note, payment method
- Form validation using Zod schemas
- Date picker component
- Currency selector
- Category/type dropdowns
- Save button (works offline, queues for sync)
- Cancel/back navigation

### 5.3 Edit/Delete Expense Screen

- Pre-populate form with existing expense data
- Allow editing all fields
- Delete button with confirmation
- Update sync status on changes
- Handle offline edits (queue for sync)

### 5.4 Navigation Structure

- Tab-based navigation (if multiple sections needed)
- Stack navigation for expense detail/edit screens
- "Back to Ground" button/link (uses `returnUrl` if provided)

## Phase 6: Offline Support & Sync

### 6.1 Offline Storage

- Use Firestore offline persistence (enabled by default)
- Store pending writes locally
- Track sync status per expense
- Handle network state changes

### 6.2 Sync Service

- Implement sync status indicators (synced, pending, error)
- Auto-sync when online
- Manual sync trigger
- Conflict resolution (last write wins for V1)
- Error handling and retry logic

### 6.3 Sync Status UI

- Visual indicators for sync status
- Show last sync timestamp
- Display sync errors if any
- Allow manual retry of failed syncs

## Phase 7: UI/UX Implementation

### 7.1 Design System

- Choose UI library (React Native Paper recommended)
- Define color scheme and typography
- Create reusable components (buttons, inputs, cards)
- Implement consistent spacing and layout

### 7.2 Screen Layouts

- Expense list: Card-based layout with key info visible
- Add/Edit form: Clean, scannable form layout
- Fast data entry prioritized (large touch targets, smart defaults)
- Loading states and error messages

### 7.3 Internationalization (i18n)

- Support for multiple languages
- Use `language` parameter from deep link
- Implement i18n library (react-i18next or expo-localization)

## Phase 8: Testing & Quality

### 8.1 Unit Tests

- Test utility functions
- Test data validation schemas
- Test sync logic

### 8.2 Integration Tests

- Test deep link handling
- Test Firebase auth flow
- Test Firestore CRUD operations
- Test offline sync behavior

### 8.3 Manual Testing Checklist

- Deep link from Ground/Arena
- Add expense offline
- Edit expense offline
- Sync when coming online
- Handle network interruptions
- Validate all form fields
- Test on different screen sizes

## Phase 9: Documentation & Deployment

### 9.1 Developer Documentation

- README with setup instructions
- Integration guide for Ground/Arena
- API documentation (Firestore structure)
- Environment configuration guide

### 9.2 Deployment Preparation

- Configure build settings for Android/iOS
- Set up environment variables (Firebase config)
- Create build scripts
- Prepare for app store submission (if needed)

## Key Files to Create

1. `**app.json**` - Expo configuration with deep linking
2. `**app/_layout.tsx**` - Root layout with auth provider
3. `**app/(tabs)/index.tsx**` - Expense list screen
4. `**app/(tabs)/add.tsx**` - Add expense screen
5. `**src/services/firestore.ts**` - Firestore operations
6. `**src/services/auth.ts**` - Authentication service
7. `**src/services/sync.ts**` - Offline sync logic
8. `**src/types/expense.ts**` - TypeScript types
9. `**firebase/config.ts**` - Firebase configuration
10. `**src/utils/deepLink.ts**` - Deep link handler

## Open Questions to Resolve

1. **Firebase Project**: Confirm if using Ground's existing Firebase project or separate one
2. **Firestore Collections**: Confirm collection naming (`plotExpenses`?) and structure
3. **Security Rules**: Coordinate with Roberto on Firestore security rules
4. **Environments**: Set up dev/staging/prod Firebase projects
5. **UI Design**: Review initial view drafts you mentioned
6. **Categories/Types**: Define list of expense categories and types
7. **Attachments**: V1 scope for attachments (images only? file size limits?)

## Next Steps After Plan Approval

1. Initialize Expo project
2. Set up Firebase project and configuration
3. Implement deep linking
4. Build authentication flow
5. Create expense list screen
6. Implement add/edit screens
7. Add offline sync
8. Polish UI/UX
9. Test integration with Ground/Arena
10. Prepare for deployment

