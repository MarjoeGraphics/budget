import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const FABModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen } = useAppStore()

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end justify-center"
          />

          {/* Modal content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl p-6 z-[70] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Item</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-gray-500 dark:text-gray-400">
                This is a placeholder for adding transactions or dues.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    ₱
                  </div>
                  <span className="font-medium text-sm">Transaction</span>
                </button>
                <button className="p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-2xl flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">
                    📅
                  </div>
                  <span className="font-medium text-sm">Monthly Due</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl"
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
