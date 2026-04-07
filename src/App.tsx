import { useState } from 'react'
import { Plus } from 'lucide-react'
import Dashboard from './components/Dashboard'
import MonthlyDues from './components/MonthlyDues'
import Goals from './components/Goals'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import AddTransactionModal from './components/AddTransactionModal'

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'dues' | 'analytics' | 'settings'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 md:pb-0 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-blue-600">💰</span>
            <span className="text-lg font-bold text-slate-800 tracking-tight text-blue-600">BudgetApp</span>
          </div>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl md:rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide transition-colors">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md md:shadow-lg shadow-blue-200/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === 'goals'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md md:shadow-lg shadow-blue-200/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setActiveTab('dues')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === 'dues'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md md:shadow-lg shadow-blue-200/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Monthly Dues
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md md:shadow-lg shadow-blue-200/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md md:shadow-lg shadow-blue-200/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="animate-in fade-in duration-700">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'goals' && <Goals />}
        {activeTab === 'dues' && <MonthlyDues />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40 group"
      >
        <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default App
