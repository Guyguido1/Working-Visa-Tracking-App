"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import CustomerCalendar from "./customer-calendar"
import { MIN_YEAR, MAX_YEAR } from "@/utils/date"

interface DateFieldProps {
  label: string
  value: Date | null
  onChange: (date: Date) => void
  placeholder?: string
  helpText?: string
  disabled?: boolean
  readOnly?: boolean
  error?: string
}

export default function DateField({
  label,
  value,
  onChange,
  placeholder = "Select date",
  helpText,
  disabled = false,
  readOnly = false,
  error,
}: DateFieldProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  // State to store the formatted date string
  const [formattedDate, setFormattedDate] = useState<string>("")

  // Local state to store selected date before passing to parent
  const [localDate, setLocalDate] = useState<Date | null>(value)

  // Update formatted date when value changes from parent
  useEffect(() => {
    try {
      if (!value) {
        setFormattedDate("")
        setLocalDate(null)
        return
      }

      if (!(value instanceof Date) || isNaN(value.getTime())) {
        console.error("Invalid date value:", value)
        setFormattedDate("")
        setLocalDate(null)
        return
      }

      // Ensure date is within allowed range - but don't reset to today
      const year = value.getFullYear()
      if (year < MIN_YEAR || year > MAX_YEAR) {
        console.warn(`Date outside allowed year range (${year}), but preserving value`)
      }

      setLocalDate(value)
      // Use date-fns format which handles timezone issues better than native methods
      setFormattedDate(format(value, "PPP"))
    } catch (error) {
      console.error("Error formatting date:", error)
      setFormattedDate("")
      setLocalDate(null)
    }
  }, [value])

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

  const handleSelect = (date: Date) => {
    try {
      // Validate the date before updating local state
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date selected:", date)
        return
      }

      // Check year boundaries - warn but don't prevent selection
      const year = date.getFullYear()
      if (year < MIN_YEAR) {
        console.warn(`Date year (${year}) is before minimum allowed year (${MIN_YEAR}), but allowing selection`)
      }

      if (year > MAX_YEAR) {
        console.warn(`Date year (${year}) is after maximum allowed year (${MAX_YEAR}), but allowing selection`)
      }

      // Update local state first
      setLocalDate(date)
      setFormattedDate(format(date, "PPP"))

      // Close the calendar
      setShowCalendar(false)

      // Call parent onChange with the new date
      // Create a new date object with just year, month, and day to avoid timezone issues
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      onChange(normalizedDate)
    } catch (error) {
      console.error("Error handling date selection:", error)
      // Don't propagate the error - just log it
    }
  }

  const toggleCalendar = () => {
    if (!disabled && !readOnly) {
      try {
        setShowCalendar(!showCalendar)
      } catch (error) {
        console.error("Error toggling calendar:", error)
      }
    }
  }

  return (
    <div className={`form-control w-full ${disabled ? "opacity-60" : ""}`}>
      <label className="label">
        <span className={`label-text ${disabled ? "text-gray-500" : ""}`}>{label}</span>
      </label>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={formattedDate}
          onClick={toggleCalendar}
          placeholder={placeholder}
          className={`input input-bordered w-full ${error ? "input-error" : ""} ${
            disabled ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed" : "cursor-pointer"
          }`}
          disabled={disabled}
        />
        {showCalendar && (
          <div className="absolute z-50 mt-2" ref={calendarRef}>
            <CustomerCalendar selected={localDate} onSelect={handleSelect} />
          </div>
        )}
      </div>
      {error ? (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      ) : helpText ? (
        <label className="label">
          <span className={`label-text-alt ${disabled ? "text-gray-500" : ""}`}>{helpText}</span>
        </label>
      ) : null}
    </div>
  )
}
