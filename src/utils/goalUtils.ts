import type { Goal } from '../types/goals';

export const calculateGoalAllocation = (goal: Goal): number => {
  switch (goal.type) {
    case 'deadline':
      return Math.max(0, (goal.target - goal.current) / goal.monthsRemaining);
    case 'monthly':
      return goal.monthlyAllocation;
    case 'reserve':
      return goal.current < goal.floor ? goal.floor - goal.current : 0;
    case 'someday':
      return 0; // Someday goals are for excess cash, no fixed allocation
    default:
      return 0;
  }
};

export const calculateGoalPercentage = (goal: Goal): number => {
  return Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
};

export const calculateTotalGoalAllocations = (goals: Goal[]): number => {
  return goals.reduce((sum, goal) => sum + calculateGoalAllocation(goal), 0);
};
