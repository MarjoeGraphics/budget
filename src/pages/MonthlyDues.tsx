import React, { useState, useEffect } from 'react'
import { useBudgetStore, type Due } from '../store/useBudgetStore'
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, AlertCircle, Trash2, Info, ChevronDown, ChevronUp, Check, Edit3, X, Flag, Layers, Milestone, Wallet } from 'lucide-react'
import Calendar from '../components/calendar/Calendar'
import { motion, AnimatePresence } from 'framer-motion'
import { useWaterfall } from '../hooks/useWaterfall'

const MonthlyDues: React.FC = () => {
  const { dues, addDue, toggleDuePaid, deleteDue, updateDue, checkAndResetMonthlyDues } = useBudgetStore()
  const waterfall = useWaterfall()
  const [isAdding, setIsAdding] = useState(false)
  const [newDue, setNewDue] = useState({
    label: '',
    amount: '',
    dayOfMonth: new Date().getDate().toString(),
    priority: '3',
    totalTerms: '',
    currentTerm: '1'
  })

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
      dayOfMonth: parseInt(newDue.dayOfMonth) || 1,
      priority: parseInt(newDue.priority) || 3,
      totalTerms: newDue.totalTerms ? parseInt(newDue.totalTerms) : undefined,
      currentTerm: newDue.totalTerms ? parseInt(newDue.currentTerm) : undefined
    })
    setNewDue({
      label: '',
      amount: '',
      dayOfMonth: new Date().getDate().toString(),
      priority: '3',
      totalTerms: '',
      currentTerm: '1'
    })
    setIsAdding(false)
  }

  const today = new Date().getDate()
  const now = new Date()

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Filter logic:
  // Active: Unpaid and due this month or earlier
  // Settled: Paid and due next month (or later) OR Paid and due this month
  // Actually, the user said: "Items in 'Settled' represent the completion of the CURRENT month's goal. They should stay there, showing the 'Next Due Date,' until the 1st of the new month"

  const activeDues = dues.filter(d => !d.isPaid)
  const settledDues = dues.filter(d => d.isPaid)

  return (
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-black mb-6">Monthly Goals</h1>

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
        Add New Monthly Goal
      </button>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-[2rem] space-y-4 border border-blue-100 dark:border-blue-900/30">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-sm uppercase tracking-widest text-blue-600">New Goal</h2>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-gray-400 uppercase">Priority</label>
              <select
                value={newDue.priority}
                onChange={(e) => setNewDue({ ...newDue, priority: e.target.value })}
                className="bg-white dark:bg-gray-700 text-[10px] font-black rounded-lg px-2 py-1 outline-none border-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="1">1 - Critical</option>
                <option value="2">2 - Essential</option>
                <option value="3">3 - Commitment</option>
                <option value="4">4 - Lifestyle</option>
                <option value="5">5 - Wishlist</option>
              </select>
            </div>
          </div>
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
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Goal Amount</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Total Terms (Optional)</label>
              <input
                type="number"
                value={newDue.totalTerms}
                onChange={(e) => setNewDue({ ...newDue, totalTerms: e.target.value })}
                placeholder="e.g. 36"
                className="w-full bg-white dark:bg-gray-700 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Current Term</label>
              <input
                type="number"
                value={newDue.currentTerm}
                disabled={!newDue.totalTerms}
                onChange={(e) => setNewDue({ ...newDue, currentTerm: e.target.value })}
                className={`w-full bg-white dark:bg-gray-700 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm ${!newDue.totalTerms && 'opacity-50'}`}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20"
            >
              Set Goal
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
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Active Monthly Goals</h2>
        {activeDues.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-12 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 dark:border-gray-800">
            No active goals.
          </div>
        ) : (
          activeDues
            .sort((a, b) => {
              if (a.priority !== b.priority) return a.priority - b.priority
              return a.dueDate - b.dueDate
            })
            .map((due) => {
              const dDate = new Date(due.dueDate)
              const isOverdue = today > dDate.getDate() && now.getMonth() >= dDate.getMonth()
              const isCrunch = !isOverdue && (dDate.getDate() >= today && dDate.getDate() <= today + 3)

              return (
                <CommitmentItem
                  key={due.id}
                  due={due}
                  contributedAmount={waterfall[due.id] || 0}
                  isOverdue={isOverdue}
                  isCrunch={isCrunch}
                  today={today}
                  isExpanded={expandedId === due.id}
                  onToggleExpand={() => toggleExpand(due.id)}
                  onTogglePaid={() => toggleDuePaid(due.id)}
                  onDelete={() => deleteDue(due.id)}
                  onUpdate={(updates) => updateDue(due.id, updates)}
                />
              )
            })
        )}

        {/* Settled Section */}
        {settledDues.length > 0 && (
          <div className="pt-8 space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Settled / Next Cycle</h2>
            {settledDues
              .sort((a, b) => a.dueDate - b.dueDate)
              .map((due) => (
                <CommitmentItem
                  key={due.id}
                  due={due}
                  contributedAmount={due.amount}
                  isOverdue={false}
                  isCrunch={false}
                  today={today}
                  isExpanded={expandedId === due.id}
                  onToggleExpand={() => toggleExpand(due.id)}
                  onTogglePaid={() => toggleDuePaid(due.id)}
                  onDelete={() => deleteDue(due.id)}
                  onUpdate={(updates) => updateDue(due.id, updates)}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  )
}

interface CommitmentItemProps {
  due: Due
  contributedAmount: number
  isOverdue: boolean
  isCrunch: boolean
  today: number
  isExpanded: boolean
  onToggleExpand: () => void
  onTogglePaid: () => void
  onDelete: () => void
  onUpdate: (updates: Partial<Due>) => void
}

const CommitmentItem: React.FC<CommitmentItemProps> = ({
  due, contributedAmount, isOverdue, isCrunch, today, isExpanded,
  onToggleExpand, onTogglePaid, onDelete, onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editFields, setEditFields] = useState({
    label: due?.label || '',
    amount: (due?.amount || 0).toString(),
    dueDate: new Date(due?.dueDate || Date.now()).getDate().toString(),
    priority: (due?.priority || 3).toString(),
    totalTerms: due?.totalTerms?.toString() || '',
    currentTerm: due?.currentTerm?.toString() || '1'
  })

  const [manualInput, setManualInput] = useState((due?.currentAmount || 0).toString())

  const isCompleted = !!(due?.totalTerms && due?.currentTerm && due.currentTerm > due.totalTerms)
  const isFunded = !!(due?.isPaid || contributedAmount >= (due?.amount || 0) || isCompleted)
  const surplus = contributedAmount > (due?.amount || 0) ? contributedAmount - (due?.amount || 0) : 0
  const rawProgress = (contributedAmount / (due?.amount || 1)) * 100
  const progress = Math.min(rawProgress, 100)

  const dDate = new Date(due.dueDate)
  const daysLeft = dDate.getDate() - today
  const amountRemaining = Math.max((due?.amount || 0) - contributedAmount, 0)

  const dailyTarget = !isFunded && amountRemaining > 0
    ? (daysLeft > 0 ? amountRemaining / daysLeft : amountRemaining)
    : 0

  const handleSaveEdit = () => {
    const newDate = new Date(due.dueDate)
    newDate.setDate(parseInt(editFields.dueDate))

    onUpdate({
      label: editFields.label,
      amount: parseFloat(editFields.amount),
      dueDate: newDate.getTime(),
      priority: parseInt(editFields.priority),
      totalTerms: editFields.totalTerms ? parseInt(editFields.totalTerms) : undefined,
      currentTerm: editFields.totalTerms ? parseInt(editFields.currentTerm) : undefined
    })
    setIsEditing(false)
  }

  const handleManualContribution = () => {
      onUpdate({ currentAmount: parseFloat(manualInput) || 0 })
  }

  const priorityColors: Record<number, string> = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-blue-600',
    4: 'bg-teal-500',
    5: 'bg-slate-500'
  }

  const priorityLabels: Record<number, string> = {
    1: 'Critical',
    2: 'Essential',
    3: 'Commitment',
    4: 'Lifestyle',
    5: 'Wishlist'
  }

  const getFreedomDate = () => {
    if (!due?.totalTerms || !due?.currentTerm) return null
    const monthsRemaining = due.totalTerms - due.currentTerm
    if (monthsRemaining < 0) return 'Completed'

    const d = new Date()
    d.setMonth(d.getMonth() + monthsRemaining)
    return `Fully paid by ${d.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}`
  }

  return (
    <div
      className={`rounded-[2rem] transition-all border-2 overflow-hidden ${
        due.isPaid
          ? 'bg-gray-100/50 dark:bg-white/5 border-gray-100 dark:border-gray-800 grayscale opacity-70'
          : isCompleted
          ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 grayscale opacity-60'
          : isFunded
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
        className="p-5 pb-2 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
            className={`transition-colors ${due?.isPaid || isFunded ? 'text-green-500' : isOverdue ? 'text-red-500' : isCrunch ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}
          >
            {due?.isPaid || isFunded ? <CheckCircle2 size={28} strokeWidth={2.5} /> : <Circle size={28} strokeWidth={2.5} />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-black text-sm ${due?.isPaid ? 'text-gray-500' : isCompleted ? 'text-emerald-700 dark:text-emerald-400' : due?.isPaid || isFunded ? 'text-green-700 dark:text-green-400' : isOverdue ? 'text-red-700 dark:text-red-400' : isCrunch ? 'text-orange-700 dark:text-orange-400' : ''}`}>
                {due?.label}
              </h3>
              <div className={`w-2 h-2 rounded-full ${priorityColors[due?.priority || 3]}`} />
              {isOverdue && <AlertCircle size={14} className="text-red-500" />}
              {isCrunch && <Info size={14} className="text-orange-500" />}
            </div>
            {!isExpanded && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
                <CalendarIcon size={10} />
                {due.isPaid ? 'Next: ' : 'Due: '} {new Date(due.dueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                {isOverdue && <span className="text-red-500 ml-1">• OVERDUE</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`font-black ${due?.isPaid || isFunded ? 'text-green-600' : isOverdue ? 'text-red-600' : ''}`}>
              ₱ {(due?.amount || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-gray-400">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Progress Bar (Always Visible) */}
      <div className="px-5 pb-4">
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${progress}%` }}
            className={`h-full transition-colors ${due.isPaid || isFunded ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : isCrunch ? 'bg-orange-500' : 'bg-blue-600'}`}
          />
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
              {isEditing ? (
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Label</label>
                      <input
                        type="text"
                        value={editFields.label}
                        onChange={(e) => setEditFields({ ...editFields, label: e.target.value })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border-none outline-none font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Priority</label>
                      <select
                        value={editFields.priority}
                        onChange={(e) => setEditFields({ ...editFields, priority: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border-none outline-none font-bold text-xs"
                      >
                        <option value="1">L1 - Critical</option>
                        <option value="2">L2 - Essential</option>
                        <option value="3">L3 - Commitment</option>
                        <option value="4">L4 - Lifestyle</option>
                        <option value="5">L5 - Wishlist</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Goal Amount</label>
                      <input
                        type="number"
                        value={editFields.amount}
                        onChange={(e) => setEditFields({ ...editFields, amount: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border-none outline-none font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Day of Month</label>
                      <input
                        type="number"
                        value={editFields.dueDate}
                        onChange={(e) => setEditFields({ ...editFields, dueDate: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border-none outline-none font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Total Terms</label>
                      <input
                        type="number"
                        value={editFields.totalTerms}
                        onChange={(e) => setEditFields({ ...editFields, totalTerms: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border-none outline-none font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Current Term</label>
                      <input
                        type="number"
                        value={editFields.currentTerm}
                        onChange={(e) => setEditFields({ ...editFields, currentTerm: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border-none outline-none font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl text-xs uppercase">Save Changes</button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 font-black rounded-xl text-xs uppercase"><X size={16} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full w-fit">
                        <CalendarIcon size={12} />
                        {due.isPaid ? 'Next Due: ' : 'Due: '} {new Date(due.dueDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })}
                      </div>
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white ${priorityColors[due?.priority || 3]} px-3 py-1.5 rounded-full w-fit shadow-lg shadow-black/5`}>
                        <Flag size={12} strokeWidth={3} />
                        Priority {due?.priority || 3}: {priorityLabels[due?.priority || 3]}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        aria-label="Edit Goal"
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors edit-goal-btn"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        aria-label="Delete Goal"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saved / Goal</p>
                      {isFunded ? (
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm text-emerald-600">₱ {(due?.amount || 0).toLocaleString()} / ₱ {(due?.amount || 0).toLocaleString()}</p>
                          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Fully Funded</span>
                        </div>
                      ) : (
                        <p className="font-black text-sm">
                          ₱ {contributedAmount.toLocaleString()} / <span className="opacity-40">₱ {(due?.amount || 0).toLocaleString()}</span>
                        </p>
                      )}
                      {surplus > 0 && (
                        <p className="text-[10px] font-black text-emerald-600 uppercase mt-1">Surplus: ₱ {surplus.toLocaleString()}</p>
                      )}
                    </div>
                    <p className={`text-xl font-black ${due.isPaid || isFunded ? 'text-emerald-600' : isOverdue ? 'text-red-600' : isCrunch ? 'text-orange-600' : 'text-blue-600'}`}>
                      {Math.round(rawProgress)}%
                    </p>
                  </div>

                  <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      className={`h-full transition-colors ${due.isPaid || isFunded ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : isCrunch ? 'bg-orange-500' : 'bg-blue-600'}`}
                    />
                  </div>

                  {/* Manual Contribution Input */}
                  {!due.isPaid && !isCompleted && (
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                          <div className="p-2 bg-white dark:bg-gray-800 rounded-xl">
                            <Wallet size={16} className="text-blue-500" />
                          </div>
                          <input
                            type="number"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="Manual input..."
                            className="bg-transparent border-none outline-none font-bold text-xs flex-1"
                          />
                          <button
                            onClick={handleManualContribution}
                            className="bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl"
                          >
                              Set
                          </button>
                      </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-900/30 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <Layers size={14} className="text-blue-500" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Roadmap Progress</p>
                      </div>
                      <p className="text-[10px] font-black uppercase text-blue-600">
                        {due.totalTerms ? `Month ${due.currentTerm} of ${due.totalTerms}` : 'Monthly Recurring'}
                      </p>
                    </div>

                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${due.totalTerms ? Math.min((due.currentTerm! / due.totalTerms) * 100, 100) : 100}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>

                    {due.totalTerms && (
                        <div className="flex items-center gap-2 pt-1">
                        <Milestone size={14} className="text-emerald-500" />
                        <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                            {getFreedomDate()}
                        </p>
                        </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-2xl text-center flex flex-col items-center gap-1 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                      : due.isPaid
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      : isFunded
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-100 dark:border-emerald-900/30'
                      : isOverdue
                        ? 'bg-red-500 text-white'
                        : isCrunch
                          ? 'bg-orange-500 text-white'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  }`}>
                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                         <CheckCircle2 size={24} />
                         <p className="text-sm font-black uppercase tracking-[0.2em]">Goal Completed</p>
                      </div>
                    ) : due.isPaid ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={20} />
                        <p className="text-sm font-black uppercase tracking-widest">Settled for Current Month</p>
                      </div>
                    ) : isFunded ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <Check size={18} strokeWidth={4} />
                        <p className="text-xs font-black uppercase tracking-widest">Mark as Paid</p>
                      </button>
                    ) : (
                      <>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Needed to save daily</p>
                        <p className="text-2xl font-black">
                          ₱ {Math.ceil(dailyTarget).toLocaleString()}
                        </p>
                        <p className="text-[8px] font-bold uppercase opacity-60">
                          {isOverdue ? 'Due Now' : daysLeft > 0 ? `To save in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` : 'Due Today'}
                        </p>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MonthlyDues
