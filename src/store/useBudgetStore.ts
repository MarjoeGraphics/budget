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
  initialBalance: number
  transactions: Transaction[]
  dues: Due[]
  presets: Preset[]
  lastResetMonth: number // month (0-11) of last reset

  // Actions
  setBalance: (amount: number) => void
  setInitialBalance: (amount: number) => void
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'> & { date?: number }) => void

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

const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      balance: 0,
      initialBalance: 0,
      transactions: [],
      dues: [],
      presets: [],
      lastResetMonth: new Date().getMonth(),

      setBalance: (amount) => set({ balance: amount }),

      setInitialBalance: (amount) => set((state) => {
        const roundedAmount = round(amount)
        const diff = roundedAmount - state.initialBalance
        return {
          initialBalance: roundedAmount,
          balance: round(state.balance + diff)
        }
      }),

      addTransaction: (t) => set((state) => {
        const { date, ...rest } = t
        const amount = round(rest.amount)
        const newTransaction: Transaction = {
          ...rest,
          amount,
          id: crypto.randomUUID(),
          date: date || Date.now()
        }

        let newBalance = state.balance
        if (t.type === 'income' || t.type === 'savings') {
          newBalance += amount
        } else {
          newBalance -= amount
        }

        return {
          transactions: [newTransaction, ...state.transactions],
          balance: round(newBalance),
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
          newBalance -= round(targetDue.amount)
          newTransactions = [{
            id: crypto.randomUUID(),
            label: `Paid: ${targetDue.label}`,
            amount: round(targetDue.amount),
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
          balance: round(newBalance),
          transactions: newTransactions,
          dues: state.dues.map(d => {
            if (d.id === id) {
              const updatedTerm = (isMarkingPaid && d.currentTerm !== undefined)
                ? d.currentTerm + 1
                : d.currentTerm
              return {
                ...d,
                isPaid: isMarkingPaid,
                currentTerm: updatedTerm
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
            dues: dues.map(d => ({ ...d, isPaid: false }))
          })
        }
      },

      clearAllData: () => set({
        balance: 0,
        initialBalance: 0,
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
