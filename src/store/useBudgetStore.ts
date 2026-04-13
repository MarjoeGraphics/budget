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
  priority: number // 1-5
  totalTerms?: number
  currentTerm?: number
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

  addDue: (due: Omit<Due, 'id' | 'isPaid'>) => void
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
        if (t.type === 'income' || t.type === 'savings') {
          newBalance += t.amount
        } else {
          newBalance -= t.amount
        }

        return {
          transactions: [newTransaction, ...state.transactions],
          balance: newBalance,
        }
      }),

      addDue: (due) => set((state) => ({
        dues: [...state.dues, { ...due, id: crypto.randomUUID(), isPaid: false }]
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
            return { ...d, ...updates }
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
            dues: dues.map(d => {
              const updatedTerm = (d.isPaid && d.currentTerm !== undefined)
                ? d.currentTerm + 1
                : d.currentTerm
              return { ...d, isPaid: false, currentTerm: updatedTerm }
            })
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
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const state = persistedState as BudgetState
          // Migration for version 0 to 1: add priority 3 to existing dues
          return {
            ...state,
            dues: (state.dues || []).map((due) => ({
              ...due,
              priority: due.priority ?? 3,
            })),
          }
        }
        return persistedState
      },
    }
  )
)
