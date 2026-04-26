import React, { useState, useEffect, useMemo } from 'react'
import { useBudgetStore, type Due } from '../store/useBudgetStore'
import { Plus, CheckCircle2, Circle, Calendar as CalendarIcon, Trash2, ChevronDown, Check, Edit3, X, Layers, Wallet, AlertCircle } from 'lucide-react'
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

  const now = new Date()

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const activeDues = useMemo(() => dues.filter(d => !d.isPaid), [dues])
  const settledDues = useMemo(() => dues.filter(d => d.isPaid), [dues])

  return (
    <div className="p-6 pb-24 max-w-md mx-auto space-y-12">
      <header className="flex justify-between items-end pt-4">
          <div className="space-y-1">
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Capital Map</h1>
            <p className="text-3xl font-mono-currency font-bold tracking-tighter text-gray-900 dark:text-gray-200">Roadmap</p>
          </div>
          {activeDues.length > 0 && (
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-sm text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
              >
                  <Plus size={16} strokeWidth={3} />
              </button>
          )}
      </header>

      {/* Calendar Section - Negative Space */}
      <section className="px-1">
        <Calendar />
      </section>

      {activeDues.length === 0 && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-sm text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 transition-all flex flex-col items-center gap-3 uppercase text-[9px] font-black tracking-[0.4em]"
          >
            <Plus size={24} strokeWidth={2} />
            Initialize Buffer
          </button>
      )}

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-gray-50 dark:bg-white/[0.02] p-8 rounded-xl space-y-8 border border-gray-100 dark:border-blue-500/10 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-[9px] uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Parameter Setup</h2>
            <select
                value={newDue.priority}
                onChange={(e) => setNewDue({ ...newDue, priority: e.target.value })}
                className="bg-white dark:bg-white/5 text-[9px] font-black rounded-sm px-2 py-1 outline-none border border-gray-100 dark:border-white/10 text-gray-500 focus:border-blue-500/50"
            >
                <option value="1">L1 - CRITICAL</option>
                <option value="2">L2 - ESSENTIAL</option>
                <option value="3">L3 - COMMITMENT</option>
                <option value="4">L4 - LIFESTYLE</option>
                <option value="5">L5 - WISHLIST</option>
            </select>
          </div>

          <div className="space-y-6">
              <div>
                <label className="block text-[8px] font-black text-gray-400 dark:text-gray-600 uppercase mb-2 ml-1 tracking-[0.2em]">Label</label>
                <input
                  type="text"
                  required
                  value={newDue.label}
                  onChange={(e) => setNewDue({ ...newDue, label: e.target.value })}
                  placeholder="..."
                  className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-sm p-4 focus:border-blue-500/30 outline-none font-bold text-sm text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] font-black text-gray-400 dark:text-gray-600 uppercase mb-2 ml-1 tracking-[0.2em]">Value</label>
                  <input
                    type="number"
                    required
                    value={newDue.amount}
                    onChange={(e) => setNewDue({ ...newDue, amount: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-sm p-4 focus:border-blue-500/30 outline-none font-mono-currency font-bold text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-gray-400 dark:text-gray-600 uppercase mb-2 ml-1 tracking-[0.2em]">Interval Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newDue.dayOfMonth}
                    onChange={(e) => setNewDue({ ...newDue, dayOfMonth: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-sm p-4 focus:border-blue-500/30 outline-none font-bold text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] font-black text-gray-400 dark:text-gray-600 uppercase mb-2 ml-1 tracking-[0.2em]">Total Cycles</label>
                  <input
                    type="number"
                    value={newDue.totalTerms}
                    onChange={(e) => setNewDue({ ...newDue, totalTerms: e.target.value })}
                    className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-sm p-4 focus:border-blue-500/30 outline-none font-bold text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-gray-400 dark:text-gray-600 uppercase mb-2 ml-1 tracking-[0.2em]">Startup Term</label>
                  <input
                    type="number"
                    value={newDue.currentTerm}
                    disabled={!newDue.totalTerms}
                    onChange={(e) => setNewDue({ ...newDue, currentTerm: e.target.value })}
                    className={`w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-sm p-4 focus:border-blue-500/30 outline-none font-bold text-sm text-gray-900 dark:text-white ${!newDue.totalTerms && 'opacity-20'}`}
                  />
                </div>
              </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-sm uppercase text-[9px] tracking-[0.3em] shadow-xl"
            >
              Commit Object
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-4 bg-gray-200 dark:bg-white/5 text-gray-500 font-black rounded-sm uppercase text-[9px] tracking-[0.3em]"
            >
              Abort
            </button>
          </div>
        </form>
      )}

      {/* List Section - Floating Logic */}
      <section className="space-y-10">
        <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] border-b border-gray-100 dark:border-white/5 pb-4 px-1">Active Assets</h2>
        {activeDues.length === 0 ? (
          <p className="text-center text-gray-300 dark:text-gray-800 font-black text-[9px] uppercase tracking-[0.5em] py-16">Buffer Depleted</p>
        ) : (
          <div className="space-y-1">
            {activeDues
                .sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority
                return a.dueDate - b.dueDate
                })
                .map((due) => {
                const dDate = new Date(due.dueDate)
                const isOverdue = now.getTime() > dDate.getTime()
                const isCrunch = !isOverdue && (dDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000)

                return (
                    <CommitmentItem
                    key={due.id}
                    due={due}
                    contributedAmount={waterfall[due.id] || 0}
                    isOverdue={isOverdue}
                    isCrunch={isCrunch}
                    isExpanded={expandedId === due.id}
                    onToggleExpand={() => toggleExpand(due.id)}
                    onTogglePaid={() => toggleDuePaid(due.id)}
                    onDelete={() => deleteDue(due.id)}
                    onUpdate={(updates) => updateDue(due.id, updates)}
                    />
                )
                })}
          </div>
        )}

        {settledDues.length > 0 && (
          <div className="pt-10 space-y-10">
            <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] border-b border-gray-100 dark:border-white/5 pb-4 px-1">Settled Buffer</h2>
            <div className="space-y-1">
                {settledDues
                .sort((a, b) => a.dueDate - b.dueDate)
                .map((due) => (
                    <CommitmentItem
                    key={due.id}
                    due={due}
                    contributedAmount={due.amount}
                    isOverdue={false}
                    isCrunch={false}
                    isExpanded={expandedId === due.id}
                    onToggleExpand={() => toggleExpand(due.id)}
                    onTogglePaid={() => toggleDuePaid(due.id)}
                    onDelete={() => deleteDue(due.id)}
                    onUpdate={(updates) => updateDue(due.id, updates)}
                    />
                ))}
            </div>
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
  isExpanded: boolean
  onToggleExpand: () => void
  onTogglePaid: () => void
  onDelete: () => void
  onUpdate: (updates: Partial<Due>) => void
}

