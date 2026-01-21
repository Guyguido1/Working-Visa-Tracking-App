"use client"

import { useState } from "react"
import { addNote, deleteNote } from "./actions"
import type { Note } from "./actions"
import { Trash2, AlertCircle } from "lucide-react"

type NotesSectionProps = {
  customerId: number
  existingNotes: Note[]
}

export default function NotesSection({ customerId, existingNotes }: NotesSectionProps) {
  const [noteContent, setNoteContent] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [notes, setNotes] = useState<Note[]>(existingNotes)

  const handleAddNote = async () => {
    if (!noteContent.trim()) return

    setIsSubmitting(true)
    setError("")

    try {
      const result = await addNote(customerId, noteContent.trim())

      if (result.success) {
        // Optimistically update the UI
        const newNote: Note = {
          id: result.noteId || -Date.now(), // Use the returned ID or a negative timestamp as temporary ID
          customer_id: customerId,
          content: noteContent.trim(),
          created_at: new Date().toISOString(),
          // Add a flag to identify optimistically added notes
          isOptimistic: !result.noteId,
        }
        setNotes([newNote, ...notes])
        setNoteContent("")
        setIsAddingNote(false)
      } else {
        setError(result.error || "Failed to add note")
      }
    } catch (err) {
      setError("An error occurred while adding the note")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (noteId: number) => {
    setDeletingNoteId(noteId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingNoteId) return

    setIsSubmitting(true)
    setError("")

    try {
      // Check if this is an optimistic note (has negative ID)
      const isOptimisticNote = deletingNoteId < 0

      if (isOptimisticNote) {
        // For optimistic notes, just remove from UI without server call
        setNotes(notes.filter((note) => note.id !== deletingNoteId))
        setShowDeleteConfirm(false)
        setIsSubmitting(false)
        return
      }

      // For real notes, call the server
      const result = await deleteNote(deletingNoteId, customerId)

      if (result.success) {
        // Optimistically update the UI
        setNotes(notes.filter((note) => note.id !== deletingNoteId))
        setShowDeleteConfirm(false)
      } else {
        setError(result.error || "Failed to delete note")
      }
    } catch (err) {
      setError("An error occurred while deleting the note")
      console.error(err)
    } finally {
      setIsSubmitting(false)
      setDeletingNoteId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Notes</h3>
        {!isAddingNote && (
          <button type="button" onClick={() => setIsAddingNote(true)} className="btn btn-sm btn-outline">
            Add Note
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <div className="bg-base-200 p-4 rounded-lg">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Enter note..."
            className="textarea textarea-bordered w-full h-24"
            disabled={isSubmitting}
          />

          {error && <p className="text-error text-sm mt-1">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddingNote(false)
                setNoteContent("")
                setError("")
              }}
              className="btn btn-sm btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddNote}
              className="btn btn-sm btn-primary"
              disabled={isSubmitting || !noteContent.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : (
                "Save Note"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 delete-note-modal">
          <div className="bg-red-50 rounded-lg shadow-xl max-w-md w-full delete-note-modal">
            <div className="p-6 bg-red-50 rounded-lg delete-note-modal text-black">
              <div className="flex items-center gap-3 text-red-700 mb-4">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-black">Delete Note</h3>
              </div>

              <p className="py-4 text-black">Are you sure you want to delete this note? This action cannot be undone.</p>

              {error && <p className="text-red-600 text-sm mt-2 mb-4">{error}</p>}

              <div className="flex justify-end gap-3 mt-6 delete-note-modal">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletingNoteId(null)
                  }}
                  className="btn btn-ghost text-black hover:bg-red-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="button" onClick={handleDeleteConfirm} className="btn btn-error" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Notes */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-base-200 p-4 rounded-lg relative group">
              <button
                onClick={() => handleDeleteClick(note.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="whitespace-pre-wrap pr-6">{note.content}</p>
              <p className="text-xs text-gray-500 mt-2">{formatDate(note.created_at)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
