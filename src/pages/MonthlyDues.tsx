import React, { useState, useEffect } from 'react'
import { useBudgetStore, type Due } from '../store/useBudgetStore'
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, AlertCircle, Trash2, Info, ChevronDown, ChevronUp, Check, Edit3, X, Flag, Layers, Wallet } from 'lucide-react'
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

  const activeDues = dues.filter(d => !d.isPaid)
  const settledDues = dues.filter(d => d.isPaid)

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <header className="mb-8">
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">Commitments</h1>
          <p className="text-[10px] font-medium text-gray-600 uppercase tracking-widest mt-1">Smart Roadmap & Funding</p>
      </header>

      {/* Calendar Section */}
      <section className="mb-8 glass card-radius p-4 shadow-sm">
        <Calendar />
      </section>

      {/* Action Button - Bespoke Style */}
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="w-full py-4 mb-8 bg-blue-600 text-white font-black btn-radius shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.3em]"
      >
        <Plus size={16} strokeWidth={4} />
        New Commitment
      </button>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-8 glass p-6 card-radius space-y-4 border-blue-500/30">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-400">Initialize</h2>
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Level</label>
              <select
                value={newDue.priority}
                onChange={(e) => setNewDue({ ...newDue, priority: e.target.value })}
                className="glass-recessed text-[10px] font-black rounded-sm px-2 py-1 outline-none border-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="1">L1 - Critical</option>
                <option value="2">L2 - Essential</option>
                <option value="3">L3 - Commitment</option>
                <option value="4">L4 - Lifestyle</option>
                <option value="5">L5 - Wishlist</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Label</label>
            <input
              type="text"
              value={newDue.label}
              onChange={(e) => setNewDue({ ...newDue, label: e.target.value })}
              placeholder="e.g. Netflix, Rent"
              className="w-full glass-recessed btn-radius p-4 focus:ring-1 focus:ring-blue-500 outline-none font-bold text-sm"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Target Amount</label>
              <input
                type="number"
                value={newDue.amount}
                onChange={(e) => setNewDue({ ...newDue, amount: e.target.value })}
                placeholder="0.00"
                className="w-full glass-recessed btn-radius p-4 focus:ring-1 focus:ring-blue-500 outline-none font-mono-currency font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={newDue.dayOfMonth}
                onChange={(e) => setNewDue({ ...newDue, dayOfMonth: e.target.value })}
                className="w-full glass-recessed btn-radius p-4 focus:ring-1 focus:ring-blue-500 outline-none font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Terms (Opt)</label>
              <input
                type="number"
                value={newDue.totalTerms}
                onChange={(e) => setNewDue({ ...newDue, totalTerms: e.target.value })}
                placeholder="e.g. 36"
                className="w-full glass-recessed btn-radius p-4 focus:ring-1 focus:ring-blue-500 outline-none font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Current</label>
              <input
                type="number"
                value={newDue.currentTerm}
                disabled={!newDue.totalTerms}
                onChange={(e) => setNewDue({ ...newDue, currentTerm: e.target.value })}
                className={`w-full glass-recessed btn-radius p-4 focus:ring-1 focus:ring-blue-500 outline-none font-bold text-sm ${!newDue.totalTerms && 'opacity-30'}`}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-4 bg-white text-black font-black btn-radius shadow-xl uppercase text-[10px] tracking-[0.2em]"
            >
              Set Objective
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-4 glass-recessed btn-radius font-black text-[10px] uppercase tracking-widest text-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List Section */}
      <section className="space-y-6">
        <h2 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] px-1">Active Roadmap</h2>
        {activeDues.length === 0 ? (
          <div className="glass card-radius p-12 text-center border-dashed border-white/5">
            <p className="text-gray-600 font-black text-[9px] uppercase tracking-widest">No active commitments</p>
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
          <div className="pt-10 space-y-6">
            <h2 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] px-1">Settled Cycle</h2>
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

  const priorityLabels: Record<number, string> = {
    1: 'L1',
    2: 'L2',
    3: 'L3',
    4: 'L4',
    5: 'L5'
  }

  return (
    <div
      className={`card-radius transition-all border overflow-hidden ${
        due.isPaid
          ? 'glass grayscale opacity-50 border-white/5'
          : isCompleted
          ? 'glass border-blue-500/30'
          : isFunded
          ? 'glass border-blue-500/40 shadow-blue-500/5'
          : isOverdue
            ? 'glass border-red-500/30'
            : isCrunch
              ? 'glass border-orange-500/30'
              : 'glass border-white/10 shadow-sm'
      }`}
    >
      {/* Header View */}
      <div
        onClick={onToggleExpand}
        className="p-5 pb-3 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
            className={`transition-all ${due?.isPaid || isFunded ? 'text-blue-400' : isOverdue ? 'text-red-500' : isCrunch ? 'text-orange-500' : 'text-gray-700'}`}
          >
            {due?.isPaid || isFunded ? <CheckCircle2 size={24} strokeWidth={3} /> : <Circle size={24} strokeWidth={3} />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-sm tracking-tight ${due?.isPaid ? 'text-gray-500' : 'text-gray-100'}`}>
                {due?.label}
              </h3>
              <span className="text-[8px] font-black bg-white/5 px-1.5 py-0.5 btn-radius text-gray-500 border border-white/10">
                {priorityLabels[due?.priority || 3]}
              </span>
              {isOverdue && <AlertCircle size={12} className="text-red-500" />}
              {isCrunch && <Info size={12} className="text-orange-500" />}
            </div>
            {!isExpanded && (
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-600 mt-1">
                <CalendarIcon size={10} strokeWidth={3} />
                {due.isPaid ? 'NEXT' : 'DUE'}: {new Date(due.dueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`font-mono-currency font-bold ${due?.isPaid || isFunded ? 'text-blue-400' : isOverdue ? 'text-red-400' : 'text-gray-100'}`}>
              ₱ {(due?.amount || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-gray-600">
            {isExpanded ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
          </div>
        </div>
      </div>

      {/* Progress Bar (Optical Alignment) */}
      <div className="px-5 pb-5">
        <div className="h-1 w-full glass-recessed btn-radius overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${progress}%` }}
            className={`h-full transition-colors ${due.isPaid || isFunded ? 'bg-blue-500' : isOverdue ? 'bg-red-500' : isCrunch ? 'bg-orange-500' : 'bg-white/40'}`}
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
            <div className="px-5 pb-6 pt-0 space-y-6 border-t border-white/5 mt-1">
              {isEditing ? (
                <div className="space-y-4 pt-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Label</label>
                      <input
                        type="text"
                        value={editFields.label}
                        onChange={(e) => setEditFields({ ...editFields, label: e.target.value })}
                        className="w-full glass-recessed p-3 btn-radius outline-none font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Level</label>
                      <select
                        value={editFields.priority}
                        onChange={(e) => setEditFields({ ...editFields, priority: e.target.value })}
                        className="w-full glass-recessed p-3 btn-radius outline-none font-bold text-xs"
                      >
                        <option value="1">L1 - Critical</option>
                        <option value="2">L2 - Essential</option>
                        <option value="3">L3 - Commitment</option>
                        <option value="4">L4 - Lifestyle</option>
                        <option value="5">L5 - Wishlist</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Amount</label>
                      <input
                        type="number"
                        value={editFields.amount}
                        onChange={(e) => setEditFields({ ...editFields, amount: e.target.value })}
                        className="w-full glass-recessed p-3 btn-radius outline-none font-mono-currency font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Day</label>
                      <input
                        type="number"
                        value={editFields.dueDate}
                        onChange={(e) => setEditFields({ ...editFields, dueDate: e.target.value })}
                        className="w-full glass-recessed p-3 btn-radius outline-none font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="flex-1 py-3 bg-white text-black font-black btn-radius text-[10px] uppercase tracking-widest">Apply Changes</button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-3 glass-recessed btn-radius font-black text-gray-500"><X size={16} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-2 btn-radius border border-white/5">
                        <CalendarIcon size={12} strokeWidth={3} />
                        {due.isPaid ? 'NEXT' : 'TARGET'}: {new Date(due.dueDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' }).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-2 btn-radius border border-blue-500/20">
                        <Flag size={12} strokeWidth={3} />
                        Priority {due?.priority || 3}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-3 glass-recessed btn-radius text-gray-500 hover:text-white transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-3 glass-recessed btn-radius text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Status / Progress</p>
                      <p className="font-mono-currency font-bold text-sm text-gray-200">
                        ₱ {contributedAmount.toLocaleString()} <span className="text-gray-600 mx-1">/</span> ₱ {(due?.amount || 0).toLocaleString()}
                      </p>
                    </div>
                    <p className={`text-2xl font-mono-currency font-bold ${due.isPaid || isFunded ? 'text-blue-400' : 'text-white'}`}>
                      {Math.round(rawProgress)}%
                    </p>
                  </div>

                  {/* Manual Injection */}
                  {!due.isPaid && !isCompleted && (
                      <div className="flex items-center gap-2 glass-recessed p-1 btn-radius">
                          <div className="p-2 bg-white/5 btn-radius ml-1">
                            <Wallet size={14} className="text-blue-400" />
                          </div>
                          <input
                            type="number"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="Injection..."
                            className="bg-transparent border-none outline-none font-mono-currency font-bold text-xs flex-1 px-2"
                          />
                          <button
                            onClick={handleManualContribution}
                            className="bg-white text-black text-[9px] font-black uppercase px-4 py-2.5 btn-radius tracking-widest"
                          >
                              Sync
                          </button>
                      </div>
                  )}

                  <div className="glass-recessed p-5 btn-radius space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <Layers size={14} className="text-blue-400" />
                         <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Roadmap Term</p>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">
                        {due.totalTerms ? `Term: ${due.currentTerm} / ${due.totalTerms}` : 'Monthly Recurring'}
                      </p>
                    </div>

                    <div className="h-1 w-full bg-white/5 btn-radius overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${due.totalTerms ? Math.min((due.currentTerm! / due.totalTerms) * 100, 100) : 100}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>

                  <div className={`p-5 btn-radius text-center flex flex-col items-center gap-2 transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white shadow-lg'
                      : due.isPaid
                      ? 'bg-white/5 text-gray-500 border border-white/5'
                      : isFunded
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-lg'
                      : isOverdue
                        ? 'bg-red-500 text-white'
                        : isCrunch
                          ? 'bg-orange-500 text-white'
                          : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}>
                    {isCompleted ? (
                      <div className="flex items-center gap-3">
                         <CheckCircle2 size={20} strokeWidth={3} />
                         <p className="text-[10px] font-black uppercase tracking-[0.3em]">Objective Secured</p>
                      </div>
                    ) : due.isPaid ? (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} strokeWidth={3} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Cycle Settled</p>
                      </div>
                    ) : isFunded ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
                        className="flex items-center gap-2 bg-white text-black px-8 py-3 btn-radius shadow-xl active:scale-95 transition-all"
                      >
                        <Check size={16} strokeWidth={4} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Authorize Payment</p>
                      </button>
                    ) : (
                      <>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60">Daily Reservation</p>
                        <p className="text-2xl font-mono-currency font-bold tracking-tighter">
                          ₱ {Math.ceil(dailyTarget).toLocaleString()}
                        </p>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40">
                          {isOverdue ? 'Overdue' : daysLeft > 0 ? `T-minus ${daysLeft} days` : 'Terminal Date'}
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
