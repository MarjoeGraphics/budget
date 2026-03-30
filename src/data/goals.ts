import type { Goal } from '../types/goals';

export const mockGoals: Goal[] = [
  {
    id: '1',
    type: 'deadline',
    title: 'Europe Trip',
    current: 1500,
    target: 5000,
    monthsRemaining: 10,
    icon: 'Plane',
    color: 'blue'
  },
  {
    id: '2',
    type: 'monthly',
    title: 'Groceries',
    current: 450,
    target: 600,
    monthlyAllocation: 600,
    icon: 'ShoppingCart',
    color: 'green'
  },
  {
    id: '3',
    type: 'reserve',
    title: 'Emergency Fund',
    current: 800,
    target: 10000,
    floor: 2000,
    icon: 'Shield',
    color: 'amber'
  },
  {
    id: '4',
    type: 'someday',
    title: 'Dream Car',
    current: 2500,
    target: 45000,
    icon: 'Car',
    color: 'indigo'
  }
];
