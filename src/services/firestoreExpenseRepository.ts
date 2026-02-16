import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    writeBatch,
    query,
    orderBy,
  } from "firebase/firestore";
  import type Expense from "@/src/types/Expense";
  import type { ExpenseRepository } from "@/src/services/expenseRepository";
  import { db } from "@/src/config/firebase";
  
  const COLLECTION = "expenses";
  
  function getCollection() {
    if (!db) throw new Error("Firestore is not initialized. Check Firebase config.");
    return collection(db, COLLECTION);
  }
  
  export class FirestoreExpenseRepository implements ExpenseRepository {
    async list(): Promise<Expense[]> {
      if (!db) {
        console.warn("⚠️ Firestore not available, returning empty array");
        return [];
      }
      try {
        console.log("📖 Fetching expenses from Firestore...");
        const snap = await getDocs(query(getCollection(), orderBy("date", "desc")));
        const expenses = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
        console.log(`✅ Loaded ${expenses.length} expenses from Firestore`);
        return expenses;
      } catch (error: any) {
        console.error("❌ Error fetching expenses from Firestore:", error);
        // If orderBy fails due to missing index, try without it
        if (error.code === "failed-precondition") {
          console.log("⚠️ Index missing, fetching without orderBy...");
          const snap = await getDocs(getCollection());
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
        }
        throw error;
      }
    }
  
    async replaceAll(expenses: Expense[]): Promise<void> {
      if (!db) return;
      try {
        console.log(`💾 Replacing all expenses in Firestore (${expenses.length} items)...`);
        const col = getCollection();
        const batch = writeBatch(db);
        const existing = await getDocs(col);
        existing.docs.forEach((d) => batch.delete(d.ref));
        expenses.forEach((exp) => {
          const ref = doc(col, exp.id);
          const { id: _, ...data } = exp;
          batch.set(ref, data);
        });
        await batch.commit();
        console.log("✅ Successfully replaced all expenses in Firestore");
      } catch (error) {
        console.error("❌ Error replacing expenses:", error);
        throw error;
      }
    }
  
    async create(expense: Expense): Promise<void> {
      if (!db) return;
      try {
        console.log("➕ Creating expense in Firestore:", expense.title);
        const ref = doc(getCollection(), expense.id);
        const { id: _, ...data } = expense;
        await setDoc(ref, data);
        console.log("✅ Expense created successfully");
      } catch (error) {
        console.error("❌ Error creating expense:", error);
        throw error;
      }
    }
  
    async update(expense: Expense): Promise<void> {
      if (!db) return;
      try {
        console.log("✏️ Updating expense in Firestore:", expense.id);
        const ref = doc(getCollection(), expense.id);
        const { id: _, ...data } = expense;
        await setDoc(ref, data, { merge: true });
        console.log("✅ Expense updated successfully");
      } catch (error) {
        console.error("❌ Error updating expense:", error);
        throw error;
      }
    }
  
    async remove(id: string): Promise<void> {
      if (!db) return;
      try {
        console.log("🗑️ Deleting expense from Firestore:", id);
        const ref = doc(getCollection(), id);
        await deleteDoc(ref);
        console.log("✅ Expense deleted successfully");
      } catch (error) {
        console.error("❌ Error deleting expense:", error);
        throw error;
      }
    }
  }