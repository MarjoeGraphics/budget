import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Tab = 'dashboard' | 'dues' | 'settings'
type Theme = 'light' | 'dark'

interface AppState {
  activeTab: Tab
  prevTab: Tab
  theme: Theme
  isModalOpen: boolean
  setActiveTab: (tab: Tab) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setIsModalOpen: (isOpen: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'dashboard',
      prevTab: 'dashboard',
      theme: 'light',
      isModalOpen: false,
      setActiveTab: (tab) => {
        const currentTab = get().activeTab
        if (currentTab !== tab) {
          set({ prevTab: currentTab, activeTab: tab })
        }
      },
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
    }),
    {
      name: 'budget-app-settings',
      partialize: (state) => ({ theme: state.theme, activeTab: state.activeTab }),
    }
  )
)
