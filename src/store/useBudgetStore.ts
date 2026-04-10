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
  dayOfMonth: number
  contributedAmount: number
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
  lastResetMonth: number // month (0-11) of last reset

  // Actions
  setBalance: (amount: number) => void
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void

  addDue: (due: Omit<Due, 'id' | 'isPaid' | 'contributedAmount'>) => void
  toggleDuePaid: (id: string) => void
  deleteDue: (id: string) => void
  updateDue: (id: string, updates: Partial<Due>) => void
  contributeToDue: (id: string, amount: number) => void

  addPreset: (preset: Omit<Preset, 'id'>) => void
  deletePreset: (id: string) => void

  checkAndResetMonthlyDues: () => void
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],
      dues: [],
      presets: [],
      lastResetMonth: new Date().getMonth(),

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
        dues: [...state.dues, { ...due, id: crypto.randomUUID(), isPaid: false, contributedAmount: 0 }]
      })),

      toggleDuePaid: (id) => set((state) => ({
        dues: state.dues.map(d => {
           if (d.id === id) {
             const newPaid = !d.isPaid;
             return { ...d, isPaid: newPaid, contributedAmount: newPaid ? d.amount : 0 }
           }
           return d;
        })
      })),

      deleteDue: (id) => set((state) => ({
        dues: state.dues.filter(d => d.id !== id)
      })),

      updateDue: (id, updates) => set((state) => ({
        dues: state.dues.map(d => d.id === id ? { ...d, ...updates } : d)
      })),

      contributeToDue: (id, amount) => set((state) => {
        const updatedDues = state.dues.map(d => {
          if (d.id === id) {
            const newContributed = d.contributedAmount + amount
            return {
              ...d,
              contributedAmount: newContributed,
              isPaid: newContributed >= d.amount
            }
          }
          return d
        })

        const targetDue = state.dues.find(d => d.id === id)
        if (targetDue) {
          const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            label: `Contr: ${targetDue.label}`,
            amount: amount,
            date: Date.now(),
            type: 'expense'
          }
          return {
            dues: updatedDues,
            balance: state.balance - amount,
            transactions: [newTransaction, ...state.transactions]
          }
        }
        return { dues: updatedDues }
      }),

      addPreset: (preset) => set((state) => ({
        presets: [...state.presets, { ...preset, id: crypto.randomUUID() }]
      })),

      deletePreset: (id) => set((state) => ({
        presets: state.presets.filter(p => p.id !== id)
      })),

      checkAndResetMonthlyDues: () => {
        const currentMonth = new Date().getMonth()
        const { lastResetMonth, dues } = get()

        if (currentMonth !== lastResetMonth) {
          set({
            lastResetMonth: currentMonth,
            dues: dues.map(d => ({ ...d, isPaid: false, contributedAmount: 0 }))
          })
        }
      }
    }),
    {
      name: 'budget-store',
    }
  )
)
