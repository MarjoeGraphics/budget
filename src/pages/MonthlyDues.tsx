import React, { useState, useEffect } from 'react'
import { useBudgetStore, type Due } from '../store/useBudgetStore'
import { Plus, CheckCircle2, Circle, HandCoins, Calendar as CalendarIcon, AlertCircle, Trash2, Info, ChevronDown, ChevronUp } from 'lucide-react'
import Calendar from '../components/calendar/Calendar'
import { motion, AnimatePresence } from 'framer-motion'

const MonthlyDues: React.FC = () => {
  const { dues, addDue, toggleDuePaid, deleteDue, contributeToDue, checkAndResetMonthlyDues } = useBudgetStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newDue, setNewDue] = useState({ label: '', amount: '', dayOfMonth: new Date().getDate().toString() })

  const [isContributing, setIsContributing] = useState<string | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')

  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-black mb-6">Monthly Dues</h1>

      {/* Calendar Section */}
      <section className="mb-8">
        <Calendar />
      </section>

      {/* Action Button - Divider style */}
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="w-full py-4 mb-8 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
      >
        <Plus size={20} strokeWidth={3} />
        Add New Commitment
      </button>

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

      {/* List Section */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Monthly Commitments</h2>
        {dues.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 dark:border-gray-800">
            No commitments yet.
          </div>
        ) : (
          dues.sort((a, b) => a.dayOfMonth - b.dayOfMonth).map((due) => {
            const isOverdue = !due.isPaid && today > due.dayOfMonth
            const isCrunch = !due.isPaid && !isOverdue && (due.dayOfMonth >= today && due.dayOfMonth <= today + 3)

            return (
              <CommitmentItem
                key={due.id}
                due={due}
                isOverdue={isOverdue}
                isCrunch={isCrunch}
                today={today}
                isExpanded={expandedId === due.id}
                onToggleExpand={() => toggleExpand(due.id)}
                onTogglePaid={() => toggleDuePaid(due.id)}
                onDelete={() => deleteDue(due.id)}
                onContribute={() => setIsContributing(due.id)}
              />
            )
          })
        )}
      </section>

      {/* Contribution Modal */}
      <AnimatePresence>
        {isContributing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
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
    </div>
  )
}

interface CommitmentItemProps {
  due: Due
  isOverdue: boolean
  isCrunch: boolean
  today: number
  isExpanded: boolean
  onToggleExpand: () => void
  onTogglePaid: () => void
  onDelete: () => void
  onContribute: () => void
}

const CommitmentItem: React.FC<CommitmentItemProps> = ({
  due, isOverdue, isCrunch, today, isExpanded,
  onToggleExpand, onTogglePaid, onDelete, onContribute
}) => {
  const progress = Math.min((due.contributedAmount / due.amount) * 100, 100)
  const amountRemaining = due.amount - due.contributedAmount
  const daysLeft = due.dayOfMonth - today

  // Daily saving target: (Total - Saved) / (Days left until Due Date)
  // If daysLeft is 0 or less, target is the full remaining amount.
  const dailyTarget = !due.isPaid && amountRemaining > 0
    ? (daysLeft > 0 ? amountRemaining / daysLeft : amountRemaining)
    : 0

  return (
    <div
      className={`rounded-[2rem] transition-all border-2 overflow-hidden ${
        due.isPaid
          ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
          : isOverdue
            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
            : isCrunch
              ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'
              : 'bg-white dark:bg-gray-800 border-gray-50 dark:border-gray-700 shadow-sm'
      }`}
    >
      {/* Header View */}
      <div
        onClick={onToggleExpand}
        className="p-5 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
            className={`transition-colors ${due.isPaid ? 'text-green-500' : isOverdue ? 'text-red-500' : isCrunch ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}
          >
            {due.isPaid ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Circle size={28} strokeWidth={2.5} />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-black text-sm ${due.isPaid ? 'text-green-700 dark:text-green-400' : isOverdue ? 'text-red-700 dark:text-red-400' : isCrunch ? 'text-orange-700 dark:text-orange-400' : ''}`}>
                {due.label}
              </h3>
              {isOverdue && <AlertCircle size={14} className="text-red-500" />}
              {isCrunch && <Info size={14} className="text-orange-500" />}
            </div>
            {!isExpanded && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                <CalendarIcon size={10} />
                Day {due.dayOfMonth}
                {isOverdue && <span className="text-red-500 ml-1">• OVERDUE</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`font-black ${due.isPaid ? 'text-green-600' : isOverdue ? 'text-red-600' : ''}`}>
              ₱ {due.amount.toLocaleString()}
            </p>
          </div>
          <div className="text-gray-400">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="px-5 pb-5 pt-0 space-y-4 border-t border-gray-100 dark:border-gray-700/50 mt-1">
              {/* Top Row: Date & Delete */}
              <div className="flex justify-between items-center pt-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                  <CalendarIcon size={12} />
                  Due on Day {due.dayOfMonth}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saved / Total</p>
                  <p className="font-black text-sm">
                    ₱ {due.contributedAmount.toLocaleString()} / <span className="opacity-40">₱ {due.amount.toLocaleString()}</span>
                  </p>
                </div>
                <p className={`text-xl font-black ${due.isPaid ? 'text-green-600' : isOverdue ? 'text-red-600' : isCrunch ? 'text-orange-600' : 'text-blue-600'}`}>
                  {Math.round(progress)}%
                </p>
              </div>

              {/* Progress Bar */}
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full transition-colors ${due.isPaid ? 'bg-green-500' : isOverdue ? 'bg-red-500' : isCrunch ? 'bg-orange-500' : 'bg-blue-600'}`}
                />
              </div>

              {/* Saving Target Section */}
              {!due.isPaid && (
                <div className={`p-4 rounded-2xl text-center flex flex-col items-center gap-1 ${
                  isOverdue
                    ? 'bg-red-500 text-white'
                    : isCrunch
                      ? 'bg-orange-500 text-white'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                }`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Daily Saving Target</p>
                  <p className="text-2xl font-black">
                    ₱ {Math.ceil(dailyTarget).toLocaleString()}
                  </p>
                  <p className="text-[8px] font-bold uppercase opacity-60">
                    {isOverdue ? 'Due Now' : daysLeft > 0 ? `To save in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` : 'Due Today'}
                  </p>
                </div>
              )}

              {/* Action Button */}
              {!due.isPaid && (
                <button
                  onClick={(e) => { e.stopPropagation(); onContribute(); }}
                  className={`w-full py-4 text-xs font-black uppercase rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md ${
                    isOverdue
                      ? 'bg-white text-red-600'
                      : isCrunch
                        ? 'bg-white text-orange-600'
                        : 'bg-blue-600 text-white'
                  }`}
                >
                  <HandCoins size={16} strokeWidth={3} /> Contribute Now
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MonthlyDues
