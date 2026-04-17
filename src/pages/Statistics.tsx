import React, { useMemo } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'

const Statistics: React.FC = () => {
  const { transactions, presets } = useBudgetStore()

  // 1. Filter transactions for the current calendar month
  const currentMonthTxs = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    return transactions.filter(t => t.date >= startOfMonth)
  }, [transactions])

  // 2. Calculate text-based metrics
  const metrics = useMemo(() => {
    const totalIncome = currentMonthTxs
      .filter(t => t.type === 'income' || t.type === 'savings')
      .reduce((acc, t) => acc + t.amount, 0)

    const totalSpent = currentMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    return {
      totalIncome,
      totalSpent,
      netFlow: totalIncome - totalSpent
    }
  }, [currentMonthTxs])

  // 3. Dynamic Expenses Distribution (Pie Chart Data)
  const chartData = useMemo(() => {
    const expenseTxs = currentMonthTxs.filter(t => t.type === 'expense')
    const distribution: Record<string, { value: number, color: string }> = {}

    expenseTxs.forEach(t => {
      // Find matching preset
      const matchingPreset = presets.find(p => p.label === t.label)
      const category = matchingPreset ? t.label : 'Other'
      const color = matchingPreset ? matchingPreset.color : '#94a3b8' // Slate-400 for Other

      if (!distribution[category]) {
        distribution[category] = { value: 0, color }
      }
      distribution[category].value += t.amount
    })

    return Object.entries(distribution).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color
    })).sort((a, b) => b.value - a.value)
  }, [currentMonthTxs, presets])

  const isEmpty = chartData.length === 0

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-black">Statistics</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
        </p>
      </header>

      {/* Text-based Metrics */}
      <section className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-50 dark:border-gray-700 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Income</p>
              <p className="text-2xl font-black text-green-600">₱ {metrics.totalIncome.toLocaleString()}</p>
           </div>
           <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600">
              <ArrowUpRight size={24} strokeWidth={3} />
           </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-50 dark:border-gray-700 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
              <p className="text-2xl font-black text-red-500">₱ {metrics.totalSpent.toLocaleString()}</p>
           </div>
           <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500">
              <ArrowDownRight size={24} strokeWidth={3} />
           </div>
        </div>

        <div className={`p-6 rounded-[2rem] border shadow-sm flex items-center justify-between transition-colors ${
          metrics.netFlow >= 0
            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
            : 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'
        }`}>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Flow</p>
              <p className={`text-2xl font-black ${metrics.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ₱ {metrics.netFlow.toLocaleString()}
              </p>
           </div>
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
             metrics.netFlow >= 0 ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'
           }`}>
              <Activity size={24} strokeWidth={3} />
           </div>
        </div>
      </section>

      {/* Expenses Distribution Pie Chart */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-50 dark:border-gray-700 shadow-sm">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 text-center">Expenses Distribution</h3>

        {isEmpty ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Activity size={48} strokeWidth={1} className="opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">No expenses recorded this month</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '1.5rem',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: 'inherit'
                  }}
                  formatter={(value: number) => [`₱ ${value.toLocaleString()}`, 'Spent']}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter ml-1">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}

export default Statistics
