import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import type Expense from "@/src/types/Expense";
import type { ExpenseRepository } from "@/src/services/expenseRepository";
import { db } from "@/src/config/firebase";
import {
  FirestoreError,
  FirestoreNotInitializedError,
  ValidationError,
} from "@/src/services/errors";

const COLLECTION = "expenses";

// Log message constants
const LOG_MESSAGES = {
  FETCHING: "📖 Fetching expenses from Firestore...",
  LOADED: (count: number) => `✅ Loaded ${count} expenses from Firestore`,
  ERROR_FETCHING: "❌ Error fetching expenses from Firestore",
  INDEX_MISSING: "⚠️ Index missing, fetching without orderBy...",
  REPLACING: (count: number) =>
    `💾 Replacing all expenses in Firestore (${count} items)...`,
  REPLACED: "✅ Successfully replaced all expenses in Firestore",
  ERROR_REPLACING: "❌ Error replacing expenses",
  CREATING: (title: string) => `➕ Creating expense in Firestore: ${title}`,
  CREATED: "✅ Expense created successfully",
  ERROR_CREATING: "❌ Error creating expense",
  UPDATING: (id: string) => `✏️ Updating expense in Firestore: ${id}`,
  UPDATED: "✅ Expense updated successfully",
  ERROR_UPDATING: "❌ Error updating expense",
  DELETING: (id: string) => `🗑️ Deleting expense from Firestore: ${id}`,
  DELETED: "✅ Expense deleted successfully",
  ERROR_DELETING: "❌ Error deleting expense",
} as const;

function getCollection() {
  if (!db) {
    throw new FirestoreNotInitializedError();
  }
  return collection(db, COLLECTION);
}

// Type guard for Firestore Timestamp
function isFirestoreTimestamp(
  value: unknown
): value is { seconds: number; nanoseconds: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    "nanoseconds" in value &&
    typeof (value as { seconds: unknown }).seconds === "number" &&
    typeof (value as { nanoseconds: unknown }).nanoseconds === "number"
  );
}

// Helper function to remove undefined values from an object
function removeUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

// Helper function to convert Firestore Timestamp to YYYY-MM-DD string
function convertTimestampToString(date: unknown): string {
  if (!date) {
    return new Date().toISOString().split("T")[0];
  }

  // If it's already a string, return it
  if (typeof date === "string") {
    return date;
  }

  // If it's a Firestore Timestamp, convert it
  if (isFirestoreTimestamp(date)) {
    const dateObj = new Date(date.seconds * 1000);
    return dateObj.toISOString().split("T")[0];
  }

  // If it's a Date object
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }

  // Fallback: try to parse as Date
  try {
    const dateObj = new Date(date as string | number);
    return dateObj.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

// Input validation functions
function validateExpenseId(id: string): void {
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new ValidationError("Expense ID is required and must be a non-empty string", "id");
  }
}

function validateExpense(expense: Expense): void {
  validateExpenseId(expense.id);

  if (!expense.title || typeof expense.title !== "string" || expense.title.trim() === "") {
    throw new ValidationError("Expense title is required", "title");
  }

  if (typeof expense.amount !== "number" || expense.amount < 0 || !isFinite(expense.amount)) {
    throw new ValidationError(
      "Expense amount must be a positive number",
      "amount"
    );
  }

  if (!expense.date || typeof expense.date !== "string") {
    throw new ValidationError("Expense date is required", "date");
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(expense.date)) {
    throw new ValidationError(
      "Expense date must be in YYYY-MM-DD format",
      "date"
    );
  }
}

// Helper function to map Firestore document to Expense
function mapDocToExpense(doc: QueryDocumentSnapshot): Expense {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title as string,
    amount: data.amount as number,
    date: convertTimestampToString(data.date),
    category: data.category as string | undefined,
    note: data.note as string | undefined,
    paymentMethod: data.paymentMethod as string | undefined,
  } as Expense;
}

