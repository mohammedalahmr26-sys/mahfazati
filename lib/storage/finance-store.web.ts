import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FinanceInput, FinancePlan } from "@/shared/finance";
export type Transaction = { id: string; kind: "income" | "expense"; amount: number; category: string; createdAt: string };
export type AppData = { profile: FinanceInput; plan: FinancePlan | null; planStatus: "suggested" | "accepted"; transactions: Transaction[]; language: "ar" | "en"; theme: "light" | "dark"; serverConsent: boolean };
const KEY = "yadira.finance.v1";
const INITIAL: AppData = { profile: { netIncome: 0, essentials: { housing: 0, food: 0, utilities: 0, transport: 0, healthEducation: 0, other: 0 }, debtPayments: 0, savingsTarget: 0, investTarget: 0, wantsInvesting: false, investmentHorizonYears: 0, riskTolerance: "unset" }, plan: null, planStatus: "suggested", transactions: [], language: "ar", theme: "light", serverConsent: false };
export async function loadData(): Promise<AppData> { try { const raw = await AsyncStorage.getItem(KEY); return raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL; } catch { return INITIAL; } }
export async function saveData(data: AppData): Promise<void> { await AsyncStorage.setItem(KEY, JSON.stringify(data)); }
export const initialFinanceData = INITIAL;
