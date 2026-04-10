import React, { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useBudgetStore } from '../store/useBudgetStore'
import { Moon, Sun, Plus, Trash2, Wallet, CreditCard } from 'lucide-react'

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useAppStore()
  const { presets, addPreset, deletePreset } = useBudgetStore()
  const [isAddingPreset, setIsAddingPreset] = useState(false)
  const [newPreset, setNewPreset] = useState({ label: '', amount: '', type: 'expense' as 'income' | 'expense', color: '#3b82f6' })

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPreset.label || !newPreset.amount) return
    addPreset({
      label: newPreset.label,
      amount: parseFloat(newPreset.amount),
      type: newPreset.type,
      color: newPreset.color
    })
    setNewPreset({ label: '', amount: '', type: 'expense', color: '#3b82f6' })
    setIsAddingPreset(false)
  }

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Appearance</h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  theme === 'dark' ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Presets</h2>
            <button
              onClick={() => setIsAddingPreset(!isAddingPreset)}
              className="text-blue-600 text-sm font-bold flex items-center gap-1"
            >
              <Plus size={16} /> Add Preset
            </button>
          </div>

          {isAddingPreset && (
            <form onSubmit={handleAddPreset} className="mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl space-y-4 shadow-inner">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewPreset({ ...newPreset, type: 'expense' })}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${
                    newPreset.type === 'expense' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setNewPreset({ ...newPreset, type: 'income' })}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${
                    newPreset.type === 'income' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={newPreset.label}
                  onChange={(e) => setNewPreset({ ...newPreset, label: e.target.value })}
                  placeholder="Label (e.g. Food)"
                  className="w-full bg-white dark:bg-gray-700 border-none rounded-xl p-3 outline-none"
                />
              </div>

              <div>
                <input
                  type="number"
                  value={newPreset.amount}
                  onChange={(e) => setNewPreset({ ...newPreset, amount: e.target.value })}
                  placeholder="Amount"
                  className="w-full bg-white dark:bg-gray-700 border-none rounded-xl p-3 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setNewPreset({ ...newPreset, color: c.value })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      newPreset.color === c.value ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">
                  Save
                </button>
                <button type="button" onClick={() => setIsAddingPreset(false)} className="px-4 py-3 bg-gray-200 dark:bg-gray-600 rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {presets.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No presets added yet.</p>
            ) : (
              presets.map((p) => (
                <div key={p.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: p.color }}>
                      {p.type === 'income' ? <Wallet size={18} /> : <CreditCard size={18} />}
                    </div>
                    <div>
                      <p className="font-bold">{p.label}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        {p.type === 'income' ? '+' : '-'} ₱ {p.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deletePreset(p.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Currency</h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <span className="font-medium">Default Currency</span>
            <span className="text-gray-500 font-bold">PHP (₱)</span>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
