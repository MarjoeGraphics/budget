import React, { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import BottomNavbar from './BottomNavbar'
import FloatingActionButton from './FloatingActionButton'
import FABModal from '../modals/FABModal'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useAppStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-[#050505] dark:bg-[#050505] light:bg-gray-100 flex justify-center selection:bg-blue-500/30">
      <div className="w-full max-w-md bg-[#0A0A0B] dark:bg-[#0A0A0B] light:bg-white min-h-screen shadow-2xl relative flex flex-col border-x border-white/5 dark:border-white/5 light:border-gray-200">
        <main className="flex-1 pb-40">
          {children}
        </main>

        <FloatingActionButton />
        <BottomNavbar />
        <FABModal />
      </div>
    </div>
  )
}

export default Layout
