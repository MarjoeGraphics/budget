import React from 'react'
import { Plus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { motion } from 'framer-motion'

const FloatingActionButton: React.FC = () => {
  const { setIsModalOpen } = useAppStore()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsModalOpen(true)}
      className="fixed bottom-28 right-1/2 translate-x-[150px] bg-white text-black p-4 rounded-sm shadow-2xl z-50 flex items-center justify-center border border-white/20"
      aria-label="Add new"
    >
      <Plus size={24} strokeWidth={4} />
    </motion.button>
  )
}

export default FloatingActionButton
