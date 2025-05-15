"use client"

import { CheckCircle, AlertCircle, Clock } from "lucide-react"

type StatusIndicatorProps = {
  status: string
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status === "completed") {
    return (
      <div className="flex items-center" title="Completed">
        <CheckCircle className="w-4 h-4 text-green-500" />
      </div>
    )
  }

  if (status === "needs_attention") {
    return (
      <div className="flex items-center" title="Needs attention">
        <AlertCircle className="w-4 h-4 text-red-500" />
      </div>
    )
  }

  // Default pending state
  return (
    <div className="flex items-center" title="Pending">
      <Clock className="w-4 h-4 text-gray-400" />
    </div>
  )
}
