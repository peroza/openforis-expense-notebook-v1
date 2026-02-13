import { Stack } from "expo-router";
import { ExpensesProvider } from "@/src/context/ExpensesContext";

export default function RootLayout() {
  return (
    <ExpensesProvider>
      <Stack />
    </ExpensesProvider>
  );
}
