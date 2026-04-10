import React, { useState, useEffect } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { Plus, CheckCircle2, Circle, HandCoins, Calendar as CalendarIcon, AlertCircle } from 'lucide-react'
import Calendar from '../components/calendar/Calendar'
import { motion, AnimatePresence } from 'framer-motion'

const MonthlyDues: React.FC = () => {
  const { dues, addDue, toggleDuePaid, deleteDue, contributeToDue, checkAndResetMonthlyDues } = useBudgetStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newDue, setNewDue] = useState({ label: '', amount: '', dayOfMonth: new Date().getDate().toString() })

  const [isContributing, setIsContributing] = useState<string | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')

  useEffect(() => {
    checkAndResetMonthlyDues()
  }, [checkAndResetMonthlyDues])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDue.label || !newDue.amount) return
    addDue({
      label: newDue.label,
      amount: parseFloat(newDue.amount),
      dayOfMonth: parseInt(newDue.dayOfMonth) || 1
    })
    setNewDue({ label: '', amount: '', dayOfMonth: new Date().getDate().toString() })
    setIsAdding(false)
  }

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault()
    if (isContributing && contributionAmount) {
      contributeToDue(isContributing, parseFloat(contributionAmount))
      setIsContributing(null)
      setContributionAmount('')
    }
  }

  const today = new Date().getDate()

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-black">Monthly Dues</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      <Calendar />

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-[2rem] space-y-4 border border-blue-100 dark:border-blue-900/30">
          <h2 className="font-bold text-sm uppercase tracking-widest text-blue-600 mb-2">New Monthly Bill</h2>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Label</label>
            <input
              type="text"
              value={newDue.label}
              onChange={(e) => setNewDue({ ...newDue, label: e.target.value })}
              placeholder="e.g. Netflix, Rent"
              className="w-full bg-white dark:bg-gray-700 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Amount</label>
              <input
                type="number"
                value={newDue.amount}
                onChange={(e) => setNewDue({ ...newDue, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-white dark:bg-gray-700 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={newDue.dayOfMonth}
                onChange={(e) => setNewDue({ ...newDue, dayOfMonth: e.target.value })}
                className="w-full bg-white dark:bg-gray-700 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20"
            >
              Add Bill
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-4 bg-gray-200 dark:bg-gray-600 font-black rounded-2xl"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <AnimatePresence>
        {isContributing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
            >
              <h2 className="text-xl font-black mb-2">Contribute</h2>
              <p className="text-gray-500 text-sm mb-6 font-medium">How much would you like to put towards this bill?</p>
              <form onSubmit={handleContribute} className="space-y-4">
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="₱ 0.00"
                  className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-2xl p-5 text-2xl font-black outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl">Confirm</button>
                  <button type="button" onClick={() => setIsContributing(null)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 font-black rounded-2xl">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {dues.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 dark:border-gray-800">
            No bills to track.
          </div>
        ) : (
          dues.sort((a, b) => a.dayOfMonth - b.dayOfMonth).map((due) => {
            const progress = Math.min((due.contributedAmount / due.amount) * 100, 100)
            const isCrunch = !due.isPaid && (due.dayOfMonth >= today && due.dayOfMonth <= today + 3)

            return (
              <div
                key={due.id}
                className={`p-5 rounded-[2rem] transition-all border-2 ${
                  due.isPaid
                    ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                    : isCrunch
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                      : 'bg-white dark:bg-gray-800 border-gray-50 dark:border-gray-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleDuePaid(due.id)}
                      className={`transition-colors ${due.isPaid ? 'text-green-500' : isCrunch ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}`}
                    >
                      {due.isPaid ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Circle size={28} strokeWidth={2.5} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-black text-sm ${due.isPaid ? 'text-green-700 dark:text-green-400' : isCrunch ? 'text-red-700 dark:text-red-400' : ''}`}>
                          {due.label}
                        </h3>
                        {isCrunch && <AlertCircle size={14} className="text-red-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                        <CalendarIcon size={10} />
                        Day {due.dayOfMonth}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black ${due.isPaid ? 'text-green-600' : isCrunch ? 'text-red-600' : ''}`}>
                      ₱ {due.amount.toLocaleString()}
                    </p>
                    <button
                      onClick={() => deleteDue(due.id)}
                      className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                     <p className="text-[10px] font-black text-gray-400 uppercase">₱ {due.contributedAmount.toLocaleString()} / ₱ {due.amount.toLocaleString()}</p>
                     <p className={`text-[10px] font-black uppercase ${due.isPaid ? 'text-green-600' : isCrunch ? 'text-red-600' : 'text-blue-600'}`}>
                       {Math.round(progress)}%
                     </p>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full transition-colors ${due.isPaid ? 'bg-green-500' : isCrunch ? 'bg-red-500' : 'bg-blue-600'}`}
                    />
                  </div>
                  {!due.isPaid && (
                    <button
                      onClick={() => setIsContributing(due.id)}
                      className={`w-full mt-2 py-2 text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-colors ${
                        isCrunch
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <HandCoins size={12} /> Contribute
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MonthlyDues
