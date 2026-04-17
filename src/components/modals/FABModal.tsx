import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, CreditCard, Sparkles, Edit3, Calendar } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useBudgetStore, type Preset } from '../../store/useBudgetStore'

const FABModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen } = useAppStore()
  const { presets, addTransaction } = useBudgetStore()
  const [activeTab, setActiveTab] = useState<'quick' | 'manual'>('quick')

  // Manual Form State
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handlePresetTap = (preset: Preset) => {
    addTransaction({
      label: preset.label,
      amount: preset.amount,
      type: preset.type
    })
    setIsModalOpen(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label || !amount) return

    const selectedPreset = presets.find(p => p.id === selectedPresetId)
    const type = selectedPreset ? selectedPreset.type : 'expense'

    addTransaction({
      label,
      amount: parseFloat(amount),
      type,
      date: new Date(date).getTime()
    })

    // Reset and Close
    setLabel('')
    setAmount('')
    setSelectedPresetId('')
    setDate(new Date().toISOString().split('T')[0])
    setIsModalOpen(false)
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-end justify-center"
          />

          {/* Modal content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 w-full max-w-md bg-white dark:bg-gray-900 rounded-t-[2.5rem] p-8 z-[70] shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black">Add New</h2>
                <p className="text-gray-500 text-sm font-medium">Log your activity</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 transition-transform active:scale-90"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8">
               <button
                 onClick={() => setActiveTab('quick')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   activeTab === 'quick' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'
                 }`}
               >
                 <Sparkles size={14} /> Quick Log
               </button>
               <button
                 onClick={() => setActiveTab('manual')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   activeTab === 'manual' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'
                 }`}
               >
                 <Edit3 size={14} /> Manual
               </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'quick' ? (
                <motion.div
                  key="quick"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="grid grid-cols-2 gap-4 mb-8"
                >
                  {presets.length === 0 ? (
                    <div className="col-span-2 py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                      <p className="text-gray-400 font-medium mb-4 text-xs uppercase tracking-widest">No presets defined</p>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-blue-600 font-black text-xs uppercase underline"
                      >
                        Add in Settings
                      </button>
                    </div>
                  ) : (
                    presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetTap(preset)}
                        className="p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all active:scale-95 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                        style={{ backgroundColor: `${preset.color}15` }}
                      >
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10"
                          style={{ backgroundColor: preset.color }}
                        >
                          {preset.type === 'income' ? <Wallet size={24} /> : <CreditCard size={24} />}
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight mb-1">{preset.label}</p>
                          <p className="text-[10px] font-black opacity-60 uppercase tracking-tighter" style={{ color: preset.color }}>
                            {preset.type === 'income' ? '+' : '-'} ₱ {preset.amount.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.form
                  key="manual"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleManualSubmit}
                  className="space-y-4 mb-8"
                >
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Name / Note</label>
                     <input
                       type="text"
                       required
                       value={label}
                       onChange={(e) => setLabel(e.target.value)}
                       placeholder="What was this for?"
                       className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Amount</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">₱</span>
                           <input
                             type="number"
                             required
                             value={amount}
                             onChange={(e) => setAmount(e.target.value)}
                             placeholder="0.00"
                             className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 pl-8 focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Category</label>
                        <select
                          value={selectedPresetId}
                          onChange={(e) => setSelectedPresetId(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm text-sm"
                        >
                          <option value="">Other (Expense)</option>
                          {presets.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.label} ({p.type === 'income' ? 'Inc' : 'Exp'})
                            </option>
                          ))}
                        </select>
                     </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Date</label>
                     <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          required
                          value={date}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-blue-500 outline-none font-bold shadow-sm text-sm"
                        />
                     </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-blue-600 text-white font-black rounded-[2rem] shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                  >
                    Save Transaction
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl mb-8">
               <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">
                 {activeTab === 'quick'
                   ? 'Tap a preset to immediately update your balance and record a transaction.'
                   : 'Fill in the details to record a manual transaction on a specific date.'}
               </p>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black rounded-2xl shadow-xl transition-transform active:scale-[0.98] uppercase text-[10px] tracking-[0.2em]"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FABModal
