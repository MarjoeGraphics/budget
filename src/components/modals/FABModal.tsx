import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, CreditCard } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useBudgetStore, type Preset } from '../../store/useBudgetStore'

const FABModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen } = useAppStore()
  const { presets, addTransaction } = useBudgetStore()

  const handlePresetTap = (preset: Preset) => {
    addTransaction({
      label: preset.label,
      amount: preset.amount,
      type: preset.type
    })
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
            className="fixed bottom-0 w-full max-w-md bg-white dark:bg-gray-900 rounded-t-[2.5rem] p-8 z-[70] shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black">Quick Add</h2>
                <p className="text-gray-500 text-sm font-medium">Select a preset to log</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 transition-transform active:scale-90"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {presets.length === 0 ? (
                <div className="col-span-2 py-12 text-center">
                  <p className="text-gray-400 font-medium mb-4">No presets defined</p>
                  <button
                    onClick={() => {
                      setIsModalOpen(false)
                      // Ideally navigate to settings here, but for now just close
                    }}
                    className="text-blue-600 font-bold"
                  >
                    Configure in Settings
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
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl mb-8">
               <p className="text-center text-xs text-gray-400 font-medium">
                 Tap a preset to immediately update your balance and record a transaction.
               </p>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black rounded-2xl shadow-xl transition-transform active:scale-[0.98]"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FABModal
