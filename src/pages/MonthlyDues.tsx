import React, { useState, useEffect } from 'react'
import { useBudgetStore, type Due, type Transaction } from '../store/useBudgetStore'
import { Plus, CheckCircle2, Circle, HandCoins, Calendar as CalendarIcon, AlertCircle, History, X, Info } from 'lucide-react'
import Calendar from '../components/calendar/Calendar'
import { motion, AnimatePresence } from 'framer-motion'

const MonthlyDues: React.FC = () => {
  const { dues, transactions, addDue, toggleDuePaid, deleteDue, contributeToDue, checkAndResetMonthlyDues } = useBudgetStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newDue, setNewDue] = useState({ label: '', amount: '', dayOfMonth: new Date().getDate().toString() })

  const [isContributing, setIsContributing] = useState<string | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')

  const [selectedDueId, setSelectedDueId] = useState<string | null>(null)

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
  const selectedDue = dues.find(d => d.id === selectedDueId)
  const dueHistory = transactions.filter(t => t.dueId === selectedDueId)

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
                onToggle={() => toggleDuePaid(due.id)}
                onDelete={() => deleteDue(due.id)}
                onContribute={() => setIsContributing(due.id)}
                onClick={() => setSelectedDueId(due.id)}
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

      {/* Detail Modal (Saving Coach) */}
      <AnimatePresence>
        {selectedDue && (
          <CommitmentDetailModal
            due={selectedDue}
            history={dueHistory}
            onClose={() => setSelectedDueId(null)}
            today={today}
          />
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
  onToggle: () => void
  onDelete: () => void
  onContribute: () => void
  onClick: () => void
}

const CommitmentItem: React.FC<CommitmentItemProps> = ({ due, isOverdue, isCrunch, onToggle, onDelete, onContribute, onClick }) => {
  const progress = Math.min((due.contributedAmount / due.amount) * 100, 100)

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-[2rem] transition-all border-2 cursor-pointer active:scale-[0.98] ${
        due.isPaid
          ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
          : isOverdue
            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
            : isCrunch
              ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'
              : 'bg-white dark:bg-gray-800 border-gray-50 dark:border-gray-700 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
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
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
              <CalendarIcon size={10} />
              Day {due.dayOfMonth}
              {isOverdue && <span className="text-red-500 ml-1">• OVERDUE</span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-black ${due.isPaid ? 'text-green-600' : isOverdue ? 'text-red-600' : ''}`}>
            ₱ {due.amount.toLocaleString()}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase mt-1"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end px-1">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
             ₱ {due.contributedAmount.toLocaleString()} / ₱ {due.amount.toLocaleString()}
           </p>
           <p className={`text-[10px] font-black uppercase ${due.isPaid ? 'text-green-600' : isOverdue ? 'text-red-600' : isCrunch ? 'text-orange-600' : 'text-blue-600'}`}>
             {Math.round(progress)}%
           </p>
        </div>
        <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full transition-colors ${due.isPaid ? 'bg-green-500' : isOverdue ? 'bg-red-500' : isCrunch ? 'bg-orange-500' : 'bg-blue-600'}`}
          />
        </div>
        {!due.isPaid && (
          <button
            onClick={(e) => { e.stopPropagation(); onContribute(); }}
            className={`w-full mt-2 py-2 text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-colors ${
              isOverdue
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : isCrunch
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            }`}
          >
            <HandCoins size={12} /> Contribute
          </button>
        )}
      </div>
    </div>
  )
}

const CommitmentDetailModal: React.FC<{ due: Due, history: Transaction[], onClose: () => void, today: number }> = ({ due, history, onClose, today }) => {
  const amountRemaining = due.amount - due.contributedAmount

  // Logic for Days Left and Overdue
  const isOverdue = !due.isPaid && today > due.dayOfMonth
  const daysLeft = due.dayOfMonth - today

  const dailyTarget = !isOverdue && daysLeft > 0 ? amountRemaining / daysLeft : 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-end justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saving Coach</p>
            <h2 className="text-3xl font-black tracking-tight">{due.label}</h2>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-700">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Remaining</p>
             <p className="text-xl font-black">₱ {amountRemaining.toLocaleString()}</p>
          </div>
          <div className={`p-5 rounded-3xl border ${isOverdue ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'}`}>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Left</p>
             <p className={`text-xl font-black ${isOverdue ? 'text-red-600' : ''}`}>
               {isOverdue ? 'Overdue' : `${daysLeft} Day${daysLeft === 1 ? '' : 's'}`}
             </p>
          </div>
        </div>

        <div className={`p-6 rounded-[2rem] mb-8 text-center border-4 ${isOverdue ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-500/20' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20'}`}>
           {isOverdue ? (
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Action Required</p>
               <p className="text-2xl font-black uppercase tracking-tight">DUE NOW: ₱ {amountRemaining.toLocaleString()}</p>
             </div>
           ) : (
             <div>
               <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">Daily Target</p>
               <p className="text-3xl font-black text-blue-700 dark:text-blue-300 tracking-tighter">₱ {dailyTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
               <p className="text-[10px] font-medium text-blue-600/60 dark:text-blue-400/60 uppercase mt-1">to reach goal on time</p>
             </div>
           )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <History size={16} className="text-gray-400" />
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contribution History</h3>
          </div>

          <div className="space-y-3">
             {history.length === 0 ? (
               <p className="text-sm text-center py-6 text-gray-400 italic">No contributions recorded yet.</p>
             ) : (
               history.map(t => (
                 <div key={t.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div>
                       <p className="text-xs font-black uppercase text-gray-500">{new Date(t.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <p className="font-black text-red-500">- ₱ {t.amount.toLocaleString()}</p>
                 </div>
               ))
             )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black rounded-2xl shadow-xl transition-transform active:scale-[0.98]"
        >
          Back to List
        </button>
      </motion.div>
    </div>
  )
}

export default MonthlyDues
