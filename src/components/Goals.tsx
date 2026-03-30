import React from 'react';
import { Plane, ShoppingCart, Shield, Car, CheckCircle, Info, TrendingUp, PiggyBank, Calendar, AlertCircle } from 'lucide-react';
import type { GoalType } from '../types/goals';
import { mockGoals } from '../data/goals';
import { calculateGoalAllocation, calculateGoalPercentage } from '../utils/goalUtils';

const ICON_MAP: Record<string, any> = {
  Plane,
  ShoppingCart,
  Shield,
  Car
};

const TYPE_CONFIG: Record<GoalType, { label: string; icon: any; bg: string; text: string }> = {
  someday: { label: 'Someday', icon: PiggyBank, bg: 'bg-indigo-50', text: 'text-indigo-600' },
  monthly: { label: 'Monthly Top-up', icon: Calendar, bg: 'bg-green-50', text: 'text-green-600' },
  deadline: { label: 'Time Bound', icon: TrendingUp, bg: 'bg-blue-50', text: 'text-blue-600' },
  reserve: { label: 'Reserve Floor', icon: AlertCircle, bg: 'bg-amber-50', text: 'text-amber-600' }
};

const Goals: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <TrendingUp size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Financial Ambition</span>
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Financial Goals</h1>
        <p className="text-slate-500 max-w-2xl font-medium">
          Visualize your progress towards long-term dreams and short-term stability.
          Allocation is automatically calculated based on goal types.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {mockGoals.map((goal) => {
          const Icon = ICON_MAP[goal.icon || ''] || Info;
          const TypeInfo = TYPE_CONFIG[goal.type];
          const allocation = calculateGoalAllocation(goal);
          const percentage = calculateGoalPercentage(goal);

          return (
            <div key={goal.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className={`p-4 rounded-2xl ${TypeInfo.bg} ${TypeInfo.text} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">{goal.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TypeInfo.icon size={14} className={TypeInfo.text} />
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${TypeInfo.text}`}>
                        {TypeInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
                {percentage >= 100 && (
                  <div className="bg-green-100 text-green-600 p-2 rounded-full">
                    <CheckCircle size={20} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Progress</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-800 tracking-tighter">
                        ${goal.current.toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-bold text-sm tracking-tight">
                        / ${goal.target.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-600 tracking-tight">
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
                        <p className="text-sm font-black text-slate-700 tracking-tight">
                          {(goal as any).monthsRemaining} Months
                        </p>
                      </>
                    )}
                    {goal.type === 'reserve' && (
                      <>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Floor Limit</p>
                        <p className="text-sm font-black text-slate-700 tracking-tight">
                          ${(goal as any).floor.toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;
