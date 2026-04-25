import React from 'react'
import { LayoutDashboard, ReceiptText, Settings, PieChart } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BottomNavbar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore()

  const tabs = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'stats', label: 'Stats', icon: PieChart },
    { id: 'dues', label: 'Dues', icon: ReceiptText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0A0A0B]/95 backdrop-blur-md border-t border-white/5 px-8 py-6 flex justify-between items-center z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-2 transition-all duration-300 active:scale-90",
              isActive
                ? "text-white"
                : "text-gray-700 hover:text-gray-500"
            )}
          >
            <div className={cn(
                "p-2 transition-all duration-300",
                isActive ? "shadow-[0_0_15px_rgba(255,255,255,0.05)]" : ""
            )}>
                <Icon size={18} strokeWidth={isActive ? 3 : 2} />
            </div>
            <span className={cn(
                "text-[7px] font-black uppercase tracking-[0.4em] transition-all duration-300",
                isActive ? "opacity-100" : "opacity-0"
            )}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNavbar
