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
  dueDate: number // Timestamp
  priority: number // 1-5
  totalTerms?: number
  currentTerm?: number
  currentAmount: number
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
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  addDue: (due: Omit<Due, 'id' | 'isPaid' | 'currentAmount' | 'dueDate'> & { dayOfMonth: number }) => void
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

const getNextMonthDate = (currentDate: Date): Date => {
  const nextMonth = new Date(currentDate)
  const targetMonth = (currentDate.getMonth() + 1) % 12
  nextMonth.setMonth(currentDate.getMonth() + 1)

  // Handle edge case where next month has fewer days
  if (nextMonth.getMonth() !== targetMonth) {
      nextMonth.setDate(0)
  }
  return nextMonth
}

const recalculateBalance = (initialBalance: number, transactions: Transaction[]): number => {
    return transactions.reduce((acc, t) => {
        if (t.type === 'income' || t.type === 'savings') {
            return round(acc + t.amount)
        } else {
            return round(acc - t.amount)
        }
    }, round(initialBalance))
}

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
        const newTransactions = state.transactions
        const newBalance = recalculateBalance(roundedAmount, newTransactions)
        return {
          initialBalance: roundedAmount,
          balance: newBalance
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

        const newTransactions = [newTransaction, ...state.transactions]
        const newBalance = recalculateBalance(state.initialBalance, newTransactions)

        return {
          transactions: newTransactions,
          balance: newBalance,
        }
      }),

      updateTransaction: (id, updates) => set((state) => {
          const newTransactions = state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
          const newBalance = recalculateBalance(state.initialBalance, newTransactions)
          return {
              transactions: newTransactions,
              balance: newBalance
          }
      }),

      deleteTransaction: (id) => set((state) => {
          const newTransactions = state.transactions.filter(t => t.id !== id)
          const newBalance = recalculateBalance(state.initialBalance, newTransactions)
          return {
              transactions: newTransactions,
              balance: newBalance
          }
      }),

      addDue: (due) => set((state) => {
        const { dayOfMonth, ...rest } = due
        const now = new Date()
        const dueDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)

        return {
          dues: [...state.dues, {
            ...rest,
            id: crypto.randomUUID(),
            isPaid: false,
            currentAmount: 0,
            dueDate: dueDate.getTime()
          }]
        }
      }),

      toggleDuePaid: (id) => set((state) => {
        const targetDue = state.dues.find(d => d.id === id)
        if (!targetDue) return state

        const isMarkingPaid = !targetDue.isPaid
        let newTransactions = [...state.transactions]

        if (isMarkingPaid) {
          // Marking as paid: Record external transaction
          newTransactions = [{
            id: crypto.randomUUID(),
            label: `Paid: ${targetDue.label}`,
            amount: round(targetDue.amount),
            date: Date.now(),
            type: 'expense',
            dueId: id
          }, ...newTransactions]

          const updatedDues = state.dues.map(d => {
            if (d.id === id) {
              const updatedTerm = d.currentTerm !== undefined
                ? d.currentTerm + 1
                : d.currentTerm

              const nextDueDate = getNextMonthDate(new Date(d.dueDate))

              return {
                ...d,
                isPaid: true,
                currentTerm: updatedTerm,
                dueDate: nextDueDate.getTime(),
                currentAmount: 0
              }
            }
            return d
          })

          return {
            balance: recalculateBalance(state.initialBalance, newTransactions),
            transactions: newTransactions,
            dues: updatedDues
          }
        } else {
          // Unmarking as paid (Undo)
          newTransactions = newTransactions.filter(t => t.dueId !== id || t.type !== 'expense')

          const updatedDues = state.dues.map(d => {
            if (d.id === id) {
              const updatedTerm = d.currentTerm !== undefined
                ? Math.max(1, d.currentTerm - 1)
                : d.currentTerm

              const prevDueDate = new Date(d.dueDate)
              prevDueDate.setMonth(prevDueDate.getMonth() - 1)

              return {
                ...d,
                isPaid: false,
                currentTerm: updatedTerm,
                dueDate: prevDueDate.getTime(),
                currentAmount: targetDue.amount
              }
            }
            return d
          })

          return {
            balance: recalculateBalance(state.initialBalance, newTransactions),
            transactions: newTransactions,
            dues: updatedDues
          }
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
        const now = new Date()
        const currentMonth = now.getMonth()
        const { lastResetMonth, dues } = get()

        if (currentMonth !== lastResetMonth) {
          set({
            lastResetMonth: currentMonth,
            dues: dues.map(d => {
              return { ...d, isPaid: false }
            })
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

      importData: (data) => set((state) => {
          const newState = { ...state, ...data }
          return {
              ...newState,
              balance: recalculateBalance(newState.initialBalance || 0, newState.transactions || [])
          }
      }),
    }),
    {
      name: 'budget-store',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as BudgetState

        if (version === 0) {
          // Migration for version 0 to 1: add priority 3 to existing dues
          state = {
            ...state,
            dues: (state.dues || []).map((due) => ({
              ...(due as Due),
              priority: (due as Due).priority ?? 3,
            })),
          }
        }

        if (version < 2) {
          // Migration to version 2: dayOfMonth to dueDate, add currentAmount
          const now = new Date()
          state = {
            ...state,
            dues: (state.dues || []).map((due) => {
              const d = due as unknown as { dayOfMonth?: number }
              const dayOfMonth = d.dayOfMonth || 1
              const dueDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)

              return {
                ...due,
                dueDate: dueDate.getTime(),
                currentAmount: due.isPaid ? due.amount : 0,
              }
            })
          }
        }

        return state
      },
    }
  )
)
