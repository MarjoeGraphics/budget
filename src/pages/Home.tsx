import React, { useState, useEffect, useMemo } from 'react'
import { useBudgetStore, type Transaction } from '../store/useBudgetStore'
import { ChevronRight, X as XIcon, ShieldCheck, Edit2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Home: React.FC = () => {
  const { balance, transactions, dues, checkAndResetMonthlyDues, updateTransaction, deleteTransaction } = useBudgetStore()

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [spentTimeframe, setSpentTimeframe] = useState<'today' | 'week' | 'month'>('today')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    checkAndResetMonthlyDues()
  }, [checkAndResetMonthlyDues])

  // Logic & Math
  const dueLeft = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return dues
      .filter(d => {
        const dueDate = new Date(d.dueDate)
        const isCurrentMonth = dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear
        return !d.isPaid && isCurrentMonth
      })
      .reduce((acc, d) => acc + d.amount, 0)
  }, [dues])

  const daysLeft = useMemo(() => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    return Math.max(1, lastDay - currentDay + 1)
  }, [])

  const netTreasury = balance - dueLeft
  const safeToSpendDaily = netTreasury / daysLeft

  const externalTransactions = useMemo(() =>
    transactions
      .filter(t => !t.isInternal)
      .sort((a, b) => b.date - a.date),
  [transactions])

  // Stats Calculations
  const stats = useMemo(() => {
    const now = new Date()
    const todayStr = now.toLocaleDateString('en-PH')
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const getExpenses = (txs: Transaction[]) => txs
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    return {
      today: getExpenses(externalTransactions.filter(t => new Date(t.date).toLocaleDateString('en-PH') === todayStr)),
      week: getExpenses(externalTransactions.filter(t => t.date >= last7Days.getTime())),
      month: getExpenses(externalTransactions.filter(t => t.date >= startOfMonth.getTime())),
    }
  }, [externalTransactions])

  // Efficiency Color
  const efficiencyColor = useMemo(() => {
    if (stats.today > safeToSpendDaily) return 'text-red-500'
    if (stats.today === safeToSpendDaily) return 'text-yellow-500'
    return 'text-emerald-500'
  }, [stats.today, safeToSpendDaily])

  // Chart Logic
  const chartData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)

      const dayTxs = externalTransactions.filter(t => new Date(t.date).setHours(0, 0, 0, 0) === d.getTime())
      const income = dayTxs.filter(t => t.type === 'income' || t.type === 'savings').reduce((acc, t) => acc + t.amount, 0)
      const expense = dayTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)

      days.push({
        label: d.toLocaleDateString('en-PH', { weekday: 'short' }).charAt(0),
        income,
        expense
      })
    }
    return days
  }, [externalTransactions])

  const maxChartVal = Math.max(...chartData.flatMap(d => [d.income, d.expense]), 1)

  // Grouped Activity Logic
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {}
    externalTransactions.forEach(t => {
      const date = new Date(t.date)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      let dateKey = date.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
      if (date.toLocaleDateString('en-PH') === today.toLocaleDateString('en-PH')) dateKey = 'TODAY'
      else if (date.toLocaleDateString('en-PH') === yesterday.toLocaleDateString('en-PH')) dateKey = 'YESTERDAY'

      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(t)
    })
    return groups
  }, [externalTransactions])

  const handleEditClick = (t: Transaction) => {
      setEditingTransaction(t)
  }

  return (
    <div className="p-6 pb-24 space-y-12 max-w-md mx-auto">
      <header className="flex justify-between items-start pt-4">
        <div className="space-y-1">
          <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Net Treasury</h1>
          <p className={`text-4xl font-mono-currency font-bold tracking-tighter ${netTreasury >= 0 ? 'text-white' : 'text-red-500'}`}>
               ₱ {netTreasury.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
               <ShieldCheck size={10} className="text-blue-500" />
               <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Free Capital Reserve</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Total Balance</p>
          <p className="text-xl font-mono-currency font-bold tracking-tighter text-gray-400">₱ {balance.toLocaleString()}</p>
        </div>
      </header>

      {/* Daily Safe to Spend Hero */}
      <section className="bg-white/[0.03] border border-white/5 p-6 rounded-sm space-y-4">
          <div className="flex justify-between items-center">
              <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Daily Allowance</h2>
              <div className="flex items-center gap-1">
                <span className={`text-[8px] font-black uppercase tracking-widest ${efficiencyColor}`}>Efficiency: </span>
                <div className={`w-1.5 h-1.5 rounded-full ${efficiencyColor.replace('text-', 'bg-')}`} />
              </div>
          </div>
          <div className="flex items-baseline gap-2">
              <p className="text-3xl font-mono-currency font-bold tracking-tighter text-gray-100">
                ₱ {safeToSpendDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">/ Day</span>
          </div>
          <p className="text-[7px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            Based on {daysLeft} days remaining in cycle
          </p>
      </section>

      {/* 2. Middle: Symmetry (50/50 Grid) - Nano Minimalist */}
      <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
         {/* Left: Activity Chart */}
         <section className="flex flex-col justify-between h-32">
            <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-4">Flux Profile</h3>
            <div className="flex items-end justify-between flex-1 gap-1 px-1">
              {chartData.map((day, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 h-full">
                  <div className="flex-1 w-full flex items-end justify-center gap-0.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.income / maxChartVal) * 100}%` }}
                      className="w-0.5 bg-blue-500/50 rounded-full min-h-[1px]"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.expense / maxChartVal) * 100}%` }}
                      className="w-0.5 bg-white/10 rounded-full min-h-[1px]"
                    />
                  </div>
                  <span className="text-[7px] font-bold text-gray-700">{day.label}</span>
                </div>
              ))}
            </div>
         </section>

         {/* Right: Spending Card */}
         <section className="flex flex-col justify-between h-32">
            <div>
               <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Aggregate Spent</p>
               <p className="text-2xl font-mono-currency font-bold mt-1 text-gray-200">
                 ₱ {stats[spentTimeframe].toLocaleString()}
               </p>
            </div>
            <div className="flex bg-white/5 rounded-sm p-0.5">
               {(['today', 'week', 'month'] as const).map((t) => (
                 <button
                   key={t}
                   onClick={() => setSpentTimeframe(t)}
                   className={`flex-1 py-1.5 rounded-sm text-[7px] font-black uppercase tracking-tighter transition-all ${
                     spentTimeframe === t
                       ? 'bg-white text-black'
                       : 'text-gray-500 hover:text-gray-300'
                   }`}
                 >
                   {t}
                 </button>
               ))}
            </div>
         </section>
      </div>

      {/* 3. Bottom: Recent Activity (The Ledger) */}
      <section className="space-y-6 pt-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Operational Ledger</h3>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-widest"
          >
            History <ChevronRight size={10} strokeWidth={3} />
          </button>
        </div>

        <div className="space-y-10">
          {Object.keys(groupedTransactions).length === 0 ? (
            <p className="text-center text-gray-700 text-[9px] font-black uppercase tracking-[0.4em] py-10">Empty Buffer</p>
          ) : (
            Object.entries(groupedTransactions).slice(0, 3).map(([date, txs]) => (
              <div key={date} className="space-y-4">
                <div className="sticky top-0 z-20 bg-[#0A0A0B]/90 backdrop-blur-sm py-1">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.5em]">{date}</p>
                </div>
                <div className="space-y-1">
                  {txs.map((t, index) => (
                    <div
                      key={t.id}
                      onClick={() => handleEditClick(t)}
                      className={`flex items-center justify-between py-4 px-2 group cursor-pointer hover:bg-white/[0.05] transition-colors border-b border-white/5 last:border-0 ${index % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-1 rounded-full ${t.type === 'income' ? 'bg-blue-500' : 'bg-white/20'}`} />
                        <p className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors tracking-tight">{t.label}</p>
                      </div>
                      <div className="flex items-center gap-3">
                          <p className={`text-xs font-mono-currency font-bold ${t.type === 'income' ? 'text-blue-500' : 'text-gray-200'}`}>
                            {t.type === 'income' ? '+' : '-'} ₱ {t.amount.toLocaleString()}
                          </p>
                          <Edit2 size={10} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Master Ledger">
        <div className="space-y-10 max-h-[60vh] overflow-y-auto no-scrollbar pb-10">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date} className="space-y-4">
              <div className="sticky top-0 z-30 bg-[#0A0A0B]/90 backdrop-blur-sm py-1 border-b border-white/5">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.5em]">{date}</p>
              </div>
              {txs.map((t) => (
                <div
                    key={t.id}
                    onClick={() => { handleEditClick(t); setIsHistoryOpen(false); }}
                    className="py-4 px-2 flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-1 h-1 rounded-full ${t.type === 'income' ? 'bg-blue-500' : 'bg-white/20'}`} />
                    <p className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{t.label}</p>
                  </div>
                  <div className="flex items-center gap-3">
                      <p className={`font-mono-currency font-bold ${t.type === 'income' ? 'text-blue-500' : 'text-gray-200'}`}>
                        ₱ {t.amount.toLocaleString()}
                      </p>
                      <Edit2 size={12} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal>

      {/* Edit Transaction Modal */}
      <EditModal
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={(updates) => {
            if (editingTransaction) {
                updateTransaction(editingTransaction.id, updates)
                setEditingTransaction(null)
            }
        }}
        onDelete={() => {
            if (editingTransaction) {
                deleteTransaction(editingTransaction.id)
                setEditingTransaction(null)
            }
        }}
      />
    </div>
  )
}

const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0A0A0B] border-t border-white/5 p-8 z-[110] shadow-2xl rounded-t-xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{title}</h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-sm text-gray-600 hover:text-white transition-colors">
                <XIcon size={16} strokeWidth={3} />
              </button>
            </div>
            {children}
            <button
              onClick={onClose}
              className="w-full mt-8 py-4 bg-white text-black font-black rounded-sm uppercase text-[9px] tracking-[0.4em]"
            >
              Close Buffer
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const EditModal: React.FC<{ transaction: Transaction | null, onClose: () => void, onSave: (updates: Partial<Transaction>) => void, onDelete: () => void }> = ({ transaction, onClose, onSave, onDelete }) => {
    const [label, setLabel] = useState('')
    const [amount, setAmount] = useState('')

    useEffect(() => {
        if (transaction) {
            setLabel(transaction.label)
            setAmount(transaction.amount.toString())
        }
    }, [transaction])

    if (!transaction) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120]"
            />
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0A0A0B] border-t border-white/10 p-8 z-[130] shadow-2xl rounded-t-xl"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Edit Log</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-sm text-gray-600">
                        <XIcon size={16} strokeWidth={3} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 ml-1">Descriptor</label>
                        <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-sm outline-none font-bold text-sm text-white focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-2 ml-1">Quantified Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-sm outline-none font-mono-currency font-bold text-sm text-white focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-10">
                    <button
                        onClick={() => onSave({ label, amount: parseFloat(amount) })}
                        className="flex-1 py-4 bg-white text-black font-black rounded-sm uppercase text-[9px] tracking-[0.4em]"
                    >
                        Commit Updates
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-6 py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-black rounded-sm uppercase text-[9px] tracking-[0.4em]"
                    >
                        Purge
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default Home
