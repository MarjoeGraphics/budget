import React, { useState, useEffect } from 'react'
import { useBudgetStore, type Transaction } from '../store/useBudgetStore'
import { Edit2, Check, X, TrendingUp, TrendingDown, Lightbulb, Target, Info as InfoIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Dashboard: React.FC = () => {
  const { balance, transactions, dues, setBalance, checkAndResetMonthlyDues } = useBudgetStore()

  const [isEditingBalance, setIsEditingBalance] = useState(false)
  const [editBalanceValue, setEditBalanceValue] = useState(balance.toString())
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    checkAndResetMonthlyDues()
    setEditBalanceValue(balance.toString())
  }, [balance, checkAndResetMonthlyDues])

  const handleBalanceUpdate = () => {
    const val = parseFloat(editBalanceValue)
    if (!isNaN(val)) {
      setBalance(val)
    }
    setIsEditingBalance(false)
  }

  // Logic & Math
  // Choice A: Safe to Spend = Balance - Unpaid Goals (since Balance is total cash)
  const dueLeft = dues
    .filter(d => !d.isPaid)
    .reduce((acc, d) => acc + d.amount - d.contributedAmount, 0)

  const totalDuesAmount = dues.reduce((acc, d) => acc + d.amount, 0)
  const clearedDuesAmount = dues.reduce((acc, d) => acc + d.contributedAmount, 0)
  const duesClearedPercent = totalDuesAmount > 0 ? (clearedDuesAmount / totalDuesAmount) * 100 : 0

  const safeToSpend = balance - dueLeft
  const isSTSNegative = safeToSpend < 0

  // Date Math for Allowance
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft = Math.max(daysInMonth - now.getDate(), 1)
  const dailyAllowance = safeToSpend / daysLeft

  // Activity Filtering: Only show external transactions
  // Internal are those with isInternal flag or maybe we don't even log internal allocations as transactions
  // Dashboard Activity should show external transactions like Gigs, Fuel, etc.
  const externalTransactions = transactions.filter(t => !t.isInternal)

  // Chart Logic (Current Month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const monthTransactions = externalTransactions.filter(t => t.date >= startOfMonth)

  const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)

  const maxVal = Math.max(income, expenses, 1)
  const incomeHeight = (income / maxVal) * 100
  const expenseHeight = (expenses / maxVal) * 100

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black">Dashboard</h1>
        <div className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500 uppercase tracking-tighter">
          {now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Main Budget Card - STS HERO */}
      <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl transition-colors duration-500 mb-8 relative overflow-hidden ${
        isSTSNegative ? 'bg-red-500 shadow-red-500/20' : 'bg-green-600 shadow-green-500/20'
      }`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">Safe to Spend</p>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <InfoIcon size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="text-center py-2">
            <h2 className="text-6xl font-black tracking-tighter drop-shadow-lg">
              ₱ {safeToSpend.toLocaleString()}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Total Balance</p>
              {isEditingBalance ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editBalanceValue}
                    onChange={(e) => setEditBalanceValue(e.target.value)}
                    className="bg-white/20 border-none text-sm font-black text-white rounded-lg px-2 py-1 w-24 outline-none focus:ring-2 focus:ring-white/20"
                    autoFocus
                  />
                  <button onClick={handleBalanceUpdate} className="text-white">
                    <Check size={16} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <p className="text-lg font-black">₱ {balance.toLocaleString()}</p>
                  <button
                    onClick={() => setIsEditingBalance(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Goals Left</p>
              <p className="text-lg font-black">₱ {dueLeft.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats/Charts Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cash Flow</p>
           <div className="flex items-end gap-4 h-24 w-full justify-center">
              <div className="flex flex-col items-center gap-2 flex-1">
                 <motion.div
                   initial={{ height: 0 }}
                   animate={{ height: `${incomeHeight}%` }}
                   className="w-full max-w-[12px] bg-green-500 rounded-full"
                 />
                 <span className="text-[8px] font-black text-gray-400 uppercase">In</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                 <motion.div
                   initial={{ height: 0 }}
                   animate={{ height: `${expenseHeight}%` }}
                   className="w-full max-w-[12px] bg-red-400 rounded-full"
                 />
                 <span className="text-[8px] font-black text-gray-400 uppercase">Out</span>
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-between">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Goals Cleared</p>
           <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                <motion.circle
                  cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
                  strokeDasharray={176}
                  initial={{ strokeDashoffset: 176 }}
                  animate={{ strokeDashoffset: 176 - (176 * duesClearedPercent) / 100 }}
                  className="text-green-500"
                />
              </svg>
              <span className="absolute text-[10px] font-black">{Math.round(duesClearedPercent)}%</span>
           </div>
           <p className="text-[8px] font-black text-gray-400 uppercase mt-2">Monthly Goal</p>
        </div>
      </div>

      {/* Pro Tips Section */}
      <div className="space-y-4 mb-8">
        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest ml-1">Smart Insights</h3>
        <div className="grid grid-cols-1 gap-3">
           <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-3xl border border-orange-100 dark:border-orange-900/30 flex items-start gap-4">
              <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/20">
                <Lightbulb size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-orange-900 dark:text-orange-300 font-black text-sm">Daily Allowance</p>
                <p className="text-orange-700 dark:text-orange-400 text-xs font-medium">
                  You can safely spend <span className="font-black">₱ {dailyAllowance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> every day for the next {daysLeft} days.
                </p>
              </div>
           </div>
           <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-3xl border border-purple-100 dark:border-purple-900/30 flex items-start gap-4">
              <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20">
                <Target size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-purple-900 dark:text-purple-300 font-black text-sm">Goal Coverage</p>
                <p className="text-purple-700 dark:text-purple-400 text-xs font-medium">
                  You have <span className="font-black">₱ {clearedDuesAmount.toLocaleString()}</span> already set aside for your monthly goals.
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Recent Activity</h3>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="text-[10px] font-black text-blue-600 uppercase"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {externalTransactions.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 dark:border-gray-800">
              No external activity yet
            </div>
          ) : (
            externalTransactions.slice(0, 5).map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))
          )}
        </div>
      </div>

      {/* User Guide Modal */}
      <Modal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} title="What is Safe to Spend?">
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p className="font-medium">
            <span className="font-black text-blue-600">Safe to Spend (STS)</span> is the amount of money you can spend today without worrying about your upcoming goals.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-black uppercase text-gray-400 mb-2">Calculation:</p>
            <p className="font-mono text-sm dark:text-gray-200">Total Balance - Remaining Goals = STS</p>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
              <p className="text-sm"><span className="font-bold text-gray-900 dark:text-gray-100">Green Status:</span> You're within budget! All your monthly goals are covered by your current balance.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
              <p className="text-sm"><span className="font-bold text-gray-900 dark:text-gray-100">Red Status:</span> Your current balance is less than your total unpaid goals. Avoid unnecessary spending!</p>
            </li>
          </ul>
        </div>
      </Modal>

      {/* Transaction History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Recent Activity">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
          {externalTransactions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No transactions found.</p>
          ) : (
            externalTransactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction: t }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl flex items-center justify-between border border-gray-50 dark:border-gray-700 shadow-sm active:scale-95 transition-transform">
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
)

const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => (
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
              <X size={20} strokeWidth={3} />
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

export default Dashboard
