import { useMemo } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';

export const useWaterfall = () => {
  const { balance, dues } = useBudgetStore();

  const waterfall = useMemo(() => {
    // 1. Sort dues by Priority (primary), then by Day of Month (secondary), then by Amount (descending)
    const sortedDues = [...dues].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      if (a.dayOfMonth !== b.dayOfMonth) {
        return a.dayOfMonth - b.dayOfMonth;
      }
      return b.amount - a.amount;
    });

    let remainingBalance = balance;
    const allocations: Record<string, number> = {};

    // 2. Pour balance into sorted dues
    sortedDues.forEach((due) => {
      if (due.isPaid) {
        // Skip already paid dues - they've already had their cost deducted from balance
        allocations[due.id] = due.amount;
        return;
      }

      const allocation = Math.min(remainingBalance, due.amount);
      allocations[due.id] = allocation;
      remainingBalance -= allocation;
    });

    return allocations;
  }, [balance, dues]);

  return waterfall;
};
