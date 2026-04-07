import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Transaction } from '../data/transactions';
import type { Goal } from '../types/goals';
import type { DueItem, IncomeEvent } from '../types/dues';

interface Preset {
  label: string;
  amount: number;
  category: string;
  icon: string;
}

interface UserSettings {
  darkMode: boolean;
  incomeFrequency: 'daily' | 'weekly' | 'monthly';
  restDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
}

interface BudgetContextType {
  transactions: Transaction[];
  goals: Goal[];
  dues: DueItem[];
  incomes: IncomeEvent[];
  presets: Preset[];
  settings: UserSettings;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: number) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  deleteGoal: (id: string) => void;
  addDue: (due: Omit<DueItem, 'id'>) => void;
  deleteDue: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updatePresets: (presets: Preset[]) => void;
  clearAllData: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const DEFAULT_PRESETS: Preset[] = [
  { label: 'Coffee', amount: -5, category: 'Food', icon: '☕' },
  { label: 'Groceries', amount: -60, category: 'Food', icon: '🛒' },
  { label: 'Gas/Fuel', amount: -40, category: 'Transport', icon: '⛽' },
  { label: 'Dinner Out', amount: -35, category: 'Food', icon: '🍽️' },
  { label: 'Gig Income', amount: 150, category: 'Income', icon: '💰' },
  { label: 'Subscription', amount: -15, category: 'Entertainment', icon: '📺' },
];

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  incomeFrequency: 'monthly',
  restDays: [0], // Sunday
  monthlyRate: 0,
};

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dues, setDues] = useState<DueItem[]>([]);
  const [incomes, setIncomes] = useState<IncomeEvent[]>([]);
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('budget_app_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setTransactions(parsed.transactions || []);
        setGoals(parsed.goals || []);
        setDues(parsed.dues || []);
        setIncomes(parsed.incomes || []);
        setPresets(parsed.presets || DEFAULT_PRESETS);
        setSettings(parsed.settings || DEFAULT_SETTINGS);
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    const dataToStore = {
      transactions,
      goals,
      dues,
      incomes,
      presets,
      settings,
    };
    localStorage.setItem('budget_app_data', JSON.stringify(dataToStore));

    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [transactions, goals, dues, incomes, presets, settings]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Date.now() };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal = { ...goal, id: Math.random().toString(36).substr(2, 9) } as Goal;
    setGoals(prev => [...prev, newGoal]);
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addDue = (due: Omit<DueItem, 'id'>) => {
    const newDue = { ...due, id: Math.random().toString(36).substr(2, 9) };
    setDues(prev => [...prev, newDue]);
  };

  const deleteDue = (id: string) => {
    setDues(prev => prev.filter(d => d.id !== id));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updatePresets = (newPresets: Preset[]) => {
    setPresets(newPresets);
  };

  const clearAllData = () => {
    setTransactions([]);
    setGoals([]);
    setDues([]);
    setIncomes([]);
    setPresets(DEFAULT_PRESETS);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('budget_app_data');
  };

  return (
    <BudgetContext.Provider value={{
      transactions,
      goals,
      dues,
      incomes,
      presets,
      settings,
      addTransaction,
      deleteTransaction,
      addGoal,
      deleteGoal,
      addDue,
      deleteDue,
      updateSettings,
      updatePresets,
      clearAllData,
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
