import React, { useState, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useBudgetStore } from '../store/useBudgetStore'
import { Moon, Sun, Plus, Trash2, Wallet, CreditCard, Download, Upload, Trash, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useAppStore()
  const { presets, addPreset, deletePreset, clearAllData, importData, initialBalance, setInitialBalance } = useBudgetStore()

  const [isAddingPreset, setIsAddingPreset] = useState(false)
  const [newPreset, setNewPreset] = useState({ label: '', amount: '', type: 'expense' as 'income' | 'expense', color: '#3b82f6' })

  const [isConfirmingClear, setIsConfirmingClear] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleExport = () => {
    const data = useBudgetStore.getState()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-app-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        importData(json)
        alert('Data imported successfully!')
      } catch {
        alert('Failed to import data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    clearAllData()
    setIsConfirmingClear(false)
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
    <div className="p-6 pb-24">
      <h1 className="text-2xl font-black mb-6">Settings</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Financial Setup</h2>
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-50 dark:border-gray-700 space-y-4">
             <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Starting Balance</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₱</span>
                   <input
                     type="number"
                     value={initialBalance}
                     onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                     className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 pl-8 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                     placeholder="0.00"
                   />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 ml-1 leading-tight">This is your starting point. All income and expenses will be added to or subtracted from this amount.</p>
             </div>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Appearance</h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-orange-500" />}
              <span className="font-bold text-sm">Dark Mode</span>
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
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Presets</h2>
            <button
              onClick={() => setIsAddingPreset(!isAddingPreset)}
              className="text-blue-600 text-xs font-black flex items-center gap-1 uppercase tracking-tighter"
            >
              <Plus size={14} strokeWidth={3} /> Add Preset
            </button>
          </div>

          <AnimatePresence>
            {isAddingPreset && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddPreset}
                className="mb-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-[2rem] space-y-4 shadow-inner border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setNewPreset({ ...newPreset, type: 'expense' })}
                    className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${
                      newPreset.type === 'expense' ? 'bg-white dark:bg-gray-600 shadow-md text-gray-900 dark:text-white' : 'text-gray-500'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPreset({ ...newPreset, type: 'income' })}
                    className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${
                      newPreset.type === 'income' ? 'bg-white dark:bg-gray-600 shadow-md text-gray-900 dark:text-white' : 'text-gray-500'
                    }`}
                  >
                    Income
                  </button>
                </div>

                <input
                  type="text"
                  value={newPreset.label}
                  onChange={(e) => setNewPreset({ ...newPreset, label: e.target.value })}
                  placeholder="Label (e.g. Food)"
                  className="w-full bg-white dark:bg-gray-700 border-none rounded-2xl p-4 outline-none font-medium shadow-sm"
                />

                <input
                  type="number"
                  value={newPreset.amount}
                  onChange={(e) => setNewPreset({ ...newPreset, amount: e.target.value })}
                  placeholder="Amount"
                  className="w-full bg-white dark:bg-gray-700 border-none rounded-2xl p-4 outline-none font-medium shadow-sm"
                />

                <div className="flex flex-wrap gap-2 justify-center py-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewPreset({ ...newPreset, color: c.value })}
                      className={`w-10 h-10 rounded-full border-4 transition-all active:scale-90 ${
                        newPreset.color === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20">
                    Save
                  </button>
                  <button type="button" onClick={() => setIsAddingPreset(false)} className="px-6 py-4 bg-gray-200 dark:bg-gray-600 rounded-2xl font-black">
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {presets.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8 font-medium border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">No presets added yet.</p>
            ) : (
              presets.map((p) => (
                <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-gray-50 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: p.color }}>
                      {p.type === 'income' ? <Wallet size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div>
                      <p className="font-black text-sm">{p.label}</p>
                      <p className="text-[10px] font-black uppercase tracking-tighter opacity-60" style={{ color: p.color }}>
                        {p.type === 'income' ? '+' : '-'} ₱ {p.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deletePreset(p.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Data Management</h2>
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-50 dark:border-gray-700 space-y-4">
             <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExport}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/30 gap-2 transition-transform active:scale-95"
                >
                  <Download size={20} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase">Export</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-100 dark:border-purple-900/30 gap-2 transition-transform active:scale-95"
                >
                  <Upload size={20} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase">Import</span>
                  <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                </button>
             </div>

             <button
               onClick={() => setIsConfirmingClear(true)}
               className="w-full py-4 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-transform active:scale-95"
             >
               <Trash size={16} strokeWidth={2.5} /> Clear All Data
             </button>
          </div>
        </section>

        <section className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <Info size={24} strokeWidth={3} />
                 <h2 className="text-xl font-black">App Info</h2>
              </div>
              <p className="text-sm font-medium text-blue-100 mb-4 leading-relaxed">
                BudgetApp helps you manage your daily spending by accounting for your monthly dues.
                All data is stored locally on your device.
              </p>
              <div className="bg-white/10 rounded-2xl p-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Version</p>
                 <p className="text-sm font-black">2.0.1</p>
              </div>
           </div>
        </section>
      </div>

      <AnimatePresence>
        {isConfirmingClear && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
            >
              <h2 className="text-xl font-black mb-2 text-red-500">Wait!</h2>
              <p className="text-gray-500 text-sm mb-6 font-medium">This will permanently delete all your transactions, dues, and settings. This action cannot be undone.</p>
              <div className="space-y-3">
                <button
                  onClick={handleClear}
                  className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-500/20"
                >
                  Yes, Clear Everything
                </button>
                <button
                  onClick={() => setIsConfirmingClear(false)}
                  className="w-full py-4 bg-gray-100 dark:bg-gray-700 font-black rounded-2xl"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Settings
