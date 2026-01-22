"use client"

import { useState } from "react"
import { addReportNote, deleteReportNote } from "./report-notes-actions"
import { useRouter } from "next/navigation"
import type { ReportNote } from "./report-notes-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Clock, User, AlertCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ReportNoteHistoryProps {
  reportId: number
  customerId: number
  notes: ReportNote[]
  dueDate?: string
}

export default function ReportNoteHistory({ reportId, customerId, notes = [], dueDate }: ReportNoteHistoryProps) {
  const [newNote, setNewNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const router = useRouter()

  // Add a function to check if the report is within the 15-day window
  const isWithin15DayWindow = () => {
    if (!dueDate) return false

    const reportDueDate = new Date(dueDate)
    const today = new Date()
    const in15Days = new Date()
    in15Days.setDate(today.getDate() + 15)

    return reportDueDate <= in15Days
  }

  const handleSubmit = async () => {
    if (!newNote.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      console.log(`Submitting note for report ${reportId}, customer ${customerId}`)
      const result = await addReportNote(reportId, customerId, newNote)

      if (result.success) {
        console.log("Note added successfully")
        setNewNote("")
        // Refresh the page to show the new note
        router.refresh()
      } else {
        console.error("Failed to add note:", result.error)
        setError(result.error || "Failed to add note")
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      setError(`An unexpected error occurred: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    setIsDeleting(noteId)
    setError(null)

    try {
      const result = await deleteReportNote(noteId, reportId, customerId)

      if (result.success) {
        console.log("Note deleted successfully")
        // Refresh the page to update the notes list
        router.refresh()
      } else {
        console.error("Failed to delete note:", result.error)
        setError(result.error || "Failed to delete note")
      }
    } catch (err) {
      console.error("Error in handleDeleteNote:", err)
      setError(`An unexpected error occurred: ${err.message}`)
    } finally {
      setIsDeleting(null)
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

      {dueDate && !isWithin15DayWindow() ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Notes can only be added for reports due within the next 15 days or for overdue reports.
          </AlertDescription>
        </Alert>
      ) : (
        // Add new note - Fix text color for dark mode
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new note..."
            className="min-h-[100px] w-full text-foreground dark:text-white"
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSubmit} disabled={isSubmitting || !newNote.trim()} className="w-full">
            {isSubmitting ? "Adding Note..." : "Add Note"}
          </Button>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 bg-base-100 rounded-md border">
              <div className="flex justify-between">
                <p className="whitespace-pre-wrap">{note.content}</p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-base-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this note? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteNote(note.id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        {isDeleting === note.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

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
