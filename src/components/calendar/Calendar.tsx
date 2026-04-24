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
    <div className="glass p-5 card-radius shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-200">{monthName} {currentYear}</h2>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-[9px] font-black text-gray-500 uppercase pb-4 tracking-widest">{d}</div>
        ))}

        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map(day => {
          const isToday = day === todayDate

          // Filter dues for this specific day and ensure they belong to the current month/year
          const dayDues = dues.filter(due => {
              const date = new Date(due.dueDate)
              return getDate(date) === day &&
                     getMonth(date) === currentMonth &&
                     getYear(date) === currentYear
          })

          const allPaid = dayDues.length > 0 && dayDues.every(d => d.isPaid)

          // Crunch Day: Due within 3 days and not paid
          const isCrunchDay = dayDues.some(d => !d.isPaid && (day >= todayDate && day <= todayDate + 3))

          return (
            <div key={day} className="aspect-square flex flex-col items-center justify-center relative">
              <div className={`
                w-8 h-8 flex items-center justify-center btn-radius text-[10px] font-bold transition-all
                ${isToday ? 'bg-white text-black shadow-xl scale-110' : 'text-gray-400'}
                ${isCrunchDay && !isToday ? 'text-red-400' : ''}
              `}>
                {day}
              </div>

              <div className="absolute bottom-1 flex gap-0.5 h-1">
                {dayDues.length > 0 && (
                  <div className={`w-1 h-1 rounded-full ${allPaid ? 'bg-blue-400' : 'bg-white/40 animate-pulse'}`} />
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
