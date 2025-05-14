"use client"

import { useState } from "react"
import { updateUserPassword } from "./actions"

export default function EditUserModal({ user, onConfirm, onCancel }) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate passwords
    if (!newPassword) {
      setError("Password is required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateUserPassword(user.id, newPassword)

      if (result.success) {
        onConfirm()
      } else {
        setError(result.error || "Failed to update password")
        setIsSubmitting(false)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Reset Password for {user.name}</h3>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">New Password</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input input-bordered"
              placeholder="Enter new password"
            />
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input input-bordered"
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
