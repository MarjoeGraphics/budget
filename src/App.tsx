import { useState } from 'react'
import Dashboard from './components/Dashboard'
import MonthlyDues from './components/MonthlyDues'

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dues'>('dashboard');

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-blue-600">💰</span>
            <span className="text-lg font-bold text-slate-800 tracking-tight text-blue-600">BudgetApp</span>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('dues')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'dues'
                  ? 'bg-white text-blue-600 shadow-lg shadow-blue-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monthly Dues
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="animate-in fade-in duration-700">
        {activeTab === 'dashboard' ? <Dashboard /> : <MonthlyDues />}
      </main>
    </div>
  )
}

export default App
