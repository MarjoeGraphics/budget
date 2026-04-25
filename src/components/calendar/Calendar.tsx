import React from 'react'
import { useBudgetStore } from '../../store/useBudgetStore'
import { getDate, getMonth, getYear } from 'date-fns'

const Calendar: React.FC = () => {
  const { dues } = useBudgetStore()

  const today = new Date()
  const todayDate = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthName = today.toLocaleString('default', { month: 'long' })

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-8 px-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{monthName} {currentYear}</h2>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-[8px] font-black text-gray-700 uppercase pb-4 tracking-widest">{d}</div>
        ))}

        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map(day => {
          const isToday = day === todayDate

          const dayDues = dues.filter(due => {
              const date = new Date(due.dueDate)
              return getDate(date) === day &&
                     getMonth(date) === currentMonth &&
                     getYear(date) === currentYear
          })

          const allPaid = dayDues.length > 0 && dayDues.every(d => d.isPaid)
          const isCrunchDay = dayDues.some(d => !d.isPaid && (day >= todayDate && day <= todayDate + 3))

          return (
            <div key={day} className="aspect-square flex flex-col items-center justify-center relative group">
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-black transition-all
                ${isToday ? 'bg-white text-black scale-110 shadow-2xl' : 'text-gray-500 group-hover:text-gray-300'}
                ${isCrunchDay && !isToday ? 'text-red-500' : ''}
              `}>
                {day}
              </div>

              <div className="absolute bottom-1 flex gap-0.5 h-0.5">
                {dayDues.length > 0 && (
                  <div className={`w-0.5 h-0.5 rounded-full ${allPaid ? 'bg-blue-500' : 'bg-red-500 animate-pulse'}`} />
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
