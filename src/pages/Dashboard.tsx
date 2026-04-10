import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6">
        <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
        <h2 className="text-4xl font-bold">₱ 12,500.00</h2>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Recent Transactions</h3>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Transaction {i + 1}</p>
              <p className="text-xs text-gray-500">April {10 - (i % 10)}, 2025</p>
            </div>
            <p className="font-bold text-red-500">- ₱ 50.00</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
