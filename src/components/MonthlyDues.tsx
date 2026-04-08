import React, { useMemo, useState } from 'react';
import {
  Calendar,
  PlusCircle,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldAlert,
  Clock,
  TrendingUp,
  ShieldCheck,
  X,
  Trash2
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { DueItem } from '../types/dues';

const MonthlyDues: React.FC = () => {
  const { dues, incomes, addDue, deleteDue } = useBudget();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDue, setNewDue] = useState<Omit<DueItem, 'id'>>({
    name: '',
    amount: 0,
    dayOfMonth: 1,
    category: 'General',
    isPaid: false
  });

  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const today = new Date().getDate();

  // Cashflow logic: Calculate daily balance projections
  const dailyProjections = useMemo(() => {
    const projections = [];
    let currentBalance = 0; // Starting from 0 now
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

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
  }, [dues, incomes]);

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

  const fixedDuesTotal = useMemo(() => dues.reduce((sum: number, due: DueItem) => sum + due.amount, 0), [dues]);
  const monthlyIncome = useMemo(() => incomes.reduce((sum: number, inc: any) => sum + inc.amount, 0), [incomes]);
  const essentialCoveragePercent = monthlyIncome > 0 ? (fixedDuesTotal / monthlyIncome) * 100 : 0;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

        {/* Page Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-blue-600" />
              <h2 className="text-blue-600 text-xs font-black uppercase tracking-widest">Financial Planning</h2>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{currentMonthName} Dues</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm md:text-base">Manage recurring obligations and predict crunch periods.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 md:py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 hover:-translate-y-0.5 uppercase tracking-widest"
          >
            <PlusCircle size={18} />
            Add New Due
          </button>
        </header>

        {/* Cashflow Calendar / Projections */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 relative overflow-hidden transition-colors">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <span className="bg-blue-50 dark:bg-slate-800 p-2 rounded-xl text-blue-600">🗓️</span>
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

          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">{d}</div>
            ))}
            {/* Calendar Padding (Simulated for this month) */}
            {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="p-3 md:p-4 opacity-0" />
            ))}
            {dailyProjections.map((proj) => (
              <div
                key={proj.day}
                className={`group p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 relative ${
                  proj.day === today
                    ? 'border-blue-500 bg-blue-50/30'
                    : proj.isCrunchDay
                    ? 'bg-rose-50 border-rose-200 shadow-sm ring-1 ring-rose-300/10'
                    : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-tighter ${
                  proj.day === today ? 'text-blue-600' : proj.isCrunchDay ? 'text-rose-500' : 'text-slate-400 group-hover:text-blue-400 transition-colors'
                }`}>
                  {proj.day}
                </span>
                <span className={`block text-xs md:text-sm font-black mt-1 leading-none ${proj.isCrunchDay ? 'text-rose-700' : 'text-slate-800 dark:text-slate-200'}`}>
                  ${Math.round(proj.balance)}
                </span>
                <div className="flex gap-1 mt-2 h-3 overflow-hidden">
                  {proj.income > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Income" />}
                  {proj.expenses > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Due" />}
                </div>
              </div>
            ))}
          </div>

          {crunchPeriod && (
            <div className="mt-8 md:mt-10 p-5 md:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-2xl flex flex-col md:flex-row items-start gap-4 shadow-sm shadow-amber-100 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="bg-amber-400 p-2.5 rounded-xl text-white shadow-lg shadow-amber-200/50">
                <ShieldAlert size={20} />
              </div>
              <div className="flex-1">
                <p className="text-amber-900 font-black text-lg tracking-tight">Crunch Period Ahead</p>
                <p className="text-amber-800/80 text-xs md:text-sm font-medium mt-1 leading-relaxed max-w-2xl">
                  Balance predicted to dip below $500 from Day {crunchPeriod.start} to Day {crunchPeriod.end}.
                  <span className="font-black text-amber-900 ml-1 underline decoration-amber-400 decoration-2">Avoid discretionary spending during this window.</span>
                </p>
              </div>
              <button className="w-full md:w-auto text-amber-600 font-black text-[10px] md:text-xs uppercase tracking-widest bg-white px-4 py-3 md:py-2 rounded-xl shadow-sm hover:shadow-md transition-all">
                Plan Fix
              </button>
            </div>
          )}
        </section>

        {/* Dues Management List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 md:px-8 py-5 md:py-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-slate-50/20 dark:bg-slate-800/20">
              <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <Search size={20} className="text-blue-500" />
                Recurring Dues
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                Fixed Monthly • {dues.length} Active
              </span>
            </div>
            <div className="divide-y divide-slate-50 px-2">
              {dues.length === 0 ? (
                <p className="text-center py-10 text-slate-400 font-bold">No recurring dues</p>
              ) : (
                dues.map((due) => (
                  <div key={due.id} className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all rounded-2xl group cursor-pointer">
                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-base md:text-lg transition-all duration-300 ${
                        due.isPaid ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100 group-hover:scale-110' : 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100 group-hover:scale-110'
                      }`}>
                        {due.dayOfMonth}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 dark:text-white text-base md:text-lg tracking-tight group-hover:text-blue-600 transition-colors">{due.name}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-tighter">{due.category}</p>
                          {due.dayOfMonth > today && !due.isPaid && (
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                              Save ${(due.amount / (due.dayOfMonth - today)).toFixed(2)} / day
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-8 flex-1">
                      <div className="flex-1 max-w-[200px] hidden md:block">
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-1000"
                            style={{ width: `${Math.min((monthlyIncome > 0 ? (due.amount / monthlyIncome) * 100 : 0), 100)}%` }}
                          />
                        </div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Impact: {((due.amount / (monthlyIncome || 1)) * 100).toFixed(1)}% of income</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-black text-slate-800 dark:text-white text-base md:text-lg">${due.amount}</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          {due.isPaid ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Clock size={12} className="text-blue-500" />}
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            due.isPaid ? 'text-emerald-500' : 'text-blue-500'
                          }`}>
                            {due.isPaid ? 'Settled' : 'Upcoming'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteDue(due.id)}
                        className="p-3 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 rounded-2xl text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-slate-50/30">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:border-blue-300 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} />
                Add Custom Fixed Due
              </button>
            </div>
          </section>

          {/* Auto-Detection & Manual Flagging */}
          <aside className="space-y-6">
            <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 text-white/10 group-hover:rotate-12 transition-transform duration-500">
                <TrendingUp size={120} />
              </div>
              <h3 className="text-base md:text-lg font-black mb-2 tracking-tight flex items-center gap-2">
                <Search size={20} className="text-blue-200" />
                Smart Detection
              </h3>
              <p className="text-blue-100/80 text-sm font-medium leading-relaxed relative z-10">
                Detected 2 potential recurring transactions. Map them as fixed 'Dues'?
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

            <section className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm">
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
                  <span className="text-emerald-900 font-black text-sm">${fixedDuesTotal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-emerald-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(essentialCoveragePercent, 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                   <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Essential Coverage</p>
                   <p className="text-[10px] text-emerald-800 font-black">{essentialCoveragePercent.toFixed(1)}% of Income</p>
                </div>
              </div>
            </section>
          </aside>
        </div>

      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 transition-colors"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">New Recurring Due</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                addDue(newDue);
                setIsModalOpen(false);
                setNewDue({ name: '', amount: 0, dayOfMonth: 1, category: 'General', isPaid: false });
              }} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rent, Internet"
                      value={newDue.name}
                      onChange={e => setNewDue({...newDue, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                      <input
                        type="number"
                        required
                        placeholder="1000"
                        value={newDue.amount || ''}
                        onChange={e => setNewDue({...newDue, amount: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Day of Month</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="31"
                        value={newDue.dayOfMonth}
                        onChange={e => setNewDue({...newDue, dayOfMonth: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select
                      value={newDue.category}
                      onChange={e => setNewDue({...newDue, category: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 appearance-none transition-colors"
                    >
                      <option value="Housing">Housing</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Subscription">Subscription</option>
                      <option value="Insurance">Insurance</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                  Add Due
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonthlyDues;
