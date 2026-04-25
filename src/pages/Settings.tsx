import React, { useState, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useBudgetStore } from '../store/useBudgetStore'
import { Moon, Sun, Plus, Trash2, Download, Upload, Trash, Info } from 'lucide-react'
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
    <div className="p-6 pb-24 max-w-md mx-auto space-y-20">
      <header className="pt-4">
          <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">System Parameters</h1>
          <p className="text-3xl font-mono-currency font-bold tracking-tighter text-gray-200">Settings</p>
      </header>

      <div className="space-y-16">
        <section className="space-y-8">
          <h2 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] border-b border-white/5 pb-4 px-1">Treasury Initialization</h2>
          <div className="space-y-6">
             <div className="px-1">
                <label className="block text-[8px] font-black text-gray-700 uppercase mb-4 tracking-[0.2em]">Start Point Base</label>
                <div className="relative">
                   <span className="absolute left-0 top-1/2 -translate-y-1/2 font-black text-gray-700 text-[10px] tracking-widest">₱</span>
                   <input
                     type="number"
                     value={initialBalance}
                     onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                     className="w-full bg-transparent border-b border-white/5 py-4 pl-8 focus:border-blue-500/50 outline-none font-mono-currency font-bold text-2xl text-white transition-colors"
                     placeholder="0.00"
                   />
                </div>
                <p className="text-[8px] text-gray-700 mt-4 leading-relaxed uppercase tracking-widest">Global offset for all subsequent ledger entries.</p>
             </div>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] border-b border-white/5 pb-4 px-1">Visual Protocol</h2>
          <div className="bg-white/5 rounded-sm p-6 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-4">
              {theme === 'dark' ? <Moon size={16} className="text-blue-500" /> : <Sun size={16} className="text-orange-500" />}
              <span className="font-black text-[9px] uppercase tracking-[0.2em] text-gray-400">Dark Mode Override</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-800'
              }`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                  theme === 'dark' ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 px-1">
            <h2 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">Fast Log Presets</h2>
            <button
              onClick={() => setIsAddingPreset(!isAddingPreset)}
              className="text-blue-500 text-[8px] font-black flex items-center gap-1 uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              <Plus size={12} strokeWidth={4} /> New Protocol
            </button>
          </div>

          <AnimatePresence>
            {isAddingPreset && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddPreset}
                className="mb-8 bg-white/[0.02] p-8 rounded-xl space-y-8 border border-white/5 overflow-hidden shadow-2xl"
              >
                <div className="flex bg-white/5 rounded-sm p-0.5">
                  <button
                    type="button"
                    onClick={() => setNewPreset({ ...newPreset, type: 'expense' })}
                    className={`flex-1 py-3 rounded-sm text-[8px] font-black uppercase tracking-widest transition-all ${
                      newPreset.type === 'expense' ? 'bg-white text-black' : 'text-gray-600'
                    }`}
                  >
                    Debit
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPreset({ ...newPreset, type: 'income' })}
                    className={`flex-1 py-3 rounded-sm text-[8px] font-black uppercase tracking-widest transition-all ${
                      newPreset.type === 'income' ? 'bg-white text-black' : 'text-gray-600'
                    }`}
                  >
                    Credit
                  </button>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        value={newPreset.label}
                        onChange={(e) => setNewPreset({ ...newPreset, label: e.target.value })}
                        placeholder="Label..."
                        className="w-full bg-white/5 border border-white/5 rounded-sm p-4 outline-none font-bold text-sm text-white focus:border-blue-500/30 transition-colors"
                    />

                    <input
                        type="number"
                        value={newPreset.amount}
                        onChange={(e) => setNewPreset({ ...newPreset, amount: e.target.value })}
                        placeholder="Magnitude..."
                        className="w-full bg-white/5 border border-white/5 rounded-sm p-4 outline-none font-mono-currency font-bold text-sm text-white focus:border-blue-500/30 transition-colors"
                    />
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewPreset({ ...newPreset, color: c.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newPreset.color === c.value ? 'border-white scale-110' : 'border-transparent opacity-40'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="flex-1 py-4 bg-white text-black font-black rounded-sm text-[9px] uppercase tracking-[0.3em] shadow-xl">
                    Save Config
                  </button>
                  <button type="button" onClick={() => setIsAddingPreset(false)} className="px-6 py-4 bg-white/5 text-gray-500 rounded-sm font-black text-[9px] uppercase tracking-[0.3em]">
                    Abort
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            {presets.length === 0 ? (
              <p className="text-[8px] text-gray-800 text-center py-12 font-black uppercase tracking-[0.5em]">No active presets</p>
            ) : (
              presets.map((p) => (
                <div key={p.id} className="py-4 px-2 flex items-center justify-between border-b border-white/5 last:border-0 group">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color, opacity: 0.5 }} />
                    <div>
                      <p className="font-bold text-xs text-gray-300 group-hover:text-white transition-colors">{p.label}</p>
                      <p className="text-[8px] font-mono-currency font-bold opacity-40 mt-1" style={{ color: p.color }}>
                        {p.type === 'income' ? '+' : '-'} ₱ {p.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deletePreset(p.id)} className="p-2 text-gray-800 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] border-b border-white/5 pb-4 px-1">Data Management</h2>
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleExport}
                  className="flex flex-col items-center justify-center p-6 bg-white/5 text-gray-400 rounded-sm border border-white/5 gap-3 hover:text-white transition-all active:scale-95"
                >
                  <Download size={16} strokeWidth={3} />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em]">Export</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 bg-white/5 text-gray-400 rounded-sm border border-white/5 gap-3 hover:text-white transition-all active:scale-95"
                >
                  <Upload size={16} strokeWidth={3} />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em]">Import</span>
                  <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                </button>
             </div>

             <button
               onClick={() => setIsConfirmingClear(true)}
               className="w-full py-5 bg-red-500/5 text-red-500 rounded-sm border border-red-500/10 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
             >
               <Trash size={14} strokeWidth={3} /> Wipe Database
             </button>
          </div>
        </section>

        <section className="bg-white/5 rounded-xl p-10 space-y-6 border border-white/5">
              <div className="flex items-center gap-3">
                 <Info size={16} strokeWidth={3} className="text-blue-500" />
                 <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Firmware Info</h2>
              </div>
              <p className="text-[9px] font-medium text-gray-600 leading-relaxed uppercase tracking-widest">
                BudgetApp core 2.0.2-nano. All computations performed locally.
                Zero external telemetry enabled.
              </p>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                 <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-700">Protocol Version</p>
                 <p className="text-[10px] font-mono-currency font-bold text-gray-400">2.0.2</p>
              </div>
        </section>
      </div>

      <AnimatePresence>
        {isConfirmingClear && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0A0B] w-full max-w-sm rounded-xl p-10 border border-red-500/20 shadow-2xl space-y-10"
            >
                <div className="space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-red-500">Critical: Wipe</h2>
                    <p className="text-gray-600 text-[9px] uppercase tracking-widest leading-loose">Destructive action detected. This will purge all ledgers and parameters irreversibly.</p>
                </div>
              <div className="space-y-4">
                <button
                  onClick={handleClear}
                  className="w-full py-5 bg-red-500 text-white font-black rounded-sm uppercase text-[9px] tracking-[0.3em] shadow-2xl"
                >
                  Confirm Purge
                </button>
                <button
                  onClick={() => setIsConfirmingClear(false)}
                  className="w-full py-5 bg-white/5 text-gray-500 font-black rounded-sm uppercase text-[9px] tracking-[0.3em]"
                >
                  Abort
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
