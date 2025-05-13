"use client"

export default function DeleteUserModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
        <p className="mb-6">
          Are you sure you want to delete user <strong>{user.name}</strong> ({user.email})? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
