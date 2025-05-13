"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

// Define year limits to prevent excessive navigation
const MIN_YEAR = 1900
const MAX_YEAR = 2100

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
}: {
  value?: Date
  onChange: (date: Date) => void
  placeholder?: string
}) {
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  const lastSelectionTimeRef = useRef<number>(0)
  const debounceTimeMs = 300 // Minimum time between selections in milliseconds

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (date: Date | undefined) => {
    if (!date) return

    // Debounce date selection
    const now = Date.now()
    if (now - lastSelectionTimeRef.current < debounceTimeMs) {
      return
    }
    lastSelectionTimeRef.current = now

    try {
      // Validate date before calling onChange
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date selected:", date)
        return
      }

      // Check year boundaries
      if (date.getFullYear() < MIN_YEAR || date.getFullYear() > MAX_YEAR) {
        console.error("Date outside allowed year range:", date)
        return
      }

      onChange(date)
      setShowCalendar(false)
    } catch (error) {
      console.error("Error handling date selection:", error)
    }
  }

  // Safely format date for display
  const getFormattedDate = () => {
    try {
      if (!value) return ""
      if (!(value instanceof Date) || isNaN(value.getTime())) return ""
      return format(value, "PPP")
    } catch (error) {
      console.error("Error formatting date:", error)
      return ""
    }
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        readOnly
        value={getFormattedDate()}
        onClick={() => setShowCalendar(!showCalendar)}
        placeholder={placeholder}
        className="input input-bordered w-full cursor-pointer"
      />

      {showCalendar && (
        <div className="absolute z-50 mt-2 bg-white rounded-md shadow-md border p-4 w-[320px]" ref={calendarRef}>
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            defaultMonth={value || new Date()}
            showOutsideDays
            captionLayout="dropdown"
            fromYear={MIN_YEAR}
            toYear={MAX_YEAR}
            classNames={{
              caption:
                "flex justify-center items-center gap-4 px-4 py-2 bg-blue-800 text-white font-semibold rounded-t",
              nav: "flex items-center",
              nav_button: "text-white hover:text-blue-200 px-2 text-lg",
              caption_dropdowns: "flex items-center gap-2",
              dropdown: "bg-white text-black rounded px-2 py-1 text-sm",
              table: "w-full mt-2",
              head_row: "text-blue-800 font-medium",
              row: "text-center",
              cell: "w-10 h-10",
              day_selected: "bg-blue-600 text-white rounded-full",
              day: "rounded-full hover:bg-blue-100 transition-colors duration-150",
            }}
          />
        </div>
      )}
    </div>
  )
}
