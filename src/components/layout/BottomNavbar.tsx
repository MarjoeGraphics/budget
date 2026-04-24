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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0A0A0B]/80 backdrop-blur-xl border-t border-white/10 px-8 py-5 flex justify-between items-center z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-90",
              isActive
                ? "text-blue-400"
                : "text-gray-600 hover:text-gray-400"
            )}
          >
            <div className={cn(
                "p-2.5 rounded-sm transition-all duration-300",
                isActive ? "bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] border border-blue-500/20" : "border border-transparent"
            )}>
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
            </div>
            <span className={cn(
                "text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
            )}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNavbar
