import React, { useState, useEffect, useMemo } from 'react'
import { useBudgetStore, type Transaction, type Due } from '../store/useBudgetStore'
import { TrendingUp, TrendingDown, ChevronRight, X as XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Home: React.FC = () => {
  const { balance, transactions, dues, checkAndResetMonthlyDues } = useBudgetStore()

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [spentTimeframe, setSpentTimeframe] = useState<'today' | 'week' | 'month'>('today')

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
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const last7DaysStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()

  const stats = useMemo(() => {
    const getExpenses = (txs: Transaction[]) => txs
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    return {
      today: getExpenses(externalTransactions.filter(t => new Date(t.date).setHours(0, 0, 0, 0) === todayStart)),
      week: getExpenses(externalTransactions.filter(t => t.date >= last7DaysStart)),
      month: getExpenses(externalTransactions.filter(t => t.date >= startOfMonth)),
    }
  }, [externalTransactions, todayStart, last7DaysStart, startOfMonth])

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

  // Monthly Preview
  const upcomingCommitments = useMemo(() => {
    const todayDay = new Date().getDate()
    const thisMonth = dues
      .filter(d => !d.isPaid && d.dayOfMonth >= todayDay)
      .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
    const nextMonth = dues
      .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
    const merged = [...thisMonth, ...nextMonth]
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
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black">Home</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Balance</p>
          <p className="text-2xl font-black">₱ {balance.toLocaleString()}</p>
        </div>
      </header>

      {/* Combined Stats Widget */}
      <section className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col md:flex-row border-b border-gray-50 dark:border-gray-700/50">
          {/* Left: Chart */}
          <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gray-50 dark:border-gray-700/50">
            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-6">Activity</h3>
            <div className="flex items-end justify-between h-24 gap-1.5 px-2">
              {chartData.map((day, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 h-full">
                  <div className="flex-1 w-full flex items-end justify-center gap-0.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.income / maxChartVal) * 100}%` }}
                      className="w-1 bg-green-500 rounded-full min-h-[1px]"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.expense / maxChartVal) * 100}%` }}
                      className="w-1 bg-red-400 rounded-full min-h-[1px]"
                    />
                  </div>
                  <span className="text-[8px] font-black text-gray-400">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Spent Toggles */}
          <div className="w-full md:w-48 p-6 flex flex-col justify-between gap-4">
             <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white transition-all">
                  ₱ {stats[spentTimeframe].toLocaleString()}
                </p>
             </div>
             <div className="flex md:flex-col gap-1.5">
                {(['today', 'week', 'month'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSpentTimeframe(t)}
                    className={`flex-1 py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                      spentTimeframe === t
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Bottom: Safe to Spend */}
        <div className={`p-6 text-center transition-colors ${safeToSpend >= 0 ? 'bg-green-50/30 dark:bg-green-500/5' : 'bg-red-50/30 dark:bg-red-500/5'}`}>
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Safe to Spend</p>
           <p className={`text-3xl font-black ${safeToSpend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₱ {safeToSpend.toLocaleString()}
           </p>
        </div>
      </section>

      {/* Upcoming Commitments */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Upcoming Commitments</h3>
        <div className="space-y-2">
          {upcomingCommitments.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-10 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest border border-dashed border-gray-100 dark:border-gray-800">
              No upcoming goals
            </div>
          ) : (
            upcomingCommitments.map((due) => (
              <div key={due.id} className="bg-white dark:bg-gray-800 px-6 py-5 rounded-[1.5rem] border border-gray-50 dark:border-gray-700/50 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{due.label}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Day {due.dayOfMonth}</p>
                </div>
                <p className="font-black text-sm">₱ {due.amount.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Activity</h3>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-tighter"
          >
            History <ChevronRight size={10} strokeWidth={3} />
          </button>
        </div>
        <div className="rounded-[2rem] overflow-hidden border border-gray-50 dark:border-gray-700/50">
          {externalTransactions.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-[10px] font-black uppercase tracking-widest italic bg-white dark:bg-gray-800">No activity yet</p>
          ) : (
            externalTransactions.slice(0, 5).map((t, i) => (
              <div
                key={t.id}
                className={`flex items-center justify-between px-6 py-4 ${
                  i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{t.label}</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                      {new Date(t.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className={`text-xs font-black ${t.type === 'income' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
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
