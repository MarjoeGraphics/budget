import React, { useState } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'

const MonthlyDues: React.FC = () => {
  const { dues, addDue, toggleDuePaid, deleteDue } = useBudgetStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newDue, setNewDue] = useState({ label: '', amount: '' })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDue.label || !newDue.amount) return
    addDue({
      label: newDue.label,
      amount: parseFloat(newDue.amount)
    })
    setNewDue({ label: '', amount: '' })
    setIsAdding(false)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Monthly Dues</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-blue-600 text-white rounded-full shadow-lg"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Label</label>
            <input
              type="text"
              value={newDue.label}
              onChange={(e) => setNewDue({ ...newDue, label: e.target.value })}
              placeholder="e.g. Rent, Internet"
              className="w-full bg-white dark:bg-gray-700 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount</label>
            <input
              type="number"
              value={newDue.amount}
              onChange={(e) => setNewDue({ ...newDue, amount: e.target.value })}
              placeholder="0.00"
              className="w-full bg-white dark:bg-gray-700 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl"
            >
              Save Due
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-600 font-bold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {dues.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400">
            No dues scheduled yet. Click the + button to add one.
          </div>
        ) : (
          dues.map((due) => (
            <div
              key={due.id}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                due.isPaid
                  ? 'bg-gray-50 dark:bg-gray-800/30 opacity-60'
                  : 'bg-gray-100 dark:bg-gray-800 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleDuePaid(due.id)}
                  className={`transition-colors ${due.isPaid ? 'text-green-500' : 'text-gray-400'}`}
                >
                  {due.isPaid ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div>
                  <h3 className={`font-semibold ${due.isPaid ? 'line-through' : ''}`}>{due.label}</h3>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                    ₱ {due.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteDue(due.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MonthlyDues
