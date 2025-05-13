"use client"

import { eachDayOfInterval, endOfMonth, format, isSameDay, isToday, startOfMonth } from "date-fns"
import { useState, useCallback, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { MIN_YEAR, MAX_YEAR } from "@/utils/date"

export default function CustomerCalendar({
  selected,
  onSelect,
}: {
  selected?: Date | null
  onSelect: (date: Date) => void
}) {
  // Ensure selected date is valid and within range
  const validSelected = useCallback(() => {
    if (!selected) return undefined

    try {
      if (!(selected instanceof Date) || isNaN(selected.getTime())) {
        console.error("Invalid selected date:", selected)
        return new Date() // Return current date as fallback
      }

      const year = selected.getFullYear()
      if (year < MIN_YEAR || year > MAX_YEAR) {
        console.warn(`Selected date outside allowed range (${year})`)
        return new Date() // Return current date as fallback
      }

      return selected
    } catch (error) {
      console.error("Error validating selected date:", error)
      return new Date() // Return current date as fallback
    }
  }, [selected])

  // Initialize current month based on valid selected date or current date
  const [currentMonth, setCurrentMonth] = useState(() => {
    const valid = validSelected()
    return valid || new Date()
  })

  // Update current month when selected date changes
  useEffect(() => {
    const valid = validSelected()
    if (valid) {
      setCurrentMonth(valid)
    }
  }, [validSelected])

  // Click rate limiting
  const lastClickTimeRef = useRef<number>(0)
  const clickCountRef = useRef<number>(0)
  const debounceTimeMs = 300 // Minimum time between clicks in milliseconds
  const maxClicksPerSecond = 3 // Maximum allowed clicks per second
  const clickResetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset click counter after a second
  useEffect(() => {
    return () => {
      if (clickResetTimeoutRef.current) {
        clearTimeout(clickResetTimeoutRef.current)
      }
    }
  }, [])

  // Advanced throttle function to prevent rapid clicks
  const throttle = useCallback((callback: () => void) => {
    const now = Date.now()

    // Increment click counter
    clickCountRef.current += 1

    // Reset click counter after a second
    if (!clickResetTimeoutRef.current) {
      clickResetTimeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0
        clickResetTimeoutRef.current = null
      }, 1000)
    }

    // Check if we're exceeding the click rate limit
    if (clickCountRef.current > maxClicksPerSecond) {
      return
    }

    // Check if enough time has passed since last click
    if (now - lastClickTimeRef.current >= debounceTimeMs) {
      lastClickTimeRef.current = now
      try {
        callback()
      } catch (error) {
        console.error("Error in throttled callback:", error)
        // Contain the error here to prevent propagation
      }
    }
  }, [])

  // Safe month navigation with year boundary checks
  const goPrevMonth = useCallback(() => {
    throttle(() => {
      setCurrentMonth((prev) => {
        try {
          const newDate = new Date(prev)
          newDate.setMonth(newDate.getMonth() - 1)

          // Check year boundary
          if (newDate.getFullYear() < MIN_YEAR) {
            newDate.setFullYear(MIN_YEAR)
            newDate.setMonth(0) // January
          }

          return newDate
        } catch (error) {
          console.error("Error navigating to previous month:", error)
          return prev // Return previous state on error
        }
      })
    })
  }, [throttle])

  const goNextMonth = useCallback(() => {
    throttle(() => {
      setCurrentMonth((prev) => {
        try {
          const newDate = new Date(prev)
          newDate.setMonth(newDate.getMonth() + 1)

          // Check year boundary
          if (newDate.getFullYear() > MAX_YEAR) {
            newDate.setFullYear(MAX_YEAR)
            newDate.setMonth(11) // December
          }

          return newDate
        } catch (error) {
          console.error("Error navigating to next month:", error)
          return prev // Return previous state on error
        }
      })
    })
  }, [throttle])

  // Safe year navigation with boundary checks
  const goPrevYear = useCallback(() => {
    throttle(() => {
      setCurrentMonth((prev) => {
        try {
          const newDate = new Date(prev)
          const newYear = Math.max(MIN_YEAR, newDate.getFullYear() - 1)
          newDate.setFullYear(newYear)
          return newDate
        } catch (error) {
          console.error("Error navigating to previous year:", error)
          return prev // Return previous state on error
        }
      })
    })
  }, [throttle])

  const goNextYear = useCallback(() => {
    throttle(() => {
      setCurrentMonth((prev) => {
        try {
          const newDate = new Date(prev)
          const newYear = Math.min(MAX_YEAR, newDate.getFullYear() + 1)
          newDate.setFullYear(newYear)
          return newDate
        } catch (error) {
          console.error("Error navigating to next year:", error)
          return prev // Return previous state on error
        }
      })
    })
  }, [throttle])

  // Safe date selection handler
  const handleDateSelect = useCallback(
    (day: Date) => {
      try {
        // Validate the date is valid before calling onSelect
        if (!(day instanceof Date) || isNaN(day.getTime())) {
          console.error("Invalid date selected:", day)
          return
        }

        // Check year boundaries
        const year = day.getFullYear()
        if (year < MIN_YEAR || year > MAX_YEAR) {
          console.error(`Date outside allowed year range (${year})`)
          return
        }

        // FIX: Create a new date object with just year, month, and day to avoid timezone issues
        const selectedDate = new Date(day.getFullYear(), day.getMonth(), day.getDate())

        // Wrap the onSelect call in try/catch to prevent propagation
        try {
          onSelect(selectedDate)
        } catch (error) {
          console.error("Error in onSelect callback:", error)
          // Contain the error here
        }
      } catch (error) {
        console.error("Error selecting date:", error)
        // Don't propagate the error - just log it
      }
    },
    [onSelect],
  )

  // Safely calculate days in month
  const getDaysInMonth = useCallback(() => {
    try {
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)
      return eachDayOfInterval({ start, end })
    } catch (error) {
      console.error("Error calculating days in month:", error)
      // Return an empty array as fallback
      return []
    }
  }, [currentMonth])

  // Safely get start of month
  const getStartOfMonth = useCallback(() => {
    try {
      return startOfMonth(currentMonth)
    } catch (error) {
      console.error("Error getting start of month:", error)
      return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    }
  }, [currentMonth])

  const days = getDaysInMonth()
  const start = getStartOfMonth()

  // Determine if we're at year boundaries to disable buttons
  const isAtMinYear = currentMonth.getFullYear() <= MIN_YEAR
  const isAtMaxYear = currentMonth.getFullYear() >= MAX_YEAR

  // Safely format month and year
  const formatMonthYear = useCallback(() => {
    try {
      return format(currentMonth, "MMMM yyyy")
    } catch (error) {
      console.error("Error formatting month and year:", error)
      return `${currentMonth.getMonth() + 1}/${currentMonth.getFullYear()}`
    }
  }, [currentMonth])

  // Add a "customer-calendar" class to the main container for targeting in CSS
  return (
    <div className="p-4 border rounded-lg w-full max-w-md bg-base-100 shadow customer-calendar">
      <div className="flex justify-between items-center mb-4 space-x-2">
        <button
          onClick={goPrevYear}
          className={`text-blue-600 hover:text-blue-800 ${isAtMinYear ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isAtMinYear}
          aria-label="Previous Year"
          type="button"
        >
          <ChevronsLeft size={20} />
        </button>
        <button
          onClick={goPrevMonth}
          className="text-blue-600 hover:text-blue-800"
          aria-label="Previous Month"
          type="button"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-lg font-semibold text-blue-800 text-center" style={{ width: "160px" }}>
          {formatMonthYear()}
        </div>
        <button
          onClick={goNextMonth}
          className="text-blue-600 hover:text-blue-800"
          aria-label="Next Month"
          type="button"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={goNextYear}
          className={`text-blue-600 hover:text-blue-800 ${isAtMaxYear ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isAtMaxYear}
          aria-label="Next Year"
          type="button"
        >
          <ChevronsRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {Array(start.getDay())
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
        {days.map((day) => {
          // Safely check if day is selected
          let isSelected = false
          try {
            isSelected =
              selected instanceof Date &&
              !isNaN(selected.getTime()) &&
              day instanceof Date &&
              !isNaN(day.getTime()) &&
              isSameDay(selected, day)
          } catch (error) {
            console.error("Error checking if day is selected:", error)
          }

          let today = false
          try {
            today = day instanceof Date && !isNaN(day.getTime()) && isToday(day)
          } catch (error) {
            console.error("Error checking if day is today:", error)
          }

          return (
            <button
              key={day.toString()}
              onClick={() => handleDateSelect(day)}
              className={`py-2 rounded-full transition-colors ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : today
                    ? "border border-blue-600 text-blue-600"
                    : "hover:bg-blue-100"
              }`}
              aria-label={format(day, "PPP")}
              aria-selected={isSelected}
              type="button"
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
