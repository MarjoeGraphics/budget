import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  Target
} from 'lucide-react';
import { mockGoals } from '../data/goals';
import { calculateTotalGoalAllocations } from '../utils/goalUtils';
import { mockDues, mockIncomes } from '../data/dues';
import { mockTransactions } from '../data/transactions';

const Dashboard: React.FC = () => {
  // Derived metrics from centralized data
  const income = useMemo(() => mockIncomes.reduce((sum, inc) => sum + inc.amount, 0), []);
  const fixedDuesTotal = useMemo(() => mockDues.reduce((sum, due) => sum + due.amount, 0), []);
  const duesPaidTotal = useMemo(() => mockDues.filter(due => due.isPaid).reduce((sum, due) => sum + due.amount, 0), []);
  const duesLeft = fixedDuesTotal - duesPaidTotal;

  const goalAllocations = useMemo(() => calculateTotalGoalAllocations(mockGoals), []);
  const safetyBuffer = 500;

  const expenses = useMemo(() =>
    Math.abs(mockTransactions.filter(t => t.amount < 0 && t.category !== 'Housing').reduce((sum, t) => sum + t.amount, 0)),
  []);

  // S = I - (F + G + B)
  const safeToSpend = income - (fixedDuesTotal + goalAllocations + safetyBuffer);
  const netSaving = income - expenses - fixedDuesTotal;

  const tips = [
    "50/30/20 Rule: Allocate 50% to needs, 30% to wants, and 20% to savings.",
    "Try to keep your 'wants' spending under $1,500 this month.",
    "Your savings rate is currently 20%. Great job!",
    "Consider moving $200 from your 'wants' to your 'emergency fund'.",
    "Needs (50%): Aim to spend no more than $2,500 on essentials.",
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Section: Safe to Spend (Priority KPI) - Inverted Pyramid Top */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <header className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-blue-200" />
              <h2 className="text-blue-100 text-xs font-bold uppercase tracking-widest">Safe to Spend</h2>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-6xl font-black tracking-tighter">${safeToSpend.toLocaleString()}</span>
              <span className="text-blue-100/80 font-medium italic text-lg">available now</span>
            </div>
          </header>
          <div className="mt-8 flex flex-wrap gap-3 relative z-10">
            <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
              <span className="text-blue-200 text-xs uppercase font-bold">Income:</span>
              <span className="font-bold text-sm">${income.toLocaleString()}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
              <span className="text-blue-200 text-xs uppercase font-bold">Goals:</span>
              <span className="font-bold text-sm">-${goalAllocations.toLocaleString()}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
              <span className="text-blue-200 text-xs uppercase font-bold">Buffer:</span>
              <span className="font-bold text-sm">-${safetyBuffer.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Middle Section: Summary Cards - Inverted Pyramid Middle */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Monthly Income', value: income, color: 'text-emerald-600', icon: ArrowUpCircle, bg: 'bg-emerald-50' },
            { label: 'Expenses', value: expenses, color: 'text-slate-800', icon: ArrowDownCircle, bg: 'bg-slate-50' },
            { label: 'Dues Left', value: duesLeft, color: 'text-indigo-600', icon: Target, bg: 'bg-indigo-50' },
            { label: 'Net Saving', value: netSaving, color: netSaving >= 0 ? 'text-emerald-600' : 'text-rose-600', icon: TrendingUp, bg: netSaving >= 0 ? 'bg-emerald-50' : 'bg-rose-50' }
          ].map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`${card.bg} p-2.5 rounded-2xl`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.label}</p>
              <p className={`text-2xl font-black mt-1 ${card.color}`}>${card.value.toLocaleString()}</p>
            </div>
          ))}
        </section>

        {/* Bottom Section: Activities & Tips - Inverted Pyramid Base */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Wallet size={20} className="text-blue-500" />
                Recent Activity
              </h3>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-1">
              {mockTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="group py-4 flex justify-between items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 -mx-2 rounded-2xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg ${
                      tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {tx.description[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{tx.description}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{tx.date} • {tx.category}</p>
                    </div>
                  </div>
                  <span className={`font-black text-lg ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Tips Section */}
          <aside className="space-y-6">
            <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 text-emerald-100/50 rotate-12">
                <Lightbulb size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-emerald-500 p-2 rounded-xl text-white">
                    <Lightbulb size={18} />
                  </div>
                  <h3 className="text-emerald-900 font-black tracking-tight">Smart Tips</h3>
                </div>
                <div className="min-h-[100px] flex items-center">
                  <p className="text-emerald-800 font-medium italic leading-relaxed text-sm">
                    "{tips[currentTipIndex]}"
                  </p>
                </div>
                <div className="flex gap-1.5 mt-4">
                  {tips.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentTipIndex ? 'w-6 bg-emerald-500' : 'w-1.5 bg-emerald-200'}`}></div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest">50/30/20 Status</h3>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Needs (50%)', current: 45, color: 'bg-blue-500', barBg: 'bg-blue-100', text: 'text-blue-600' },
                  { label: 'Savings (20%)', current: 20, color: 'bg-emerald-500', barBg: 'bg-emerald-100', text: 'text-emerald-600' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className={`${stat.text} font-black uppercase tracking-widest`}>{stat.label}</span>
                      <span className="text-slate-800 font-black">{stat.current}%</span>
                    </div>
                    <div className={`w-full ${stat.barBg} rounded-full h-2.5 overflow-hidden`}>
                      <div className={`${stat.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${stat.current}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
