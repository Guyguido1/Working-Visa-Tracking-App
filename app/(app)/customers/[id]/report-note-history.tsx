"use client"

import { useState } from "react"
import { addReportNote } from "./report-notes-actions"
import { useRouter } from "next/navigation"
import type { ReportNote } from "./report-notes-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Clock, User } from "lucide-react"

interface ReportNoteHistoryProps {
  reportId: number
  customerId: number
  notes: ReportNote[]
}

export default function ReportNoteHistory({ reportId, customerId, notes = [] }: ReportNoteHistoryProps) {
  const [newNote, setNewNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!newNote.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await addReportNote(reportId, customerId, newNote)

      if (result.success) {
        setNewNote("")
        // Refresh the page to show the new note
        router.refresh()
      } else {
        setError(result.error || "Failed to add note")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Report Notes History</h3>

      {/* Add new note */}
      <div className="space-y-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note..."
          className="min-h-[100px] w-full"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button onClick={handleSubmit} disabled={isSubmitting || !newNote.trim()} className="w-full">
          {isSubmitting ? "Adding Note..." : "Add Note"}
        </Button>
      </div>

      {/* Notes list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 bg-base-100 rounded-md border">
              <p className="whitespace-pre-wrap">{note.content}</p>

              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>{note.user_name || "Unknown User"}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDate(note.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
