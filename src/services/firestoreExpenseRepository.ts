import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    getDoc,
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
      if (!db) return [];
      const snap = await getDocs(query(getCollection(), orderBy("date", "desc")));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
    }
  
    async replaceAll(expenses: Expense[]): Promise<void> {
      if (!db) return;
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
    }
  
    async create(expense: Expense): Promise<void> {
      if (!db) return;
      const ref = doc(getCollection(), expense.id);
      const { id: _, ...data } = expense;
      await setDoc(ref, data);
    }
  
    async update(expense: Expense): Promise<void> {
      if (!db) return;
      const ref = doc(getCollection(), expense.id);
      const { id: _, ...data } = expense;
      await setDoc(ref, data, { merge: true });
    }
  
    async remove(id: string): Promise<void> {
      if (!db) return;
      const ref = doc(getCollection(), id);
      await deleteDoc(ref);
    }
  }