import { z } from "zod";

export const financeInputSchema = z.object({
  netIncome: z.number().finite().nonnegative().max(1_000_000_000),
  essentials: z.object({
    housing: z.number().finite().nonnegative(), food: z.number().finite().nonnegative(),
    utilities: z.number().finite().nonnegative(), transport: z.number().finite().nonnegative(),
    healthEducation: z.number().finite().nonnegative(), other: z.number().finite().nonnegative(),
  }),
  debtPayments: z.number().finite().nonnegative(),
  savingsTarget: z.number().finite().nonnegative().default(0),
  investTarget: z.number().finite().nonnegative().default(0),
  wantsInvesting: z.boolean().default(false),
  investmentHorizonYears: z.number().finite().nonnegative().max(100).default(0),
  riskTolerance: z.enum(["unset", "low", "medium", "high"]).default("unset"),
});
export type FinanceInput = z.infer<typeof financeInputSchema>;
export type FinancePlan = {
  netIncome: number; essentialTotal: number; debtPayments: number; requiredTotal: number;
  deficit: number; surplus: number; essentialsFunded: number; savings: number;
  investment: number; flexible: number; needsCoverage: number;
  status: "deficit" | "balanced" | "surplus"; explanation: string;
};

export function calculatePlan(input: FinanceInput): FinancePlan {
  const e = input.essentials;
  const essentialTotal = e.housing + e.food + e.utilities + e.transport + e.healthEducation + e.other;
  const requiredTotal = essentialTotal + input.debtPayments;
  const deficit = Math.max(0, requiredTotal - input.netIncome);
  const surplus = Math.max(0, input.netIncome - requiredTotal);
  const essentialsFunded = Math.min(input.netIncome, requiredTotal);
  const savings = Math.min(surplus, input.savingsTarget);
  const investmentReady = input.wantsInvesting && input.investmentHorizonYears > 0 && input.riskTolerance !== "unset";
  const investment = investmentReady ? Math.min(Math.max(0, surplus - savings), input.investTarget) : 0;
  const flexible = Math.max(0, surplus - savings - investment);
  const needsCoverage = requiredTotal === 0 ? 100 : Math.min(100, (input.netIncome / requiredTotal) * 100);
  const status = deficit > 0 ? "deficit" : surplus > 0 ? "surplus" : "balanced";
  const explanation = deficit > 0
    ? "الدخل الصافي لا يغطي الضروريات والالتزامات المسجلة؛ أوقفنا الادخار والاستثمار في هذه الخطة."
    : surplus === 0
      ? "الدخل يغطي الضروريات والالتزامات فقط؛ لا يوجد مبلغ اختياري مفترض."
      : input.wantsInvesting && !investmentReady
        ? "الضروريات مغطاة، لكن الاستثمار بقي صفرًا حتى تُدخل أفقك الزمني ومستوى تحمل المخاطر."
        : "الضروريات والالتزامات مغطاة. الادخار والاستثمار يظلان اختياريين وفق المبالغ التي أدخلتها.";
  return { netIncome: input.netIncome, essentialTotal, debtPayments: input.debtPayments, requiredTotal, deficit, surplus, essentialsFunded, savings, investment, flexible, needsCoverage, status, explanation };
}