export class FirestoreExpenseRepository implements ExpenseRepository {
  async list(): Promise<Expense[]> {
    if (!db) {
      throw new FirestoreNotInitializedError();
    }

    try {
      console.log(LOG_MESSAGES.FETCHING);
      const snap = await getDocs(query(getCollection(), orderBy("date", "desc")));
      const expenses = snap.docs.map(mapDocToExpense);
      console.log(LOG_MESSAGES.LOADED(expenses.length));
      return expenses;
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.ERROR_FETCHING, error);

      // If orderBy fails due to missing index, try without it
      if (
        error instanceof Error &&
        (error as { code?: string }).code === "failed-precondition"
      ) {
        console.log(LOG_MESSAGES.INDEX_MISSING);
        try {
          const snap = await getDocs(getCollection());
          const expenses = snap.docs.map(mapDocToExpense);
          console.log(LOG_MESSAGES.LOADED(expenses.length));
          return expenses;
        } catch (fallbackError: unknown) {
          throw new FirestoreError(
            "Failed to fetch expenses from Firestore",
            (fallbackError as { code?: string }).code,
            fallbackError
          );
        }
      }

      throw new FirestoreError(
        "Failed to fetch expenses. Please check your connection and try again.",
        (error as { code?: string }).code,
        error
      );
    }
  }

  async replaceAll(expenses: Expense[]): Promise<void> {
    if (!db) {
      throw new FirestoreNotInitializedError();
    }

    // Validate all expenses before processing
    expenses.forEach((expense) => validateExpense(expense));

    try {
      console.log(LOG_MESSAGES.REPLACING(expenses.length));
      const col = getCollection();
      const batch = writeBatch(db);
      const existing = await getDocs(col);
      existing.docs.forEach((d) => batch.delete(d.ref));
      expenses.forEach((exp) => {
        const ref = doc(col, exp.id);
        const { id: _, ...data } = exp;
        const cleanData = removeUndefined(data);
        batch.set(ref, cleanData);
      });
      await batch.commit();
      console.log(LOG_MESSAGES.REPLACED);
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.ERROR_REPLACING, error);
      throw new FirestoreError(
        "Failed to replace expenses. Please try again.",
        (error as { code?: string }).code,
        error
      );
    }
  }

  async create(expense: Expense): Promise<void> {
    if (!db) {
      throw new FirestoreNotInitializedError();
    }

    validateExpense(expense);

    try {
      console.log(LOG_MESSAGES.CREATING(expense.title));
      const ref = doc(getCollection(), expense.id);
      const { id: _, ...data } = expense;
      const cleanData = removeUndefined(data);
      await setDoc(ref, cleanData);
      console.log(LOG_MESSAGES.CREATED);
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.ERROR_CREATING, error);
      throw new FirestoreError(
        "Failed to create expense. Please check your connection and try again.",
        (error as { code?: string }).code,
        error
      );
    }
  }

  async update(expense: Expense): Promise<void> {
    if (!db) {
      throw new FirestoreNotInitializedError();
    }

    validateExpense(expense);

    try {
      console.log(LOG_MESSAGES.UPDATING(expense.id));
      const ref = doc(getCollection(), expense.id);
      const { id: _, ...data } = expense;
      const cleanData = removeUndefined(data);
      await setDoc(ref, cleanData, { merge: true });
      console.log(LOG_MESSAGES.UPDATED);
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.ERROR_UPDATING, error);
      throw new FirestoreError(
        "Failed to update expense. Please check your connection and try again.",
        (error as { code?: string }).code,
        error
      );
    }
  }

  async remove(id: string): Promise<void> {
    if (!db) {
      throw new FirestoreNotInitializedError();
    }

    validateExpenseId(id);

    try {
      console.log(LOG_MESSAGES.DELETING(id));
      const ref = doc(getCollection(), id);
      await deleteDoc(ref);
      console.log(LOG_MESSAGES.DELETED);
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.ERROR_DELETING, error);
      throw new FirestoreError(
        "Failed to delete expense. Please check your connection and try again.",
        (error as { code?: string }).code,
        error
      );
    }
  }
}