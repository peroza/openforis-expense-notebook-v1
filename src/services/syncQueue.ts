import AsyncStorage from "@react-native-async-storage/async-storage";
import type Expense from "@/src/types/Expense";

const SYNC_QUEUE_KEY = "@sync_queue";

export type SyncOperation = 
  | { type: "create"; expense: Expense }
  | { type: "update"; expense: Expense }
  | { type: "delete"; id: string };

export class SyncQueue {
  async getQueue(): Promise<SyncOperation[]> {
    try {
      const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async addToQueue(operation: SyncOperation): Promise<void> {
    const queue = await this.getQueue();
    queue.push(operation);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  }

  async removeFromQueue(index: number): Promise<void> {
    const queue = await this.getQueue();
    queue.splice(index, 1);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }
}