import React, { useState, useEffect, useMemo } from 'react'
import { useBudgetStore, type Transaction, type Due } from '../store/useBudgetStore'
import { TrendingUp, TrendingDown, Target, Wallet, Clock, History, ChevronRight, X as XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWaterfall } from '../hooks/useWaterfall'

const Home: React.FC = () => {
  const { balance, transactions, dues, checkAndResetMonthlyDues } = useBudgetStore()
  useWaterfall() // Hook is used to trigger re-renders or logic, but we don't need the return value here for now

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    checkAndResetMonthlyDues()
  }, [checkAndResetMonthlyDues])

  // Logic & Math
  const dueLeft = useMemo(() => dues
    .filter(d => !d.isPaid)
    .reduce((acc, d) => acc + d.amount, 0), [dues])

  const safeToSpend = balance - dueLeft
  const externalTransactions = useMemo(() => transactions.filter(t => !t.isInternal), [transactions])

  // Stats Calculations
  const today = new Date().setHours(0, 0, 0, 0)
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()

  const stats = useMemo(() => {
    const getExpenses = (txs: Transaction[]) => txs
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    return {
      today: getExpenses(externalTransactions.filter(t => new Date(t.date).setHours(0, 0, 0, 0) === today)),
      thisWeek: getExpenses(externalTransactions.filter(t => t.date >= last7Days)),
      thisMonth: getExpenses(externalTransactions.filter(t => t.date >= startOfMonth)),
      safeToSpend
    }
  }, [externalTransactions, today, last7Days, startOfMonth, safeToSpend])

  // Chart Logic: Last 7 Days Income vs Expenses
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

  // Monthly Preview Logic: Next 3 upcoming commitments
  const upcomingCommitments = useMemo(() => {
    const todayDay = new Date().getDate()

    // Split into this month remaining and next month
    const thisMonth = dues
      .filter(d => !d.isPaid && d.dayOfMonth >= todayDay)
      .sort((a, b) => a.dayOfMonth - b.dayOfMonth)

    const nextMonth = dues
      .sort((a, b) => a.dayOfMonth - b.dayOfMonth)

    const merged = [...thisMonth, ...nextMonth]
    // Filter out duplicates (if we have same due appearing twice) and take 3
    const result: Due[] = []
    const seen = new Set()
    for (const d of merged) {
      if (!seen.has(d.id)) {
        result.push(d)
        seen.add(d.id)
      }
      if (result.length === 3) break
    }
    return result
  }, [dues])

  return (
    <div className="p-6 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black">Home</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Balance</p>
          <p className="text-xl font-black">₱ {balance.toLocaleString()}</p>
        </div>
      </header>

      {/* 7-Day Spending Chart */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Last 7 Days (In vs Out)</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {chartData.map((day, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-2 h-full">
              <div className="flex-1 w-full flex items-end justify-center gap-0.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.income / maxChartVal) * 100}%` }}
                  className="w-1.5 bg-green-500 rounded-full min-h-[2px]"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.expense / maxChartVal) * 100}%` }}
                  className="w-1.5 bg-red-400 rounded-full min-h-[2px]"
                />
              </div>
              <span className="text-[10px] font-black text-gray-400">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        {[
          { label: 'Today', value: stats.today, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: 'This Week', value: stats.thisWeek, icon: History, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
          { label: 'This Month', value: stats.thisMonth, icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10' },
          { label: 'Safe to Spend', value: stats.safeToSpend, icon: Target, color: stats.safeToSpend >= 0 ? 'text-green-600' : 'text-red-600', bg: stats.safeToSpend >= 0 ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10' }
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-[2rem] border border-transparent shadow-sm ${stat.bg} flex flex-col gap-3`}>
            <div className="flex items-center gap-2">
              <stat.icon size={14} className={stat.color} />
              <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className={`text-lg font-black ${stat.color}`}>
              ₱ {stat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        ))}
      </section>

      {/* Monthly Preview */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upcoming Commitments</h3>
        </div>
        <div className="space-y-3">
          {upcomingCommitments.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 dark:border-gray-800">
              No upcoming goals
            </div>
          ) : (
            upcomingCommitments.map((due) => (
              <div key={due.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-50 dark:border-gray-700 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-black text-sm">{due.label}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Due Day {due.dayOfMonth}</p>
                  </div>
                </div>
                <p className="font-black text-sm">₱ {due.amount.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Activity Mini Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Activity</h3>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase"
          >
            History <ChevronRight size={10} strokeWidth={3} />
          </button>
        </div>
        <div className="space-y-3">
          {externalTransactions.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-xs font-medium italic">No activity yet</p>
          ) : (
            externalTransactions.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-3">
                  {t.type === 'income' ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-400" />}
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{t.label}</p>
                </div>
                <p className={`text-sm font-black ${t.type === 'income' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                  {t.type === 'income' ? '+' : '-'} ₱ {t.amount.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Transaction History">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
          {externalTransactions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No transactions found.</p>
          ) : (
            externalTransactions.map((t) => (
              <div key={t.id} className="bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl flex items-center justify-between border border-transparent shadow-sm active:scale-95 transition-transform">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-50 text-red-500 dark:bg-red-900/20'
                  }`}>
                    {t.type === 'income' ? <TrendingUp size={20} strokeWidth={2.5} /> : <TrendingDown size={20} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <p className="font-black text-sm">{t.label}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                      {new Date(t.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className={`font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'} ₱ {t.amount.toLocaleString()}
                </p>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-t-[2.5rem] p-8 z-[110] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">{title}</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                <XIcon size={20} strokeWidth={3} />
              </button>
            </div>
            {children}
            <button
              onClick={onClose}
              className="w-full mt-8 py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black rounded-2xl shadow-xl"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Home
