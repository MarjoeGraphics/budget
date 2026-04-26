import React, { useMemo } from 'react'
import { useBudgetStore } from '../store/useBudgetStore'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts'
import { Activity, LayoutGrid, TrendingUp } from 'lucide-react'

const Statistics: React.FC = () => {
  const { transactions, presets, dues } = useBudgetStore()

  const currentMonthTxs = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    return transactions.filter(t => t.date >= startOfMonth)
  }, [transactions])

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

      if (day === now.getDate()) break
    }
    return data
  }, [currentMonthTxs])

  const chartData = useMemo(() => {
    const expenseTxs = currentMonthTxs.filter(t => t.type === 'expense')
    const distribution: Record<string, { value: number, color: string }> = {}

    // 1. Process Transactions
    expenseTxs.forEach(t => {
      const matchingPreset = presets.find(p => p.label.toLowerCase() === t.label.toLowerCase())
      const category = matchingPreset ? matchingPreset.label : 'Other'
      const color = matchingPreset ? matchingPreset.color : '#4b5563'

      if (!distribution[category]) {
        distribution[category] = { value: 0, color }
      }
      distribution[category].value += t.amount
    })

    // 2. Sync Resources: Include Unpaid Dues as 'COMMITTED'
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const unpaidDuesTotal = dues
      .filter(d => {
        const dueDate = new Date(d.dueDate)
        return !d.isPaid && dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear
      })
      .reduce((acc, d) => acc + d.amount, 0)

    if (unpaidDuesTotal > 0) {
        distribution['COMMITTED'] = { value: unpaidDuesTotal, color: '#f97316' } // Sunset Orange
    }

    return Object.entries(distribution).map(([name, data]) => ({
      name,
      value: data.value,
      color: data.color
    })).sort((a, b) => b.value - a.value)
  }, [currentMonthTxs, presets, dues])

  const isEmpty = currentMonthTxs.length === 0

  const primaryColor = presets.find(p => p.type === 'income')?.color || '#3b82f6'

  return (
    <div className="p-6 pb-24 max-w-md mx-auto space-y-24">
      <header className="pt-4 px-1">
          <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Resource Diagnostics</h1>
          <p className="text-3xl font-mono-currency font-bold tracking-tighter text-gray-200">Insights</p>
      </header>

      {/* 1. Trend: Cumulative Net Flow */}
      <section className="space-y-12">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 px-1">
           <TrendingUp size={14} strokeWidth={3} className="text-gray-600" />
           <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Capital Flux</h3>
        </div>

        {isEmpty ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-800 space-y-4">
            <Activity size={24} strokeWidth={1} className="opacity-20" />
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">No Flux Detected</p>
          </div>
        ) : (
          <div className="h-64 w-full -ml-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 7, fontWeight: 900, fill: '#374151' }}
                  dy={10}
                />
                <YAxis
                  hide
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0B',
                    borderRadius: '0px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}
                  itemStyle={{ padding: '2px 0', color: '#9ca3af' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                  formatter={(value: number) => [`₱ ${value.toLocaleString()}`]}
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke={primaryColor}
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorPrimary)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 2. Distribution: Allocation Density */}
      <section className="space-y-12">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 px-1">
           <LayoutGrid size={14} strokeWidth={3} className="text-gray-600" />
           <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Allocation Density</h3>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-800 space-y-4">
            <Activity size={24} strokeWidth={1} className="opacity-20" />
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">Null Distribution</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="40%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.7} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0B',
                    borderRadius: '0px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}
                  formatter={(value: number) => [`₱ ${value.toLocaleString()}`, 'Magnitude']}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="square"
                  iconSize={4}
                  formatter={(value) => (
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">
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
