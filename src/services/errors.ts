/**
 * Custom error classes for expense repository operations
 */

export class FirestoreError extends Error {
  constructor(
    message: string,
    public code?: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'FirestoreError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class FirestoreNotInitializedError extends FirestoreError {
  constructor() {
    super(
      'Firestore is not initialized. Check Firebase configuration.',
      'NOT_INITIALIZED'
    );
    this.name = 'FirestoreNotInitializedError';
  }
}
