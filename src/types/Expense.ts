export default interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD format
  category?: string; // Optional for now
  note?: string;
  paymentMethod?: string;
  };