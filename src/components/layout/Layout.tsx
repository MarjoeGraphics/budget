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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 min-h-screen shadow-xl relative flex flex-col">
        <main className="flex-1 pb-32">
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
