import { useCallback, useEffect, useState } from "react";
import { calculatePlan, type FinanceInput } from "@/shared/finance";
import { initialFinanceData, loadData, saveData, type AppData, type Transaction } from "@/lib/storage/finance-store";
import { getApiBaseUrl } from "@/constants/oauth";

export function useFinanceData() {
  const [data, setData] = useState<AppData>(initialFinanceData);
  const [ready, setReady] = useState(false);
  const [networkMessage, setNetworkMessage] = useState("");
  useEffect(() => { loadData().then((stored) => { setData(stored); setReady(true); }); }, []);
  const update = useCallback((next: AppData) => {
    setData(next);
    void saveData(next);
  }, []);
  const editProfile = useCallback((patch: Partial<Omit<FinanceInput, "essentials">> & { essentials?: Partial<FinanceInput["essentials"]> }) => {
    update({ ...data, profile: { ...data.profile, ...patch, essentials: { ...data.profile.essentials, ...(patch.essentials ?? {}) } } });
  }, [data, update]);
  const addTransaction = useCallback((kind: Transaction["kind"], amount: number, category: string) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    update({ ...data, transactions: [{ id: `${Date.now()}`, kind, amount, category, createdAt: new Date().toISOString() }, ...data.transactions] });
  }, [data, update]);
  const analyze = useCallback(async () => {
    const local = calculatePlan(data.profile);
    if (!data.serverConsent) { setNetworkMessage("أُجري التحليل على الجهاز فقط. فعّل الإذن إذا أردت طلب تحليل الخادم."); update({ ...data, plan: local, planStatus: "suggested" }); return local; }
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/budget/recommend`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data.profile) });
      if (!response.ok) throw new Error("server");
      const remote = await response.json();
      setNetworkMessage("تم التحليل على الخادم بناءً على البيانات التي وافقت على إرسالها؛ لم تُحفظ هناك.");
      update({ ...data, plan: remote, planStatus: "suggested" });
      return remote;
    } catch {
      setNetworkMessage("الخادم غير متاح الآن؛ عُرض الحساب المحلي على الجهاز.");
      update({ ...data, plan: local, planStatus: "suggested" });
      return local;
    }
  }, [data, update]);
  return { data, ready, networkMessage, update, editProfile, addTransaction, analyze };
}
