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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 px-6 py-4 flex justify-between items-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 active:scale-90",
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-blue-100/50 dark:bg-blue-900/30 shadow-lg shadow-blue-500/10" : ""
            )}>
                <Icon size={22} strokeWidth={isActive ? 3 : 2} />
            </div>
            <span className={cn(
                "text-[10px] font-black uppercase tracking-widest mt-1",
                isActive ? "opacity-100" : "opacity-0 scale-75"
            )}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNavbar
