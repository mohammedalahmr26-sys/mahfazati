import { describe, expect, it } from "vitest";
import { calculatePlan } from "../shared/finance";
const base = { netIncome: 1000, essentials: { housing: 300, food: 250, utilities: 50, transport: 100, healthEducation: 50, other: 0 }, debtPayments: 100, savingsTarget: 50, investTarget: 200, wantsInvesting: true, investmentHorizonYears: 5, riskTolerance: "medium" as const };
describe("calculatePlan", () => {
  it("prioritizes needs and disables optional allocation when income is insufficient", () => {
    const result = calculatePlan({ ...base, netIncome: 500 });
    expect(result.status).toBe("deficit");
    expect(result.deficit).toBe(350);
    expect(result.savings).toBe(0);
    expect(result.investment).toBe(0);
  });
  it("caps optional savings and investments at actual surplus", () => {
    const result = calculatePlan(base);
    expect(result.surplus).toBe(150);
    expect(result.savings + result.investment + result.flexible).toBe(150);
  });
  it("keeps investment at zero until horizon and risk are provided", () => {
    expect(calculatePlan({ ...base, investmentHorizonYears: 0 }).investment).toBe(0);
  });
  it("keeps investment at zero when the user opts out", () => {
    expect(calculatePlan({ ...base, wantsInvesting: false }).investment).toBe(0);
  });
  it("does not subtract withholding twice when given net income", () => {
    const result = calculatePlan({ ...base, netIncome: 1000 });
    expect(result.netIncome).toBe(1000);
    expect(result.surplus).toBe(150);
  });
});
