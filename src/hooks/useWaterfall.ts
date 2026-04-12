import { useMemo } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';

export const useWaterfall = () => {
  const { balance, dues } = useBudgetStore();

  const waterfall = useMemo(() => {
    try {
      if (!Array.isArray(dues)) return {};
      const safeBalance = typeof balance === 'number' ? balance : 0;

      // 1. Sort dues by Priority (primary), then by Day of Month (secondary), then by Amount (descending)
      const sortedDues = [...dues].sort((a, b) => {
        const pA = a?.priority ?? 3;
        const pB = b?.priority ?? 3;
        if (pA !== pB) {
          return pA - pB;
        }
        if (a.dayOfMonth !== b.dayOfMonth) {
          return a.dayOfMonth - b.dayOfMonth;
        }
        return (b.amount ?? 0) - (a.amount ?? 0);
      });

      let remainingBalance = safeBalance;
      const allocations: Record<string, number> = {};

      // 2. Pour balance into sorted dues
      sortedDues.forEach((due) => {
        if (!due?.id) return;

        if (due.isPaid) {
          // Skip already paid dues - they've already had their cost deducted from balance
          allocations[due.id] = due.amount ?? 0;
          return;
        }

        const allocation = Math.min(remainingBalance, due.amount ?? 0);
        allocations[due.id] = allocation;
        remainingBalance -= allocation;
      });

      return allocations;
    } catch (error) {
      console.error("Waterfall calculation failed:", error);
      return {};
    }
  }, [balance, dues]);

  return waterfall;
};
