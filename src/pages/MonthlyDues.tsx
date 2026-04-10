import React from 'react'

const MonthlyDues: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monthly Dues</h1>
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center text-gray-500 dark:text-gray-400">
          No dues scheduled yet
        </div>
      </div>
    </div>
  )
}

export default MonthlyDues
