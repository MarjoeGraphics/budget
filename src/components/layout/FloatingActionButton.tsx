import React from 'react'
import { Plus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { motion } from 'framer-motion'

const FloatingActionButton: React.FC = () => {
  const { setIsModalOpen } = useAppStore()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsModalOpen(true)}
      className="fixed bottom-24 right-1/2 translate-x-[160px] md:translate-x-[160px] bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center"
      aria-label="Add new"
    >
      <Plus size={28} />
    </motion.button>
  )
}

export default FloatingActionButton
