import React, { useState } from 'react';
import { X, Plus, Sparkles, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudget } from '../context/BudgetContext';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, presets } = useBudget();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const handlePreset = (preset: typeof presets[0]) => {
    setDescription(preset.label);
    setAmount(Math.abs(preset.amount).toString());
    setCategory(preset.category);
    setType(preset.amount > 0 ? 'income' : 'expense');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      description,
      amount: type === 'expense' ? -Number(amount) : Number(amount),
      category,
      date: new Date().toISOString().split('T')[0]
    });

    // Reset form
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Add Transaction</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Keep your budget up to date</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide dark:bg-slate-900 transition-colors">
              {/* Presets Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-amber-500" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Quick Presets</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {presets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => handlePreset(preset)}
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group text-left"
                    >
                      <span className="text-2xl mb-2 block group-hover:scale-125 transition-transform origin-left">{preset.icon}</span>
                      <p className="font-black text-slate-800 dark:text-white text-xs truncate">{preset.label}</p>
                      <p className={`text-[10px] font-bold ${preset.amount > 0 ? 'text-emerald-500' : 'text-slate-400'} uppercase`}>
                        {preset.amount > 0 ? '+' : ''}${Math.abs(preset.amount)}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.25rem] gap-1.5">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[0.85rem] text-sm font-black transition-all ${
                      type === 'expense' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <ArrowDownCircle size={18} className={type === 'expense' ? 'text-rose-500' : ''} />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[0.85rem] text-sm font-black transition-all ${
                      type === 'income' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <ArrowUpCircle size={18} className={type === 'income' ? 'text-emerald-500' : ''} />
                    Income
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What was it for?"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-5 px-6 text-lg font-black text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-bold"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">$</div>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-5 pl-12 pr-6 text-3xl font-black text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm font-black text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none"
                    >
                      {['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Income'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm font-black text-slate-500 flex items-center justify-center">
                      Today
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Plus size={24} />
                  Add Transaction
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;
