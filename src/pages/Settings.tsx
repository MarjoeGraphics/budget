import React from 'react'
import { useAppStore } from '../store/useAppStore'
import { Moon, Sun } from 'lucide-react'

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useAppStore()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Appearance</h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  theme === 'dark' ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Currency</h2>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between">
            <span className="font-medium">Default Currency</span>
            <span className="text-gray-500">PHP (₱)</span>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
