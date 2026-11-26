import * as SQLite from "expo-sqlite";
import type { FinanceInput, FinancePlan } from "@/shared/finance";

export type Transaction = { id: string; kind: "income" | "expense"; amount: number; category: string; createdAt: string };
export type AppData = { profile: FinanceInput; plan: FinancePlan | null; planStatus: "suggested" | "accepted"; transactions: Transaction[]; language: "ar" | "en"; theme: "light" | "dark"; serverConsent: boolean };
const INITIAL: AppData = {
  profile: { netIncome: 0, essentials: { housing: 0, food: 0, utilities: 0, transport: 0, healthEducation: 0, other: 0 }, debtPayments: 0, savingsTarget: 0, investTarget: 0, wantsInvesting: false, investmentHorizonYears: 0, riskTolerance: "unset" },
  plan: null, planStatus: "suggested", transactions: [], language: "ar", theme: "light", serverConsent: false,
};
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
async function db() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync("yadira.db");
  const database = await dbPromise;
  await database.execAsync("CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY NOT NULL, payload TEXT NOT NULL)");
  return database;
}
export async function loadData(): Promise<AppData> {
  try {
    const database = await db();
    const row = await database.getFirstAsync<{ payload: string }>("SELECT payload FROM app_state WHERE id = 1");
    return row ? { ...INITIAL, ...JSON.parse(row.payload) } : INITIAL;
  } catch { return INITIAL; }
}
export async function saveData(data: AppData): Promise<void> {
  const database = await db();
  await database.runAsync("INSERT INTO app_state (id, payload) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload", JSON.stringify(data));
}
export { INITIAL as initialFinanceData };
