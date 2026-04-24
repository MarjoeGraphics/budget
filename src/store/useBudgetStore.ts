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

      addDue: (due) => set((state) => {
        const { dayOfMonth, ...rest } = due
        const now = new Date()
        const dueDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
        // If the day has already passed this month, technically it should probably be this month's due still for the initial setup,
        // unless we want it to be next month. But usually users add what's due THIS month.

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

          return {
            balance: round(newBalance),
            transactions: newTransactions,
            dues: state.dues.map(d => {
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
          }
        } else {
          // Unmarking as paid (Undo): Reverse balance and remove transaction
          // Note: In v2, unmarking paid is more complex because dueDate and currentTerm were already pushed forward.
          // For simplicity in this refactor, we'll try to reverse it, but "pushing back" a date is tricky.
          newBalance += targetDue.amount
          newTransactions = newTransactions.filter(t => t.dueId !== id || t.type !== 'expense')

          return {
            balance: round(newBalance),
            transactions: newTransactions,
            dues: state.dues.map(d => {
              if (d.id === id) {
                const updatedTerm = d.currentTerm !== undefined
                  ? Math.max(1, d.currentTerm - 1)
                  : d.currentTerm

                const prevDueDate = new Date(d.dueDate)
                prevDueDate.setMonth(prevDueDate.getMonth() - 1)
                // If we were at the end of a month, moving back might also need adjustment,
                // but usually it's safer.

                return {
                  ...d,
                  isPaid: false,
                  currentTerm: updatedTerm,
                  dueDate: prevDueDate.getTime(),
                  currentAmount: targetDue.amount // Assume it was fully funded if it was paid
                }
              }
              return d
            })
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
              // If it's a new month, any due that was "Paid" (and thus pushed to this month)
              // should now be "Unpaid" for this month.
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

      importData: (data) => set((state) => ({
        ...state,
        ...data,
      })),
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
