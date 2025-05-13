"use client"

import { useState } from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isToday } from "date-fns"

export default function CustomerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const startMonth = startOfMonth(currentDate)
  const endMonth = endOfMonth(currentDate)
  const startDate = startOfWeek(startMonth)
  const endDate = endOfWeek(endMonth)

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  return (
    <div className="bg-blue-900 text-white rounded-lg shadow p-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="text-white text-xl hover:text-blue-300">&lt;&lt;</button>
        <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
        <button onClick={goToNextMonth} className="text-white text-xl hover:text-blue-300">&gt;&gt;</button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-sm font-medium text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-blue-200">{day}</div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayHighlight = isToday(day)

          return (
            <div
              key={day.toString()}
              className={`p-2 rounded text-center ${
                isCurrentMonth ? "text-white" : "text-blue-300 opacity-50"
              } ${isTodayHighlight ? "bg-white text-blue-900 font-bold" : ""}`}
            >
              {format(day, "d")}
            </div>
          )
        })}
      </div>
    </div>
  )
}
