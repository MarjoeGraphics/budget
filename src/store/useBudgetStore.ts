import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Transaction {
  id: string
  label: string
  amount: number
  date: number
  type: 'income' | 'expense' | 'savings'
  dueId?: string // Optional link to a specific due
  isInternal?: boolean // Flag for waterfall allocations or internal adjustments
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
  type: 'income' | 'expense' | 'savings'
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

  addPreset: (preset: Omit<Preset, 'id'>) => void
  deletePreset: (id: string) => void

  checkAndResetMonthlyDues: () => void

  // Data Management
  clearAllData: () => void
  importData: (data: Partial<BudgetState>) => void
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

        let newBalance = state.balance
        if (t.type === 'income') {
          newBalance += t.amount
        } else {
          newBalance -= t.amount
        }

        // Waterfall System for Income or Savings
        let updatedDues = [...state.dues]
        if (t.type === 'income') {
          let remainingWaterfall = t.amount
          // Sort dues by dayOfMonth soonest first
          updatedDues = updatedDues.sort((a, b) => a.dayOfMonth - b.dayOfMonth).map(d => {
            if (!d.isPaid && remainingWaterfall > 0) {
              const needed = d.amount - d.contributedAmount
              const allocation = Math.min(needed, remainingWaterfall)
              remainingWaterfall -= allocation
              return {
                ...d,
                contributedAmount: d.contributedAmount + allocation,
                isPaid: d.contributedAmount + allocation >= d.amount
              }
            }
            return d
          })
        }

        return {
          transactions: [newTransaction, ...state.transactions],
          balance: newBalance,
          dues: updatedDues
        }
      }),

      addDue: (due) => set((state) => ({
        dues: [...state.dues, { ...due, id: crypto.randomUUID(), isPaid: false, contributedAmount: 0 }]
      })),

      toggleDuePaid: (id) => set((state) => {
        const targetDue = state.dues.find(d => d.id === id)
        if (!targetDue) return state

        const isMarkingPaid = !targetDue.isPaid
        let newBalance = state.balance
        let newTransactions = [...state.transactions]

        if (isMarkingPaid) {
          // Marking as paid: Record external transaction and reduce balance
          newBalance -= targetDue.amount
          newTransactions = [{
            id: crypto.randomUUID(),
            label: `Paid: ${targetDue.label}`,
            amount: targetDue.amount,
            date: Date.now(),
            type: 'expense',
            dueId: id
          }, ...newTransactions]
        } else {
          // Unmarking as paid (Undo): Reverse balance and remove transaction
          newBalance += targetDue.amount
          newTransactions = newTransactions.filter(t => t.dueId !== id || t.type !== 'expense')
        }

        return {
          balance: newBalance,
          transactions: newTransactions,
          dues: state.dues.map(d => {
            if (d.id === id) {
              return {
                ...d,
                isPaid: isMarkingPaid,
                contributedAmount: isMarkingPaid ? d.amount : 0
              }
            }
            return d
          })
        }
      }),

      deleteDue: (id) => set((state) => ({
        dues: state.dues.filter(d => d.id !== id)
      })),

      updateDue: (id, updates) => set((state) => ({
        dues: state.dues.map(d => {
          if (id === d.id) {
            const updated = { ...d, ...updates }
            // Auto-update isPaid if contributedAmount changes manually
            if (updates.contributedAmount !== undefined) {
               updated.isPaid = updated.contributedAmount >= updated.amount
            }
            return updated
          }
          return d
        })
      })),

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
      },

      clearAllData: () => set({
        balance: 0,
        transactions: [],
        dues: [],
        presets: [],
        lastResetMonth: new Date().getMonth()
      }),

      importData: (data) => set((state) => ({
        ...state,
        ...data,
      })),
    }),
    {
      name: 'budget-store',
    }
  )
)
