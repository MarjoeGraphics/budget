import React, { useMemo } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Activity, LayoutGrid, TrendingUp } from 'lucide-react'

const Statistics: React.FC = () => {
  const { transactions, presets } = useBudgetStore()

  // 1. Filter transactions for the current calendar month
  const currentMonthTxs = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    return transactions.filter(t => t.date >= startOfMonth)
  }, [transactions])

  // 2. Trend Data: Cumulative Income vs. Expenses
  const trendData = useMemo(() => {
    const now = new Date()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const data = []

    let cumIncome = 0
    let cumExpense = 0

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day).setHours(0, 0, 0, 0)
      const dayTxs = currentMonthTxs.filter(t => new Date(t.date).setHours(0, 0, 0, 0) === date)

      const dayIncome = dayTxs.filter(t => t.type === 'income' || t.type === 'savings').reduce((acc, t) => acc + t.amount, 0)
      const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)

      cumIncome += dayIncome
      cumExpense += dayExpense

      data.push({
        day,
        income: cumIncome,
        expense: cumExpense,
        net: cumIncome - cumExpense
      })

      // Stop at current day
      if (day === now.getDate()) break
    }
    return data
  }, [currentMonthTxs])

  // 3. Dynamic Expenses Distribution (Pie Chart Data)
  const chartData = useMemo(() => {
    const expenseTxs = currentMonthTxs.filter(t => t.type === 'expense')
    const distribution: Record<string, { value: number, color: string }> = {}

    expenseTxs.forEach(t => {
      const matchingPreset = presets.find(p => p.label.toLowerCase() === t.label.toLowerCase())
      const category = matchingPreset ? matchingPreset.label : 'Other'
      const color = matchingPreset ? matchingPreset.color : '#94a3b8'

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

  const isEmpty = currentMonthTxs.length === 0

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-black">Statistics</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
        </p>
      </header>

      {/* 1. Trend: Cumulative Net Flow */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-50 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-8">
           <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
              <TrendingUp size={16} strokeWidth={3} />
           </div>
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cumulative Trend</h3>
        </div>

        {isEmpty ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Activity size={48} strokeWidth={1} className="opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">No data available yet</p>
          </div>
        ) : (
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  hide
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '1.5rem',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: number) => [`₱ ${value.toLocaleString()}`]}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 2. Distribution: Expenses Pie */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-50 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
           <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
              <LayoutGrid size={16} strokeWidth={3} />
           </div>
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expenses Distribution</h3>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Activity size={48} strokeWidth={1} className="opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">No expenses recorded</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
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
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: number) => [`₱ ${value.toLocaleString()}`, 'Total']}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter ml-1">
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
