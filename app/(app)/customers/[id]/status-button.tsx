"use client"

import { useState } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"
import { updateCustomerReportStatus } from "./report-actions"

type StatusButtonProps = {
  customerId: number
  reportId: number
  initialStatus: string
  variant: "completed" | "needs-attention"
  onStatusChange?: (newStatus: string) => void
}

export default function StatusButton({
  customerId,
  reportId,
  initialStatus,
  variant,
  onStatusChange,
}: StatusButtonProps) {
  const [isActive, setIsActive] = useState(
    initialStatus === (variant === "completed" ? "completed" : "needs_attention"),
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      // If already active, we're toggling off (back to pending)
      const newStatus = isActive ? "pending" : variant === "completed" ? "completed" : "needs_attention"

      const result = await updateCustomerReportStatus({
        customerId,
        reportId,
        status: newStatus,
      })

      if (result.success) {
        setIsActive(!isActive)
        if (onStatusChange) {
          onStatusChange(newStatus)
        }
      } else {
        console.error("Failed to update status:", result.error)
        // Show error toast or message here
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Determine button styles based on variant and active state
  const getButtonClasses = () => {
    const baseClasses = "flex items-center justify-center p-2 rounded-md transition-colors"

    if (isLoading) {
      return `${baseClasses} opacity-50 cursor-not-allowed bg-gray-200 text-gray-500`
    }

    if (variant === "completed") {
      return isActive
        ? `${baseClasses} bg-green-100 text-green-600 hover:bg-green-200`
        : `${baseClasses} bg-gray-100 text-gray-500 hover:bg-green-50`
    } else {
      return isActive
        ? `${baseClasses} bg-red-100 text-red-600 hover:bg-red-200`
        : `${baseClasses} bg-gray-100 text-gray-500 hover:bg-red-50`
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={getButtonClasses()}
      aria-label={`Mark as ${variant === "completed" ? "completed" : "needs attention"}`}
      title={`Mark as ${variant === "completed" ? "completed" : "needs attention"}`}
    >
      {variant === "completed" ? (
        <CheckCircle className={`w-5 h-5 ${isActive ? "text-green-600" : "text-gray-400"}`} />
      ) : (
        <AlertCircle className={`w-5 h-5 ${isActive ? "text-red-600" : "text-gray-400"}`} />
      )}
    </button>
  )
}
