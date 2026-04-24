import React, { useState, useEffect, useMemo } from 'react'
import { useBudgetStore, type Transaction } from '../store/useBudgetStore'
import { TrendingUp, TrendingDown, ChevronRight, X as XIcon, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Home: React.FC = () => {
  const { balance, transactions, dues, checkAndResetMonthlyDues } = useBudgetStore()

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [spentTimeframe, setSpentTimeframe] = useState<'today' | 'week' | 'month'>('today')

  useEffect(() => {
    checkAndResetMonthlyDues()
  }, [checkAndResetMonthlyDues])

  // Logic & Math
  // STS Philosophy: Only subtract UNPAID dues for the CURRENT month.
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

  const safeToSpend = balance - dueLeft
  const externalTransactions = useMemo(() => transactions.filter(t => !t.isInternal), [transactions])

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

  // Chart Logic (Refined for Bespoke Design)
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

  // Grouped Activity Logic (Capitalized Sticky Headers)
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

  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">Dashboard</h1>
          <p className="text-[10px] font-medium text-gray-600 uppercase tracking-widest mt-1">
            {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Balance</p>
          <p className="text-lg font-mono-currency font-bold tracking-tighter">₱ {balance.toLocaleString()}</p>
        </div>
      </header>

      {/* 1. Pyramid Top: Hero Section (Safe to Spend) */}
      <section className="glass p-10 card-radius text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
         <div className="relative z-10 flex flex-col items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Safe to Spend</p>
            <p className={`text-6xl font-mono-currency font-bold tracking-tighter ${safeToSpend >= 0 ? 'text-white' : 'text-red-500'}`}>
               ₱ {safeToSpend.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
               <ShieldCheck size={12} className={safeToSpend >= 0 ? 'text-blue-400' : 'text-red-400'} />
               <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Verified Budget</span>
            </div>
         </div>
      </section>

      {/* 2. Middle: Symmetry (50/50 Grid) */}
      <div className="grid grid-cols-2 gap-4">
         {/* Left: Activity Chart */}
         <section className="glass p-5 card-radius flex flex-col justify-between h-44">
            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">7D Activity</h3>
            <div className="flex items-end justify-between flex-1 gap-2 px-1 mt-4">
              {chartData.map((day, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 h-full">
                  <div className="flex-1 w-full flex items-end justify-center gap-0.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.income / maxChartVal) * 100}%` }}
                      className="w-1 bg-blue-500 rounded-t-sm min-h-[1px]"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.expense / maxChartVal) * 100}%` }}
                      className="w-1 bg-white/20 rounded-t-sm min-h-[1px]"
                    />
                  </div>
                  <span className="text-[8px] font-bold text-gray-600">{day.label}</span>
                </div>
              ))}
            </div>
         </section>

         {/* Right: Spending Card */}
         <section className="glass p-5 card-radius flex flex-col justify-between h-44">
            <div>
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Spent</p>
               <p className="text-2xl font-mono-currency font-bold mt-1">
                 ₱ {stats[spentTimeframe].toLocaleString()}
               </p>
            </div>
            <div className="flex p-0.5 glass-recessed btn-radius">
               {(['today', 'week', 'month'] as const).map((t) => (
                 <button
                   key={t}
                   onClick={() => setSpentTimeframe(t)}
                   className={`flex-1 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-tighter transition-all ${
                     spentTimeframe === t
                       ? 'bg-white text-black shadow-lg'
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
      <section className="space-y-4 pt-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">The Ledger</h3>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1 text-[9px] font-black text-blue-400 uppercase tracking-widest"
          >
            Full History <ChevronRight size={10} strokeWidth={3} />
          </button>
        </div>

        <div className="space-y-8">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="glass p-12 card-radius border-dashed">
              <p className="text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] italic">No activity logs found</p>
            </div>
          ) : (
            Object.entries(groupedTransactions).slice(0, 3).map(([date, txs]) => (
              <div key={date} className="space-y-3">
                <div className="sticky top-0 z-20 backdrop-blur-md bg-[#0A0A0B]/80 py-2 border-b border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">{date}</p>
                </div>
                <div className="glass card-radius overflow-hidden shadow-sm">
                  {txs.map((t, i) => (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between px-5 py-4 transition-colors ${
                        i % 2 !== 0 ? 'bg-white/[0.02]' : ''
                      } border-b border-white/5 last:border-0`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-1 rounded-full ${t.type === 'income' ? 'bg-blue-400' : 'bg-white/40'}`} />
                        <div>
                          <p className="text-xs font-semibold text-gray-200 tracking-tight">{t.label}</p>
                        </div>
                      </div>
                      <p className={`text-xs font-mono-currency font-bold ${t.type === 'income' ? 'text-blue-400' : 'text-white'}`}>
                        {t.type === 'income' ? '+' : '-'} ₱ {t.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* History Modal (Refined) */}
      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Full Ledger">
        <div className="space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar pb-10">
          {Object.keys(groupedTransactions).length === 0 ? (
            <p className="text-center text-gray-600 py-8 font-black uppercase text-[10px] tracking-widest">No activity found.</p>
          ) : (
            Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date} className="space-y-3">
                <div className="sticky top-0 z-30 backdrop-blur-md bg-gray-900/80 py-2 border-b border-white/5">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">{date}</p>
                </div>
                {txs.map((t) => (
                  <div key={t.id} className="glass p-5 card-radius flex items-center justify-between shadow-sm active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 card-radius flex items-center justify-center ${
                        t.type === 'income' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-gray-400'
                      }`}>
                        {t.type === 'income' ? <TrendingUp size={18} strokeWidth={2.5} /> : <TrendingDown size={18} strokeWidth={2.5} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-200">{t.label}</p>
                      </div>
                    </div>
                    <p className={`font-mono-currency font-bold ${t.type === 'income' ? 'text-blue-400' : 'text-white'}`}>
                      {t.type === 'income' ? '+' : '-'} ₱ {t.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </Modal>
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
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0A0A0B] border-t border-white/10 p-8 z-[110] shadow-2xl card-radius rounded-b-none"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-black uppercase tracking-[0.2em]">{title}</h2>
              <button onClick={onClose} className="p-2 glass-recessed btn-radius text-gray-500">
                <XIcon size={18} strokeWidth={3} />
              </button>
            </div>
            {children}
            <button
              onClick={onClose}
              className="w-full mt-8 py-4 bg-white text-black font-black btn-radius uppercase text-[10px] tracking-[0.3em] shadow-xl"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Home
