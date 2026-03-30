import React, { useState, useEffect } from 'react';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
}

const Dashboard: React.FC = () => {
  // Mock data for calculation
  const income = 5000;
  const fixedDues = 1500;
  const goalAllocations = 1000;
  const safetyBuffer = 500;
  const expenses = 1200;

  // S = I - (F + G + B)
  const safeToSpend = income - (fixedDues + goalAllocations + safetyBuffer);
  const duesLeft = fixedDues - 1200; // Mocked remaining dues
  const netSaving = income - expenses - fixedDues;

  const recentTransactions: Transaction[] = [
    { id: 1, description: 'Grocery Store', amount: -85.50, date: '2023-10-25', category: 'Food' },
    { id: 2, description: 'Salary', amount: 5000.00, date: '2023-10-01', category: 'Income' },
    { id: 3, description: 'Rent', amount: -1200.00, date: '2023-10-02', category: 'Housing' },
    { id: 4, description: 'Internet Bill', amount: -60.00, date: '2023-10-05', category: 'Utilities' },
    { id: 5, description: 'Coffee Shop', amount: -5.75, date: '2023-10-26', category: 'Food' },
  ];

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
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Section: Safe to Spend (Priority KPI) */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-3xl p-8 text-white shadow-xl shadow-blue-200/50">
          <header>
            <h2 className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Safe to Spend</h2>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-bold">${safeToSpend.toLocaleString()}</span>
              <span className="text-blue-200">remaining this month</span>
            </div>
          </header>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-blue-100">
            <div className="bg-white/10 px-3 py-1 rounded-full flex gap-2">
              <span className="opacity-70">Income:</span>
              <span className="font-medium">${income.toLocaleString()}</span>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-full flex gap-2">
              <span className="opacity-70">Buffer:</span>
              <span className="font-medium">-${safetyBuffer.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Middle Section: Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-sm font-medium">Monthly Income</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">${income.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-sm font-medium">Expenses</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">${expenses.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-sm font-medium">Dues Left</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">${duesLeft.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-sm font-medium">Net Saving</p>
            <p className={`text-2xl font-bold mt-1 ${netSaving >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ${netSaving.toLocaleString()}
            </p>
          </div>
        </section>

        {/* Bottom Section: Activities & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="divide-y divide-slate-50">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-700">{tx.description}</p>
                    <p className="text-xs text-slate-400">{tx.date} • {tx.category}</p>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all transactions
            </button>
          </section>

          {/* Tips Section */}
          <aside className="space-y-6">
            <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-600 text-xl">💡</span>
                <h3 className="text-emerald-800 font-bold">Smart Tips</h3>
              </div>
              <div className="min-h-[80px] flex items-center">
                <p className="text-emerald-700 text-sm italic leading-relaxed animate-in fade-in duration-700">
                  "{tips[currentTipIndex]}"
                </p>
              </div>
            </section>

            <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h3 className="text-blue-800 font-bold mb-2 text-sm">50/30/20 Status</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-blue-600 font-medium">Needs (50%)</span>
                    <span className="text-blue-800 font-bold">45%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-600 font-medium">Savings (20%)</span>
                    <span className="text-emerald-800 font-bold">20%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-1.5">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
