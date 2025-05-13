"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteCustomer } from "./delete-action"
import { AlertTriangle } from "lucide-react"

export default function DeleteCustomerModal({
  customerId,
  customerName,
}: { customerId: number; customerName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError("")

    try {
      const result = await deleteCustomer(customerId)

      if (result.success) {
        // Close modal and redirect to dashboard
        setIsOpen(false)
        router.push("/dashboard")
      } else {
        setError(result.error || "Failed to delete customer")
        setIsDeleting(false)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setIsDeleting(false)
      console.error(err)
    }
  }

  return (
    <>
      {/* Delete Button */}
      <button onClick={() => setIsOpen(true)} className="btn btn-error">
        Delete Customer
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 text-error mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Delete Customer</h3>
              </div>

              <p className="py-4">
                Are you sure you want to delete <strong>{customerName}</strong>? This action cannot be undone and will
                permanently remove all customer data, including notes, files, and reports.
              </p>

              {error && <p className="text-error text-sm mt-2 mb-4">{error}</p>}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-ghost" disabled={isDeleting}>
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} className="btn btn-error" disabled={isDeleting}>
                  {isDeleting ? (
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
    </>
  )
}
