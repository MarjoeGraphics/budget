import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

const Analytics: React.FC = () => {
  const { transactions, dues, incomes } = useBudget();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // 1. Cumulative Balance Data (Partial Sum Series)
  const cumulativeData = useMemo(() => {
    const data = [];
    let currentTotal = 0; // Starting from 0 now as we use real data
    const daysInMonth = 30;

    for (let day = 1; day <= daysInMonth; day++) {
      const dailyIncome = incomes
        .filter(inc => inc.dayOfMonth === day)
        .reduce((sum, inc) => sum + inc.amount, 0);

      const dailyDues = dues
        .filter(due => due.dayOfMonth === day)
        .reduce((sum, due) => sum + due.amount, 0);

      const dailyTransactions = transactions
        .filter(tx => {
          const txDay = parseInt(tx.date.split('-')[2]);
          return txDay === day;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      currentTotal += dailyIncome - dailyDues + dailyTransactions;

      data.push({
        name: `Day ${day}`,
        balance: Math.round(currentTotal),
      });
    }
    return data;
  }, [transactions, dues, incomes]);

  // 2. Monthly Income vs Spending (Simplified for Demo)
  const comparisonData = [
    { name: 'Jul', income: 6500, spending: 4200 },
    { name: 'Aug', income: 6800, spending: 4500 },
    { name: 'Sep', income: 7000, spending: 5100 },
    { name: 'Oct', income: 7000, spending: 4800 },
  ];

  // 3. Anomaly Detection
  const anomalies = useMemo(() => {
    interface Anomaly {
      type: string;
      title: string;
      detail: string;
      icon: React.ElementType;
      color: string;
      bg: string;
    }
    const list: Anomaly[] = [];
    // Duplicate subscriptions check
    const counts: Record<string, number[]> = {};
    transactions.forEach(tx => {
      const key = `${tx.description}-${Math.abs(tx.amount)}`;
      if (!counts[key]) counts[key] = [];
      counts[key].push(tx.id);
    });

    Object.entries(counts).forEach(([key, ids]) => {
      if (ids.length > 1) {
        const [desc, amount] = key.split('-');
        list.push({
          type: 'duplicate',
          title: `Duplicate Transaction: ${desc}`,
          detail: `Found ${ids.length} identical charges of $${amount}.`,
          icon: Layers,
          color: 'text-amber-600',
          bg: 'bg-amber-50'
        });
      }
    });

    // Unusual spending spikes (> $500)
    transactions.filter(tx => tx.amount < -500).forEach(tx => {
      list.push({
        type: 'spike',
        title: `Spending Spike: ${tx.description}`,
        detail: `Unusual transaction of $${Math.abs(tx.amount).toLocaleString()} detected.`,
        icon: Zap,
        color: 'text-rose-600',
        bg: 'bg-rose-50'
      });
    });

    return list;
  }, [transactions]);

  // 4. Spending Velocity
  const totalDiscretionaryBudget = 2000;
  const today = new Date();
  const daysPassed = today.getDate();
  const discretionarySpent = Math.abs(transactions.filter(tx => tx.amount < 0 && tx.category !== 'Housing' && tx.category !== 'Utilities').reduce((sum, tx) => sum + tx.amount, 0));
  const velocity = daysPassed > 0 ? discretionarySpent / daysPassed : 0;
  const projectedTotal = velocity * 30;
  const isOverBudget = projectedTotal > totalDiscretionaryBudget;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

        {/* Page Header */}
        <header>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={18} className="text-indigo-600" />
            <h2 className="text-indigo-600 text-xs font-black uppercase tracking-widest">Financial Analytics</h2>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Trends & Insights</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm md:text-base">Deep dive into your long-term wealth accumulation and spending patterns.</p>
        </header>

        {/* Top Section: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Cumulative Balance Chart */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Cumulative Balance</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Running Net Worth Total</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                <ArrowUpRight size={14} />
                <span className="text-xs font-black">+12.4%</span>
              </div>
            </div>
            <div className="h-[250px] md:h-[300px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    interval={isMobile ? 12 : 6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    itemStyle={{fontWeight: 800, color: '#1e293b'}}
                    labelStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#64748b', marginBottom: '4px'}}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#2563eb"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Income vs Spending Chart */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Cashflow Comparison</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Income vs. Spending</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                   <span className="text-[10px] font-black text-slate-500 uppercase">Income</span>
                 </div>
                 <div className="flex items-center gap-1.5 ml-4">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-[10px] font-black text-slate-500 uppercase">Spending</span>
                 </div>
              </div>
            </div>
            <div className="h-[250px] md:h-[300px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  />
                  <Bar dataKey="income" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="spending" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

        </div>

        {/* Middle Section: Spending Velocity & Anomalies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-12">

          {/* Spending Velocity Card */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" />
              Monthly Activities Review
            </h3>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spending Velocity</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">${velocity.toFixed(2)}<span className="text-sm text-slate-400 font-bold ml-1">/ day</span></p>
                  </div>
                  <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${isOverBudget ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {isOverBudget ? 'Over Velocity' : 'On Track'}
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((projectedTotal / totalDiscretionaryBudget) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs font-bold text-slate-500 mt-3 leading-relaxed">
                  You are projected to spend <span className={`font-black ${isOverBudget ? 'text-rose-600' : 'text-blue-600'}`}>${projectedTotal.toLocaleString()}</span> this month against your $2,000 discretionary goal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Days in Month</p>
                  <p className="text-xl font-black text-slate-800 mt-1">30</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Days Passed</p>
                  <p className="text-xl font-black text-slate-800 mt-1">{daysPassed}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Anomaly Module */}
          <section className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <AlertTriangle size={120} />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Smart Anomaly Flags</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">AI-Powered Transaction Auditing</p>
                </div>
                <span className="bg-blue-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {anomalies.length} Flagged
                </span>
              </div>

              <div className="space-y-4 flex-grow overflow-y-auto pr-2 scrollbar-hide">
                {anomalies.map((anomaly, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group/item flex items-start gap-4">
                    <div className={`${anomaly.bg} ${anomaly.color} p-3 rounded-xl shadow-lg`}>
                      <anomaly.icon size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-black text-slate-100 tracking-tight text-sm md:text-base truncate md:whitespace-normal">{anomaly.title}</h4>
                      <p className="text-slate-400 text-xs md:text-sm font-medium mt-1 leading-relaxed">
                        {anomaly.detail}
                      </p>
                      <div className="mt-4 flex gap-3">
                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                          Dismiss
                        </button>
                        <button className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                          Report Error
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {anomalies.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-emerald-500/20 text-emerald-500 p-4 rounded-full mb-4">
                      <TrendingUp size={32} />
                    </div>
                    <p className="font-black text-lg">All Clean!</p>
                    <p className="text-slate-400 text-sm mt-1">No unusual spending patterns or duplicates detected.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default Analytics;
