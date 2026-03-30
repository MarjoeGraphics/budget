import React, { useMemo } from 'react';
import {
  Calendar,
  PlusCircle,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldAlert,
  Settings,
  Clock,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface DueItem {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  category: string;
  isPaid: boolean;
}

interface IncomeEvent {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
}

const MonthlyDues: React.FC = () => {
  // Mock data for dues and income
  const initialBalance = 400; // Starting with a lower balance to demonstrate crunch days

  const dues: DueItem[] = [
    { id: '1', name: 'Rent', amount: 1200, dayOfMonth: 1, category: 'Housing', isPaid: true },
    { id: '2', name: 'Internet', amount: 60, dayOfMonth: 5, category: 'Utilities', isPaid: true },
    { id: '7', name: 'Emergency Repair', amount: 1200, dayOfMonth: 10, category: 'Unexpected', isPaid: false },
    { id: '3', name: 'Electricity', amount: 85, dayOfMonth: 12, category: 'Utilities', isPaid: false },
    { id: '4', name: 'Gym Membership', amount: 45, dayOfMonth: 15, category: 'Fitness', isPaid: false },
    { id: '5', name: 'Netflix', amount: 15, dayOfMonth: 20, category: 'Entertainment', isPaid: false },
    { id: '6', name: 'Car Insurance', amount: 110, dayOfMonth: 25, category: 'Auto', isPaid: false },
  ];

  const incomes: IncomeEvent[] = [
    { id: 'inc1', name: 'Primary Salary', amount: 2500, dayOfMonth: 1 },
    { id: 'inc2', name: 'Secondary Salary', amount: 2500, dayOfMonth: 28 },
  ];

  // Cashflow logic: Calculate daily balance projections
  const dailyProjections = useMemo(() => {
    const projections = [];
    let currentBalance = initialBalance;
    const daysInMonth = 30;

    for (let day = 1; day <= daysInMonth; day++) {
      const dailyIncome = incomes
        .filter(inc => inc.dayOfMonth === day)
        .reduce((sum, inc) => sum + inc.amount, 0);

      const dailyDues = dues
        .filter(due => due.dayOfMonth === day)
        .reduce((sum, due) => sum + due.amount, 0);

      currentBalance += dailyIncome - dailyDues;

      projections.push({
        day,
        balance: currentBalance,
        isCrunchDay: currentBalance < 500,
        income: dailyIncome,
        expenses: dailyDues
      });
    }
    return projections;
  }, [initialBalance, dues, incomes]);

  const crunchPeriod = useMemo(() => {
    const start = dailyProjections.findIndex(p => p.isCrunchDay);
    if (start === -1) return null;
    let end = start;
    for (let i = start; i < dailyProjections.length; i++) {
      if (dailyProjections[i].isCrunchDay) end = i;
      else if (end !== start) break;
    }
    return { start: start + 1, end: end + 1 };
  }, [dailyProjections]);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-blue-600" />
              <h2 className="text-blue-600 text-xs font-black uppercase tracking-widest">Financial Planning</h2>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Monthly Dues</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage recurring obligations and predict crunch periods.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-200/50 flex items-center gap-2 hover:-translate-y-0.5 uppercase tracking-widest">
            <PlusCircle size={18} />
            Add New Due
          </button>
        </header>

        {/* Cashflow Calendar / Projections */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span className="bg-blue-50 p-2 rounded-xl text-blue-600">🗓️</span>
              Payday Cashflow Calendar
            </h2>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-3 h-3 bg-white border-2 border-slate-100 rounded-lg"></span>
                Safe Range
              </div>
              <div className="flex items-center gap-2 text-rose-500">
                <span className="w-3 h-3 bg-rose-50 border-2 border-rose-200 rounded-lg shadow-sm shadow-rose-100"></span>
                Crunch Day (&lt;$500)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4">
            {dailyProjections.map((proj) => (
              <div
                key={proj.day}
                className={`group p-4 rounded-2xl border-2 transition-all duration-300 relative ${
                  proj.isCrunchDay
                    ? 'bg-rose-50 border-rose-200 shadow-sm ring-1 ring-rose-300/10'
                    : 'bg-white border-slate-50 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-tighter ${proj.isCrunchDay ? 'text-rose-500' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}`}>
                  Day {proj.day}
                </span>
                <span className={`block text-lg font-black mt-2 leading-none ${proj.isCrunchDay ? 'text-rose-700' : 'text-slate-800'}`}>
                  ${Math.round(proj.balance)}
                </span>
                <div className="flex gap-1 mt-3 h-4">
                  {proj.income > 0 && (
                    <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-lg flex items-center shadow-sm shadow-emerald-100">
                      IN
                    </span>
                  )}
                  {proj.expenses > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[8px] font-black rounded-lg flex items-center shadow-sm shadow-blue-100">
                      OUT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {crunchPeriod && (
            <div className="mt-10 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-2xl flex items-start gap-4 shadow-sm shadow-amber-100 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="bg-amber-400 p-2.5 rounded-xl text-white shadow-lg shadow-amber-200/50">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-amber-900 font-black text-lg tracking-tight">Crunch Period Ahead</p>
                <p className="text-amber-800/80 text-sm font-medium mt-1 leading-relaxed max-w-2xl">
                  Balance predicted to dip below $500 from Day {crunchPeriod.start} to Day {crunchPeriod.end}.
                  <span className="font-black text-amber-900 ml-1 underline decoration-amber-400 decoration-2">Avoid discretionary spending during this window.</span>
                </p>
              </div>
              <button className="ml-auto text-amber-600 font-black text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all">
                Plan Fix
              </button>
            </div>
          )}
        </section>

        {/* Dues Management List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Search size={20} className="text-blue-500" />
                Recurring Dues
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                Fixed Monthly • {dues.length} Active
              </span>
            </div>
            <div className="divide-y divide-slate-50 px-2">
              {dues.map((due) => (
                <div key={due.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all rounded-2xl group cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 ${
                      due.isPaid ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100 group-hover:scale-110' : 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100 group-hover:scale-110'
                    }`}>
                      {due.dayOfMonth}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg tracking-tight group-hover:text-blue-600 transition-colors">{due.name}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{due.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <p className="font-black text-slate-800 text-lg">${due.amount}</p>
                      <div className="flex items-center gap-1.5 justify-end">
                        {due.isPaid ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Clock size={12} className="text-blue-500" />}
                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                          due.isPaid ? 'text-emerald-500' : 'text-blue-500'
                        }`}>
                          {due.isPaid ? 'Settled' : 'Upcoming'}
                        </p>
                      </div>
                    </div>
                    <button className="p-3 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 rounded-2xl text-slate-300 hover:text-blue-600 transition-all">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50/30">
              <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:border-blue-300 hover:text-blue-400 transition-all flex items-center justify-center gap-2">
                <PlusCircle size={16} />
                Add Custom Fixed Due
              </button>
            </div>
          </section>

          {/* Auto-Detection & Manual Flagging */}
          <aside className="space-y-6">
            <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:rotate-12 transition-transform duration-500">
                <TrendingUp size={120} />
              </div>
              <h3 className="text-lg font-black mb-2 tracking-tight flex items-center gap-2">
                <Search size={20} className="text-blue-200" />
                Smart Detection
              </h3>
              <p className="text-blue-100/80 text-sm font-medium leading-relaxed relative z-10">
                Detected 3 potential recurring transactions. Map them as fixed 'Dues'?
              </p>
              <div className="mt-6 space-y-3 relative z-10">
                {[
                  { name: 'Cloud Storage', amount: 9.99 },
                  { name: 'Monthly Transit Pass', amount: 80 }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group/item">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-[10px] font-medium text-blue-200 uppercase">${item.amount} / mo</p>
                    </div>
                    <button className="bg-white text-blue-600 px-3 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all">
                      Flag
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-4 rounded-2xl border border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                Full Report
                <ArrowRight size={14} />
              </button>
            </section>

            <section className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-emerald-900 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                Budget Safety
              </h3>
              <p className="text-emerald-800/80 text-xs font-medium leading-relaxed mb-6">
                'Dues' are automatically subtracted from your <span className="font-black text-emerald-900">Safe to Spend</span> pool to ensure essentials are covered.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black">
                  <span className="text-emerald-800/60 uppercase tracking-widest">Fixed Dues Total:</span>
                  <span className="text-emerald-900 font-black text-sm">$1,515</span>
                </div>
                <div className="w-full bg-emerald-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: '30.3%' }}></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                   <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Essential Coverage</p>
                   <p className="text-[10px] text-emerald-800 font-black">30.3% of Income</p>
                </div>
              </div>
            </section>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default MonthlyDues;
