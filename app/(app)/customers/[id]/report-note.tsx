"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Clock } from "lucide-react"
import { updateCustomerReportStatus } from "./report-actions"

type ReportNoteProps = {
  customerId: number
  reportId: number
  initialNote: string | null
  lastUpdated: string | null
  currentStatus: string
}

export default function ReportNote({ customerId, reportId, initialNote, lastUpdated, currentStatus }: ReportNoteProps) {
  const [note, setNote] = useState(initialNote || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(lastUpdated)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Keep track of the status locally
  const [status, setStatus] = useState(currentStatus)

  // Update local status when prop changes
  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [note])

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Use the current status from state
      const result = await updateCustomerReportStatus(
        reportId,
        customerId,
        status, // Use the tracked status
        note,
      )

      if (result.success) {
        setLastSaved(new Date().toISOString())
      } else {
        console.error("Failed to save note:", result.error)
        // Show error toast or message here
      }
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format the last updated timestamp
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "Never saved"

    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="report-note" className="text-sm font-medium text-gray-700">
          Report Notes
        </label>
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          <span>Last updated: {formatTimestamp(lastSaved)}</span>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          id="report-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add notes about this report..."
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`absolute bottom-2 right-2 p-1.5 rounded-full ${
            isSubmitting ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          aria-label="Save note"
          title="Save note"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
