import { useMemo } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';

const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100

export const useWaterfall = () => {
  const { balance, dues } = useBudgetStore();

  const waterfall = useMemo(() => {
    try {
      if (!Array.isArray(dues)) return {};
      const safeBalance = typeof balance === 'number' ? round(balance) : 0;

      // 1. Sort dues by Priority (primary), then by Due Date (secondary), then by Amount (descending)
      const sortedDues = [...dues].sort((a, b) => {
        const pA = a?.priority ?? 3;
        const pB = b?.priority ?? 3;
        if (pA !== pB) {
          return pA - pB;
        }

        const dateA = a.dueDate ?? 0;
        const dateB = b.dueDate ?? 0;
        if (dateA !== dateB) {
          return dateA - dateB;
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
          // We show them as fully funded
          allocations[due.id] = round(due.amount ?? 0);
          return;
        }

        // Use currentAmount (manual contribution) as baseline
        const manualContributed = typeof due.currentAmount === 'number' ? due.currentAmount : 0;
        const needed = Math.max(0, (due.amount ?? 0) - manualContributed);

        const autoAllocation = round(Math.min(remainingBalance, needed));
        allocations[due.id] = round(manualContributed + autoAllocation);
        remainingBalance = round(remainingBalance - autoAllocation);
      });

      return allocations;
    } catch (error) {
      console.error("Waterfall calculation failed:", error);
      return {};
    }
  }, [balance, dues]);

  return waterfall;
};
