import React from 'react'
import { useBudgetStore } from '../../store/useBudgetStore'

const Calendar: React.FC = () => {
  const { dues } = useBudgetStore()

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthName = today.toLocaleString('default', { month: 'long' })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="font-black text-gray-900 dark:text-gray-100">{monthName} {currentYear}</h2>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[10px] font-black text-gray-400 uppercase pb-2">{d}</div>
        ))}

        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map(day => {
          const isToday = day === today.getDate()
          const dayDues = dues.filter(d => d.dayOfMonth === day)
          const allPaid = dayDues.length > 0 && dayDues.every(d => d.isPaid)

          return (
            <div key={day} className="aspect-square flex flex-col items-center justify-center relative">
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all
                ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-700 dark:text-gray-300'}
              `}>
                {day}
              </div>

              <div className="flex gap-0.5 mt-0.5 h-1">
                {dayDues.length > 0 && (
                  <div className={`w-1 h-1 rounded-full ${allPaid ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
