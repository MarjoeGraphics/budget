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
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { calculateTotalGoalAllocations } from '../utils/goalUtils';
import { useBudget } from '../context/BudgetContext';

const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const end = value;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(Math.floor(easeProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, shouldReduceMotion]);

  return <>{displayValue.toLocaleString()}</>;
};

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div
      className="relative flex-1 min-w-[100px]"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold rounded-lg shadow-xl z-50 w-48 text-center pointer-events-none border border-slate-700/50"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { transactions, goals, dues, settings } = useBudget();

  // Derived metrics from centralized data
  const projectedMonthlyIncome = useMemo(() => {
    return settings.monthlyRate || 0;
  }, [settings.monthlyRate]);

  // Actual income received this month (from transactions)
  const actualIncomeReceived = useMemo(() => {
    return transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Total Income to use for calculations (Projected)
  const income = projectedMonthlyIncome;

  const fixedDuesTotal = useMemo(() => dues.reduce((sum, due) => sum + due.amount, 0), [dues]);
  const duesPaidTotal = useMemo(() => dues.filter(due => due.isPaid).reduce((sum, due) => sum + due.amount, 0), [dues]);
  const duesLeft = fixedDuesTotal - duesPaidTotal;

  const goalAllocations = useMemo(() => calculateTotalGoalAllocations(goals), [goals]);
  const safetyBuffer = 500;

  const discretionaryExpenses = useMemo(() =>
    Math.abs(transactions.filter(t => t.amount < 0 && t.category !== 'Bills/Dues').reduce((sum, t) => sum + t.amount, 0)),
  [transactions]);

  // Total Expenses (everything going out)
  const totalExpenses = useMemo(() =>
    Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
  [transactions]);

  // S = I - (F + G + B) - DiscretionaryExpenses
  // Fixed Dues and Goal Allocations are reserved.
  // Safe to Spend is what remains from the income after reservations AND what you've already spent discretionarily.
  const safeToSpend = income - (fixedDuesTotal + goalAllocations + safetyBuffer) - discretionaryExpenses;

  // Net Saving is Income - Total Outflow
  const netSaving = actualIncomeReceived - totalExpenses;

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

  const shouldReduceMotion = useReducedMotion();

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const glassStyle = "bg-card/70 dark:bg-card/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[20px]";

  return (
    <div className="p-4 md:p-6 min-h-screen bg-background/50 dark:bg-background/50 transition-colors duration-500">
      <motion.div
        layout
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 grid-rows-auto gap-4 md:gap-6"
      >

        {/* Safe to Spend - Large Hero Card (Inverted Pyramid Top) */}
        <motion.section
          layout
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className={`col-span-1 md:col-span-4 lg:col-span-4 row-span-2 relative overflow-hidden group bg-gradient-to-br from-blue-600/90 to-indigo-700/90 rounded-[20px] p-6 md:p-8 text-white shadow-2xl shadow-blue-500/20 border border-white/20`}
        >
          {/* Shimmer Effect */}
          {!shouldReduceMotion && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
              />
            </div>
          )}

          <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>

          <header className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={16} className="text-blue-200" />
                <h2 className="text-blue-100 text-xs font-black uppercase tracking-widest">Safe to Spend</h2>
              </div>
              <div className="flex flex-col mt-4">
                <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                  <span className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-sm">
                    $<CountUp value={safeToSpend} />
                  </span>
                  <span className="text-blue-100/80 font-bold italic text-sm md:text-lg mb-1 md:mb-2 whitespace-nowrap">available now</span>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12 flex flex-wrap gap-2 md:gap-4">
              {[
                { label: 'Income', val: income, sign: '+', tip: 'Your total expected earnings this month including base rate and extra income.' },
                { label: 'Dues', val: fixedDuesTotal, sign: '-', tip: 'Recurring fixed costs like rent and bills that must be covered.' },
                { label: 'Goals', val: goalAllocations, sign: '-', tip: 'Monthly contributions set aside for your financial ambitions and savings.' },
                { label: 'Buffer', val: safetyBuffer, sign: '-', tip: 'A safety net for unexpected small expenses to keep your budget on track.' }
              ].map((item, i) => (
                <Tooltip key={i} text={item.tip}>
                  <div className="w-full bg-white/10 backdrop-blur-xl px-3 md:px-5 py-2 md:py-3 rounded-2xl flex flex-col gap-0 md:gap-1 border border-white/10 hover:bg-white/20 transition-colors h-full">
                    <span className="text-blue-200 text-[8px] md:text-[10px] uppercase font-black tracking-widest">{item.label}</span>
                    <span className="font-black text-sm md:text-lg">{item.sign}${item.val.toLocaleString()}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </header>
        </motion.section>

        {/* Summary Cards - Grid Integration */}
        {[
          { label: 'Projected Income', value: income, color: 'text-income', icon: ArrowUpCircle, bg: 'bg-income/10' },
          { label: 'Discretionary', value: discretionaryExpenses, color: 'text-foreground/70', icon: ArrowDownCircle, bg: 'bg-slate-500/10' },
          { label: 'Dues Left', value: duesLeft, color: 'text-due', icon: Target, bg: 'bg-due/10' },
          { label: 'Current Savings', value: netSaving, color: netSaving >= 0 ? 'text-income' : 'text-due', icon: TrendingUp, bg: netSaving >= 0 ? 'bg-income/10' : 'bg-due/10' }
        ].map((card, idx) => (
          <motion.div
            layout
            key={idx}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 * (idx + 1) }}
            className={`col-span-1 md:col-span-2 lg:col-span-2 p-6 flex flex-col justify-center gap-2 group cursor-default ${glassStyle}`}
          >
            <div className="flex justify-between items-center">
              <div className={`${card.bg} p-2 rounded-xl transition-transform group-hover:scale-110 duration-500`}>
                <card.icon size={20} className={card.color} />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
            </div>
            <p className={`text-3xl font-black mt-2 tracking-tight ${card.color}`}>
              ${card.value.toLocaleString()}
            </p>
          </motion.div>
        ))}

        {/* Recent Activity - Bento Main Content */}
        <motion.section
          layout
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className={`col-span-1 md:col-span-4 lg:col-span-4 p-6 md:p-8 relative overflow-hidden ${glassStyle}`}
        >
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Wallet size={20} className="text-blue-500" />
              Recent Activity
            </h3>
            <button className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-center py-10 text-slate-400 font-bold">No recent activity</p>
            ) : (
              transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="group py-4 flex justify-between items-center border-b border-slate-100/50 dark:border-slate-800/50 last:border-0 hover:bg-white/40 dark:hover:bg-slate-800/40 px-3 -mx-3 rounded-2xl transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                      tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    }`}>
                      {tx.description[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{tx.description}</p>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{tx.date} • {tx.category}</p>
                    </div>
                  </div>
                  <span className={`font-black text-xl tracking-tight ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* Tips & Smart Analysis - Side Bento Items */}
        <motion.aside
          layout
          className="col-span-1 md:col-span-4 lg:col-span-2 space-y-6"
        >
          <motion.section
            layout
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-income to-emerald-600 text-white rounded-[20px] shadow-xl shadow-emerald-500/10`}
          >
            <div className="absolute -right-6 -bottom-6 text-white/10 rotate-12">
              <Lightbulb size={160} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Lightbulb size={20} className="text-white" />
                </div>
                <h3 className="font-black tracking-tight text-lg">Smart Insights</h3>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTipIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="min-h-[100px] flex items-center"
                >
                  <p className="text-white font-bold leading-relaxed italic">
                    "{tips[currentTipIndex]}"
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-2 mt-6">
                {tips.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTipIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentTipIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                  ></button>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            layout
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`p-6 md:p-8 ${glassStyle}`}
          >
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h3 className="text-slate-800 dark:text-white font-black text-xs uppercase tracking-widest">Efficiency Status</h3>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Essentials', current: 45, color: 'bg-due', track: 'bg-due/10', text: 'text-due' },
                { label: 'Long-term Goals', current: 20, color: 'bg-goal', track: 'bg-goal/10', text: 'text-goal' }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] mb-2">
                    <span className={`${stat.text} font-black uppercase tracking-widest`}>{stat.label}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black">{stat.current}%</span>
                  </div>
                  <div className={`w-full ${stat.track} rounded-full h-3 overflow-hidden border border-white/10 dark:border-slate-800`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.current}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className={`${stat.color} h-full rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </motion.aside>

      </motion.div>
    </div>
  );
};

export default Dashboard;
