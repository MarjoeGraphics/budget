import React, { useMemo } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts'
import { Activity, LayoutGrid, TrendingUp } from 'lucide-react'

const Statistics: React.FC = () => {
  const { transactions, presets } = useBudgetStore()

  // Filter transactions for the current calendar month
  const currentMonthTxs = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    return transactions.filter(t => t.date >= startOfMonth)
  }, [transactions])

  // Trend Data: Cumulative Income vs. Expenses
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

  // Dynamic Expenses Distribution (Pie Chart Data)
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
    <div className="p-6 space-y-8 max-w-md mx-auto">
      <header>
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">Insights</h1>
          <p className="text-[10px] font-medium text-gray-600 uppercase tracking-widest mt-1">Flow & Distribution</p>
      </header>

      {/* 1. Trend: Cumulative Net Flow */}
      <section className="glass p-8 card-radius shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 glass-recessed btn-radius text-blue-400">
              <TrendingUp size={14} strokeWidth={3} />
           </div>
           <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Net Flow Strategy</h3>
        </div>

        {isEmpty ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-700 space-y-4">
            <Activity size={32} strokeWidth={1} className="opacity-20" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em]">No data logs detected</p>
          </div>
        ) : (
          <div className="h-64 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 8, fontWeight: 900, fill: '#4b5563' }}
                  dy={10}
                />
                <YAxis
                  hide
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0B',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                  formatter={(value: number) => [`₱ ${value.toLocaleString()}`]}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 2. Distribution: Expenses Pie */}
      <section className="glass p-8 card-radius">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 glass-recessed btn-radius text-gray-400">
              <LayoutGrid size={14} strokeWidth={3} />
           </div>
           <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Allocation Density</h3>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-700 space-y-4">
            <Activity size={32} strokeWidth={1} className="opacity-20" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em]">No allocations recorded</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0B',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}
                  formatter={(value: number) => [`₱ ${value.toLocaleString()}`, 'Value']}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={6}
                  formatter={(value) => (
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">
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
