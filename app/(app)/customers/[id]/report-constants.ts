// Constants and types for report status
export const REPORT_STATUSES = {
  COMPLETED: "completed",
  NEEDS_ATTENTION: "needs_attention",
  PENDING: "pending",
} as const

export type ReportStatus = (typeof REPORT_STATUSES)[keyof typeof REPORT_STATUSES]

export type ReportStatusResponse = {
  success: boolean
  error?: string
  report?: {
    id: number
    status: string
    note?: string | null
    status_updated_at?: string | null
  }
}
