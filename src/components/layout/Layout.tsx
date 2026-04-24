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
    // Force dark mode for v2.0.0 Bespoke Design if requested,
    // but the user's requirement says "Minimalist Dark Glassmorphism. Base: #0A0A0B."
    // and usually these bespoke designs are dark-first.
    document.documentElement.classList.add('dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-[#050505] flex justify-center selection:bg-blue-500/30">
      <div className="w-full max-w-md bg-[#0A0A0B] min-h-screen shadow-2xl relative flex flex-col border-x border-white/5">
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
