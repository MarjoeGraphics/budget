import type { DueItem, IncomeEvent } from '../types/dues';

export const mockDues: DueItem[] = [
  { id: '1', name: 'Rent', amount: 1200, dayOfMonth: 1, category: 'Housing', isPaid: true },
  { id: '2', name: 'Internet', amount: 60, dayOfMonth: 5, category: 'Utilities', isPaid: true },
  { id: '3', name: 'Electricity', amount: 85, dayOfMonth: 12, category: 'Utilities', isPaid: false },
  { id: '4', name: 'Gym Membership', amount: 45, dayOfMonth: 15, category: 'Fitness', isPaid: false },
  { id: '5', name: 'Netflix', amount: 15, dayOfMonth: 20, category: 'Entertainment', isPaid: false },
  { id: '6', name: 'Car Insurance', amount: 110, dayOfMonth: 25, category: 'Auto', isPaid: false },
];

export const mockIncomes: IncomeEvent[] = [
  { id: 'inc1', name: 'Primary Salary', amount: 3500, dayOfMonth: 1 },
  { id: 'inc2', name: 'Secondary Salary', amount: 3500, dayOfMonth: 28 },
];

export const initialBalance = 1500;
