import React, { useState, useEffect } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { Edit2, Check, X, TrendingUp, TrendingDown } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { balance, transactions, dues, setBalance } = useBudgetStore()

  const [isEditingBalance, setIsEditingBalance] = useState(false)
  const [editBalanceValue, setEditBalanceValue] = useState(balance.toString())

  useEffect(() => {
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
    .reduce((acc, d) => acc + d.amount, 0)

  const safeToSpend = balance - dueLeft
  const isSTSNegative = safeToSpend < 0

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Main Budget Card */}
      <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Total Balance</p>
              {isEditingBalance ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editBalanceValue}
                    onChange={(e) => setEditBalanceValue(e.target.value)}
                    className="bg-white/20 border-none text-2xl font-bold text-white rounded-lg px-2 py-1 w-32 outline-none focus:ring-2 focus:ring-white/50"
                    autoFocus
                  />
                  <button onClick={handleBalanceUpdate} className="p-2 bg-white/20 rounded-full">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setIsEditingBalance(false)} className="p-2 bg-white/20 rounded-full">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <h2 className="text-4xl font-black">₱ {balance.toLocaleString()}</h2>
                  <button
                    onClick={() => setIsEditingBalance(true)}
                    className="p-1.5 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
            <div>
              <p className="text-blue-100 text-[10px] font-semibold uppercase tracking-wider mb-1">Due Left</p>
              <p className="text-lg font-bold">₱ {dueLeft.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-blue-100 text-[10px] font-semibold uppercase tracking-wider mb-1">Safe to Spend</p>
              <p className={`text-xl font-black ${isSTSNegative ? 'text-red-300 drop-shadow-sm' : 'text-white'}`}>
                ₱ {safeToSpend.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          Recent Transactions
        </h3>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center text-gray-400">
              No transactions yet
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between transition-transform active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.label}</p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {new Date(t.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className={`font-black ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
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
