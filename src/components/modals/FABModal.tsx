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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end justify-center"
          />

          {/* Modal content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 w-full max-w-md bg-[#0A0A0B] border-t border-white/10 p-8 z-[70] shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar card-radius rounded-b-none"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.2em]">Add Entry</h2>
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-1">Transaction Ledger</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 glass-recessed btn-radius text-gray-500 transition-transform active:scale-90"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-0.5 glass-recessed btn-radius mb-8">
               <button
                 onClick={() => setActiveTab('quick')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 btn-radius text-[9px] font-black uppercase tracking-widest transition-all ${
                   activeTab === 'quick' ? 'bg-white text-black shadow-md' : 'text-gray-500'
                 }`}
               >
                 <Sparkles size={12} /> Fast Log
               </button>
               <button
                 onClick={() => setActiveTab('manual')}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 btn-radius text-[9px] font-black uppercase tracking-widest transition-all ${
                   activeTab === 'manual' ? 'bg-white text-black shadow-md' : 'text-gray-500'
                 }`}
               >
                 <Edit3 size={12} /> Manual
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
                    <div className="col-span-2 py-12 text-center glass card-radius border-dashed border-white/5">
                      <p className="text-gray-600 font-black text-[9px] uppercase tracking-widest mb-4">No active presets</p>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-blue-400 font-black text-[9px] uppercase tracking-widest underline"
                      >
                        Configure in Settings
                      </button>
                    </div>
                  ) : (
                    presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetTap(preset)}
                        className="glass p-5 card-radius flex flex-col items-center gap-3 transition-all active:scale-[0.98] border-white/5 hover:border-white/10"
                      >
                        <div
                          className="w-10 h-10 btn-radius flex items-center justify-center text-white shadow-lg"
                          style={{ backgroundColor: preset.color, opacity: 0.8 }}
                        >
                          {preset.type === 'income' ? <Wallet size={18} /> : <CreditCard size={18} />}
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-xs text-gray-200 tracking-tight mb-1">{preset.label}</p>
                          <p className="text-[9px] font-mono-currency font-bold opacity-60">
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
                  className="space-y-6 mb-8"
                >
                  <div>
                     <label className="block text-[9px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Descriptor</label>
                     <input
                       type="text"
                       required
                       value={label}
                       onChange={(e) => setLabel(e.target.value)}
                       placeholder="Note..."
                       className="w-full glass-recessed btn-radius p-4 focus:ring-1 focus:ring-blue-500 outline-none font-bold text-sm"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Amount</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-600 text-[10px] tracking-widest">₱</span>
                           <input
                             type="number"
                             required
                             value={amount}
                             onChange={(e) => setAmount(e.target.value)}
                             placeholder="0.00"
                             className="w-full glass-recessed btn-radius p-4 pl-8 focus:ring-1 focus:ring-blue-500 outline-none font-mono-currency font-bold text-sm"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[9px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Category</label>
                        <select
                          value={selectedPresetId}
                          onChange={(e) => setSelectedPresetId(e.target.value)}
                          className="w-full glass-recessed btn-radius p-4 focus:ring-1 focus:ring-blue-500 outline-none font-bold text-xs"
                        >
                          <option value="">UNCATEGORIZED</option>
                          {presets.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.label.toUpperCase()}
                            </option>
                          ))}
                        </select>
                     </div>
                  </div>

                  <div>
                     <label className="block text-[9px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Execution Date</label>
                     <div className="relative">
                        <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                          type="date"
                          required
                          value={date}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full glass-recessed btn-radius p-4 pl-12 focus:ring-1 focus:ring-blue-500 outline-none font-bold text-xs"
                        />
                     </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-white text-black font-black btn-radius shadow-2xl active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-[10px]"
                  >
                    Authorize Entry
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-4 glass-recessed text-gray-500 font-black btn-radius transition-transform active:scale-[0.98] uppercase text-[9px] tracking-[0.4em]"
            >
              Abort
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FABModal
