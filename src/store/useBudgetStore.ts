import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Transaction {
  id: string
  label: string
  amount: number
  date: number
  type: 'income' | 'expense'
}

export interface Due {
  id: string
  label: string
  amount: number
  isPaid: boolean
}

export interface Preset {
  id: string
  label: string
  amount: number
  type: 'income' | 'expense'
  color: string
}

interface BudgetState {
  balance: number
  transactions: Transaction[]
  dues: Due[]
  presets: Preset[]

  // Actions
  setBalance: (amount: number) => void
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void

  addDue: (due: Omit<Due, 'id' | 'isPaid'>) => void
  toggleDuePaid: (id: string) => void
  deleteDue: (id: string) => void
  updateDue: (id: string, updates: Partial<Due>) => void

  addPreset: (preset: Omit<Preset, 'id'>) => void
  deletePreset: (id: string) => void
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      balance: 0,
      transactions: [],
      dues: [],
      presets: [],

      setBalance: (amount) => set({ balance: amount }),

      addTransaction: (t) => set((state) => {
        const newTransaction: Transaction = {
          ...t,
          id: crypto.randomUUID(),
          date: Date.now()
        }
        const newBalance = t.type === 'income'
          ? state.balance + t.amount
          : state.balance - t.amount

        return {
          transactions: [newTransaction, ...state.transactions],
          balance: newBalance
        }
      }),

      addDue: (due) => set((state) => ({
        dues: [...state.dues, { ...due, id: crypto.randomUUID(), isPaid: false }]
      })),

      toggleDuePaid: (id) => set((state) => ({
        dues: state.dues.map(d => d.id === id ? { ...d, isPaid: !d.isPaid } : d)
      })),

      deleteDue: (id) => set((state) => ({
        dues: state.dues.filter(d => d.id !== id)
      })),

      updateDue: (id, updates) => set((state) => ({
        dues: state.dues.map(d => d.id === id ? { ...d, ...updates } : d)
      })),

      addPreset: (preset) => set((state) => ({
        presets: [...state.presets, { ...preset, id: crypto.randomUUID() }]
      })),

      deletePreset: (id) => set((state) => ({
        presets: state.presets.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'budget-store',
    }
  )
)
