import React, { useState, useEffect } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { Edit2, Check, TrendingUp, TrendingDown, Lightbulb, Target } from 'lucide-react'
import { motion } from 'framer-motion'

const Dashboard: React.FC = () => {
  const { balance, transactions, dues, setBalance, checkAndResetMonthlyDues } = useBudgetStore()

  const [isEditingBalance, setIsEditingBalance] = useState(false)
  const [editBalanceValue, setEditBalanceValue] = useState(balance.toString())

  useEffect(() => {
    checkAndResetMonthlyDues()
    setEditBalanceValue(balance.toString())
  }, [balance])

  const handleBalanceUpdate = () => {
    const val = parseFloat(editBalanceValue)
    if (!isNaN(val)) {
      setBalance(val)
    }
    setIsEditingBalance(false)
  }

  // Logic & Math
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

  // Chart Logic (Current Month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const monthTransactions = transactions.filter(t => t.date >= startOfMonth)

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

      {/* Main Budget Card */}
      <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl" />

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Balance</p>
            {isEditingBalance ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editBalanceValue}
                  onChange={(e) => setEditBalanceValue(e.target.value)}
                  className="bg-white/20 border-none text-3xl font-black text-white rounded-2xl px-3 py-2 w-40 outline-none focus:ring-4 focus:ring-white/20 transition-all"
                  autoFocus
                />
                <button onClick={handleBalanceUpdate} className="p-3 bg-white text-blue-600 rounded-2xl shadow-lg shadow-black/10">
                  <Check size={20} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 group">
                <h2 className="text-5xl font-black tracking-tighter">₱ {balance.toLocaleString()}</h2>
                <button
                  onClick={() => setIsEditingBalance(true)}
                  className="p-2 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
                >
                  <Edit2 size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/10">
            <div>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Due Left</p>
              <p className="text-xl font-black">₱ {dueLeft.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Safe to Spend</p>
              <p className={`text-xl font-black ${isSTSNegative ? 'text-red-300' : 'text-white'}`}>
                ₱ {safeToSpend.toLocaleString()}
              </p>
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
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dues Cleared</p>
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
                <p className="text-purple-900 dark:text-purple-300 font-black text-sm">Debt Coverage</p>
                <p className="text-purple-700 dark:text-purple-400 text-xs font-medium">
                  You have <span className="font-black">₱ {clearedDuesAmount.toLocaleString()}</span> already set aside for your monthly dues.
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Recent Activity</h3>
          <p className="text-[10px] font-black text-blue-600 uppercase">View All</p>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 dark:border-gray-800">
              No transactions yet
            </div>
          ) : (
            transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl flex items-center justify-between border border-gray-50 dark:border-gray-700 shadow-sm active:scale-95 transition-transform">
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
      </div>
    </div>
  )
}

export default Dashboard