const CommitmentItem: React.FC<CommitmentItemProps> = ({
  due, contributedAmount, isOverdue, isCrunch, isExpanded,
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
  const daysLeft = Math.max(0, Math.ceil((dDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)))
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

  return (
    <div
      className={`transition-all group ${
        due.isPaid ? 'opacity-40' : ''
      }`}
    >
      {/* Header View */}
      <div
        onClick={onToggleExpand}
        className="py-6 px-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 transition-colors"
      >
        <div className="flex items-center gap-6">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
            className={`transition-all ${due?.isPaid || isFunded ? 'text-blue-500' : isOverdue ? 'text-red-500' : isCrunch ? 'text-orange-500' : 'text-gray-300 dark:text-gray-800'}`}
          >
            {due?.isPaid || isFunded ? <CheckCircle2 size={20} strokeWidth={3} /> : <Circle size={20} strokeWidth={2} />}
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h3 className={`font-bold text-sm tracking-tight ${due?.isPaid ? 'text-gray-500' : 'text-gray-800 dark:text-gray-300'}`}>
                {due?.label}
              </h3>
              <span className="text-[7px] font-black bg-gray-100 dark:bg-white/5 px-1 rounded-sm text-gray-500 dark:text-gray-600 border border-gray-200 dark:border-white/5 uppercase">
                L{due?.priority || 3}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-700 mt-1">
                {due.isPaid ? 'CYCLE SETTLED' : `TARGET: ${new Date(due.dueDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }).toUpperCase()}`}
                {isOverdue && !due.isPaid && <span className="text-red-500 font-bold flex items-center gap-0.5"><AlertCircle size={8} /> OVERDUE</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className={`font-mono-currency font-bold text-sm ${due?.isPaid || isFunded ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
              ₱ {(due?.amount || 0).toLocaleString()}
            </p>
          </div>
          <ChevronDown size={14} className={`text-gray-300 dark:text-gray-800 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-2">
          <div className="h-0.5 w-full bg-gray-100 dark:bg-white/5 overflow-hidden">
            <motion.div
                initial={false}
                animate={{ width: `${progress}%` }}
                className={`h-full transition-colors ${due.isPaid || isFunded ? 'bg-blue-500/50' : 'bg-gray-300 dark:bg-white/10'}`}
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
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="px-6 py-12 space-y-12 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                        value={editFields.label}
                        onChange={(e) => setEditFields({ ...editFields, label: e.target.value })}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-sm text-sm font-bold text-gray-900 dark:text-white outline-none"
                    />
                    <select
                        value={editFields.priority}
                        onChange={(e) => setEditFields({ ...editFields, priority: e.target.value })}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-sm text-xs font-bold text-gray-500 outline-none"
                    >
                        <option value="1">L1</option>
                        <option value="2">L2</option>
                        <option value="3">L3</option>
                        <option value="4">L4</option>
                        <option value="5">L5</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                        type="number"
                        value={editFields.amount}
                        onChange={(e) => setEditFields({ ...editFields, amount: e.target.value })}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-sm font-mono-currency font-bold text-sm text-gray-900 dark:text-white outline-none"
                    />
                    <input
                        type="number"
                        value={editFields.dueDate}
                        onChange={(e) => setEditFields({ ...editFields, dueDate: e.target.value })}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-sm font-bold text-sm text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleSaveEdit} className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-sm text-[9px] uppercase tracking-[0.3em]">Sync Parameters</button>
                    <button onClick={() => setIsEditing(false)} className="p-3 bg-gray-100 dark:bg-white/5 rounded-sm text-gray-500"><X size={16} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                        <CalendarIcon size={12} strokeWidth={3} />
                        Next Projection: {new Date(due.dueDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' }).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-500">
                        <Layers size={12} strokeWidth={3} />
                        {due.totalTerms ? `Progress: Month ${due.currentTerm} of ${due.totalTerms}` : 'Monthly Recurring'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(true)} className="p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-sm text-gray-400 dark:text-gray-600 hover:text-blue-500 transition-colors"><Edit3 size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-sm text-gray-400 dark:text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-[8px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em]">Accumulated / Goal</p>
                        <p className="text-xl font-mono-currency font-bold text-gray-900 dark:text-white">{Math.round(rawProgress)}%</p>
                      </div>
                      <p className="font-mono-currency font-bold text-sm text-gray-500 dark:text-gray-400">
                        ₱ {contributedAmount.toLocaleString()} <span className="text-gray-200 dark:text-gray-800 mx-2">|</span> ₱ {(due?.amount || 0).toLocaleString()}
                      </p>
                  </div>

                  {!due.isPaid && (
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-sm border border-gray-200 dark:border-white/5">
                          <div className="p-2 ml-1">
                            <Wallet size={12} className="text-blue-600 dark:text-blue-500" />
                          </div>
                          <input
                            type="number"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="Inclusion..."
                            className="bg-transparent border-none outline-none font-mono-currency font-bold text-xs flex-1 px-2 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={handleManualContribution}
                            className="bg-gray-900 dark:bg-white text-white dark:text-black text-[8px] font-black uppercase px-6 py-3 rounded-sm tracking-[0.3em] shadow-sm"
                          >
                              Sync
                          </button>
                      </div>
                  )}

                  <div className={`p-10 rounded-sm text-center flex flex-col items-center gap-4 transition-all ${
                    isFunded && !due.isPaid
                      ? 'bg-blue-600 text-white shadow-xl'
                      : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-600'
                  }`}>
                    {due.isPaid ? (
                      <div className="flex flex-col items-center gap-3">
                        <CheckCircle2 size={24} strokeWidth={3} className="text-emerald-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Cycle Settled</p>
                      </div>
                    ) : isFunded ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onTogglePaid(); }}
                        className="flex items-center gap-3 bg-white text-black px-12 py-5 rounded-sm shadow-2xl active:scale-95 transition-all"
                      >
                        <Check size={18} strokeWidth={4} />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Authorize Cycle</p>
                      </button>
                    ) : (
                      <>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60">Interval Reserve</p>
                        <p className="text-4xl font-mono-currency font-bold tracking-tighter text-gray-900 dark:text-gray-100">
                          ₱ {Math.ceil(dailyTarget).toLocaleString()}
                        </p>
                        <p className={`text-[8px] font-black uppercase tracking-[0.3em] ${isOverdue ? 'text-red-500 font-bold' : 'opacity-40'}`}>
                          {isOverdue ? 'Terminal Overdue' : `T-MINUS ${daysLeft} DAYS`}
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
