import type Expense from "@/src/types/Expense";
import type { ExpenseRepository } from "@/src/services/expenseRepository";
import { AsyncStorageExpenseRepository } from "@/src/services/asyncStorageExpenseRepository";
import { FirestoreExpenseRepository } from "@/src/services/firestoreExpenseRepository";
import { SyncQueue, type SyncOperation } from "@/src/services/syncQueue";
import { db } from "@/src/config/firebase";

export class HybridExpenseRepository implements ExpenseRepository {
  private localRepo: AsyncStorageExpenseRepository;
  private remoteRepo: FirestoreExpenseRepository | null;
  private syncQueue: SyncQueue;
  private isOnline: boolean = true;

  constructor(isOnline: boolean = true) {
    this.localRepo = new AsyncStorageExpenseRepository();
    this.remoteRepo = db ? new FirestoreExpenseRepository() : null;
    this.syncQueue = new SyncQueue();
    this.isOnline = isOnline;
  }

  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
  }

  // Merge expenses: local takes precedence, then merge remote
  private mergeExpenses(local: Expense[], remote: Expense[]): Expense[] {
    const merged = new Map<string, Expense>();
    
    // Add remote expenses first
    remote.forEach((expense) => {
      merged.set(expense.id, expense);
    });
    
    // Overwrite with local expenses (local is source of truth)
    local.forEach((expense) => {
      merged.set(expense.id, expense);
    });
    
    return Array.from(merged.values()).sort((a, b) => 
      b.date.localeCompare(a.date)
    );
  }

  async list(): Promise<Expense[]> {
    // Always read from local first (instant, offline-capable)
    const local = await this.localRepo.list();
    
    // If online and Firestore is available, merge with remote
    if (this.isOnline && this.remoteRepo) {
      try {
        const remote = await this.remoteRepo.list();
        const merged = this.mergeExpenses(local, remote);
        // Update local with merged data
        await this.localRepo.replaceAll(merged);
        return merged;
      } catch (error) {
        console.warn("⚠️ Failed to sync from Firestore, using local data:", error);
        return local;
      }
    }
    
    return local;
  }

  async create(expense: Expense): Promise<void> {
    // Always write to local first (instant, offline-capable)
    await this.localRepo.create(expense);
    
    // If online and Firestore is available, sync immediately
    if (this.isOnline && this.remoteRepo) {
      try {
        await this.remoteRepo.create(expense);
        console.log("✅ Synced create to Firestore");
      } catch (error) {
        console.warn("⚠️ Failed to sync create, queuing:", error);
        await this.syncQueue.addToQueue({ type: "create", expense });
      }
    } else {
      // Queue for later sync
      await this.syncQueue.addToQueue({ type: "create", expense });
    }
  }

  async update(expense: Expense): Promise<void> {
    // Always write to local first
    await this.localRepo.update(expense);
    
    // If online and Firestore is available, sync immediately
    if (this.isOnline && this.remoteRepo) {
      try {
        await this.remoteRepo.update(expense);
        console.log("✅ Synced update to Firestore");
      } catch (error) {
        console.warn("⚠️ Failed to sync update, queuing:", error);
        await this.syncQueue.addToQueue({ type: "update", expense });
      }
    } else {
      // Queue for later sync
      await this.syncQueue.addToQueue({ type: "update", expense });
    }
  }

  async remove(id: string): Promise<void> {
    // Always write to local first
    await this.localRepo.remove(id);
    
    // If online and Firestore is available, sync immediately
    if (this.isOnline && this.remoteRepo) {
      try {
        await this.remoteRepo.remove(id);
        console.log("✅ Synced delete to Firestore");
      } catch (error) {
        console.warn("⚠️ Failed to sync delete, queuing:", error);
        await this.syncQueue.addToQueue({ type: "delete", id });
      }
    } else {
      // Queue for later sync
      await this.syncQueue.addToQueue({ type: "delete", id });
    }
  }

  async replaceAll(expenses: Expense[]): Promise<void> {
    // Always write to local first
    await this.localRepo.replaceAll(expenses);
    
    // If online and Firestore is available, sync immediately
    if (this.isOnline && this.remoteRepo) {
      try {
        await this.remoteRepo.replaceAll(expenses);
        console.log("✅ Synced replaceAll to Firestore");
      } catch (error) {
        console.warn("⚠️ Failed to sync replaceAll:", error);
        // For replaceAll, we don't queue - it's a bulk operation
      }
    }
  }

  // Sync queued operations when coming back online
  async processSyncQueue(): Promise<void> {
    if (!this.isOnline || !this.remoteRepo) {
      return;
    }

    const queue = await this.syncQueue.getQueue();
    if (queue.length === 0) {
      return;
    }

    console.log(`🔄 Syncing ${queue.length} queued operations...`);
    
    for (let i = queue.length - 1; i >= 0; i--) {
      const operation = queue[i];
      try {
        switch (operation.type) {
          case "create": {
            const exp = operation.expense;
            const amount = Number(exp.amount);
            if (!Number.isFinite(amount) || amount <= 0) {
              console.warn(`Skipping create for expense ${exp.id}: invalid amount`, exp.amount);
              await this.syncQueue.removeFromQueue(i);
              break;
            }
            await this.remoteRepo.create({ ...exp, amount });
            break;
          }
          case "update":
            await this.remoteRepo.update(operation.expense);
            break;
          case "delete":
            await this.remoteRepo.remove(operation.id);
            break;
        }
        await this.syncQueue.removeFromQueue(i);
        console.log(`✅ Synced ${operation.type} operation`);
      } catch (error) {
        console.error(`❌ Failed to sync ${operation.type}:`, error);
        // Keep in queue for next sync attempt
      }
    }
    
    console.log("✅ Sync queue processing completed");
  }
}