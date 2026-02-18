# Open Foris Expense Notebook

A mobile-first expense tracking notebook built with Expo and React Native for the Open Foris initiative. The app enables field teams and project staff to capture, review, and synchronize expenses in a simple, structured, and reliable way.

## Features

- **Offline-first expense capture**: Record expenses even with limited or no connectivity; data is synchronized when a connection is available.
- **Structured expense metadata**: Store date, category, amount, description, and additional context needed for field reporting.
- **Secure cloud storage**: Persist data using Firebase/Firestore (configurable for different environments).
- **Simple review workflow**: Browse, filter, and edit existing expenses from a clean, mobile-friendly interface.
- **Built with modern tooling**: Expo Router, React Context, and custom hooks for a maintainable, testable codebase.

## Technology stack

- **Runtime**: [Expo](https://expo.dev) / React Native
- **Language**: TypeScript
- **State & data**: React Context, custom hooks, Firestore-backed repository layer
- **Tooling**: Expo Router, EAS, npm

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Firebase**

   Create and populate your Firebase configuration in `src/config/firebase.ts` (or use environment-specific configuration as appropriate for your deployment).

3. **Run the app**

   ```bash
   npx expo start
   ```

   You can then open the app in:
   - an iOS simulator,
   - an Android emulator, or
   - the Expo Go client.

## Project structure

The most relevant directories are:

- `app/` – Expo Router screens (e.g. `index`, `add-expense`, `expenses`)
- `src/context/` – shared React contexts (e.g. `ExpensesContext`)
- `src/hooks/` – reusable hooks (e.g. network status)
- `src/services/` – data access and repository implementations (e.g. Firestore expense repository)
- `src/config/` – configuration (e.g. Firebase)

## Development

- **Start development server**

  ```bash
  npx expo start
  ```

- **Reset to a clean starter (optional)**

  ```bash
  npm run reset-project
  ```

## Contributing

Contributions are welcome. Please:

1. Open an issue describing the proposed change or bug.
2. Fork the repository and create a feature branch.
3. Submit a pull request with a clear description and, where relevant, screenshots or notes about testing.

## License

This project is released under the [MIT License](LICENSE) (or update to the appropriate license for the Open Foris ecosystem).
