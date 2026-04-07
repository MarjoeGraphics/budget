import React, { useState } from 'react';
import { Plane, ShoppingCart, Shield, Car, CheckCircle, Info, TrendingUp, PiggyBank, Calendar, AlertCircle, PlusCircle, Trash2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GoalType, DeadlineGoal, ReserveGoal, Goal, MonthlyGoal } from '../types/goals';
import { calculateGoalAllocation, calculateGoalPercentage } from '../utils/goalUtils';
import { useBudget } from '../context/BudgetContext';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_MAP: Record<string, LucideIcon> = {
  Plane,
  ShoppingCart,
  Shield,
  Car
};

const TYPE_CONFIG: Record<GoalType, { label: string; icon: LucideIcon; bg: string; text: string }> = {
  someday: { label: 'Someday', icon: PiggyBank, bg: 'bg-indigo-50', text: 'text-indigo-600' },
  monthly: { label: 'Monthly Top-up', icon: Calendar, bg: 'bg-green-50', text: 'text-green-600' },
  deadline: { label: 'Time Bound', icon: TrendingUp, bg: 'bg-blue-50', text: 'text-blue-600' },
  reserve: { label: 'Reserve Floor', icon: AlertCircle, bg: 'bg-amber-50', text: 'text-amber-600' }
};

const Goals: React.FC = () => {
  const { goals, addGoal, deleteGoal } = useBudget();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id'>>({
    title: '',
    target: 0,
    current: 0,
    type: 'someday',
    icon: 'Plane'
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal(newGoal as Goal);
    setIsModalOpen(false);
    setNewGoal({ title: '', target: 0, current: 0, type: 'someday', icon: 'Plane' });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <TrendingUp size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Financial Ambition</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">Financial Goals</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-medium text-sm md:text-base">
            Visualize your progress towards long-term dreams and short-term stability.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 md:py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 hover:-translate-y-0.5 uppercase tracking-widest"
        >
          <PlusCircle size={18} />
          New Goal
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {goals.length === 0 ? (
           <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
             <PiggyBank size={48} className="mb-4 opacity-20" />
             <p className="font-black text-xl">No goals yet</p>
             <p className="font-bold text-sm">Start by adding your first financial ambition!</p>
           </div>
        ) : (
          goals.map((goal) => {
            const Icon = ICON_MAP[goal.icon || ''] || Info;
            const TypeInfo = TYPE_CONFIG[goal.type];
            const allocation = calculateGoalAllocation(goal);
            const percentage = calculateGoalPercentage(goal);

            return (
              <div key={goal.id} className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all group relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-3 md:gap-4 items-center">
                    <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${TypeInfo.bg} ${TypeInfo.text} dark:bg-slate-800 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 dark:text-white text-lg md:text-xl tracking-tight">{goal.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <TypeInfo.icon size={14} className={TypeInfo.text} />
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${TypeInfo.text}`}>
                          {TypeInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {percentage >= 100 && (
                      <div className="bg-green-100 text-green-600 p-2 rounded-full">
                        <CheckCircle size={20} />
                      </div>
                    )}
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Progress</p>
                    <div className="flex flex-wrap items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                        ${goal.current.toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-bold text-xs md:text-sm tracking-tight">
                        / ${goal.target.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl md:text-2xl font-black text-blue-600 tracking-tight">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${
                      percentage >= 100 ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {goal.type === 'reserve' ? 'Top-up Needed' : 'Monthly Allocation'}
                    </p>
                    <p className={`text-lg font-black tracking-tight ${allocation > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                      ${allocation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="text-right">
                    {goal.type === 'deadline' && (
                      <>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Left</p>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight">
                          {(goal as DeadlineGoal).monthsRemaining} Months
                        </p>
                      </>
                    )}
                    {goal.type === 'reserve' && (
                      <>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Floor Limit</p>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight">
                          ${(goal as ReserveGoal).floor.toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                </div>
              </div>
            );
          })
        )}
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
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">New Financial Goal</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Car, Vacation"
                      value={newGoal.title}
                      onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Amount</label>
                      <input
                        type="number"
                        required
                        placeholder="5000"
                        value={newGoal.target || ''}
                        onChange={e => setNewGoal({...newGoal, target: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Savings</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newGoal.current || ''}
                        onChange={e => setNewGoal({...newGoal, current: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal Type</label>
                    <select
                      value={newGoal.type}
                      onChange={e => {
                        const type = e.target.value as GoalType;
                        const base = { ...newGoal, type };
                        if (type === 'deadline') setNewGoal({...base, monthsRemaining: 12} as DeadlineGoal);
                        else if (type === 'reserve') setNewGoal({...base, floor: 1000} as ReserveGoal);
                        else if (type === 'monthly') setNewGoal({...base, monthlyAllocation: 100} as MonthlyGoal);
                        else setNewGoal(base);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 appearance-none transition-colors"
                    >
                      <option value="someday">Someday (Save when possible)</option>
                      <option value="monthly">Monthly Top-up (Fixed monthly)</option>
                      <option value="deadline">Time Bound (By specific date)</option>
                      <option value="reserve">Reserve Floor (Emergency Fund)</option>
                    </select>
                  </div>

                  {newGoal.type === 'deadline' && (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Months Remaining</label>
                      <input
                        type="number"
                        required
                        value={(newGoal as DeadlineGoal).monthsRemaining}
                        onChange={e => setNewGoal({...newGoal, monthsRemaining: Number(e.target.value)} as DeadlineGoal)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 transition-colors"
                      />
                    </div>
                  )}

                  {newGoal.type === 'monthly' && (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Top-up Amount</label>
                      <input
                        type="number"
                        required
                        value={(newGoal as MonthlyGoal).monthlyAllocation}
                        onChange={e => setNewGoal({...newGoal, monthlyAllocation: Number(e.target.value)} as MonthlyGoal)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 transition-colors"
                      />
                    </div>
                  )}

                  {newGoal.type === 'reserve' && (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor Limit (Safety Net)</label>
                      <input
                        type="number"
                        required
                        value={(newGoal as ReserveGoal).floor}
                        onChange={e => setNewGoal({...newGoal, floor: Number(e.target.value)} as ReserveGoal)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-1 transition-colors"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Icon</label>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {Object.keys(ICON_MAP).map(iconName => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setNewGoal({...newGoal, icon: iconName})}
                          className={`p-3 rounded-xl border-2 transition-all ${newGoal.icon === iconName ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-50 text-slate-400'}`}
                        >
                          {React.createElement(ICON_MAP[iconName], { size: 20 })}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                  Create Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;
