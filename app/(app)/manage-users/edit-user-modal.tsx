"use client"

import { useActionState } from "react"
import { updateUser } from "./actions"
import { X } from "lucide-react"
import { useState } from "react"

interface User {
  id: number
  name: string
  email: string
  role: string
  is_admin: boolean
}

interface EditUserModalProps {
  user: User
  onClose: () => void
  onSuccess: () => void
}

export default function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const updateUserWithId = updateUser.bind(null, user.id)
  const [state, formAction, isPending] = useActionState(updateUserWithId, undefined)
  const [showPassword, setShowPassword] = useState(false)

  if (state?.success) {
    setTimeout(() => {
      onSuccess()
      onClose()
    }, 1000)
  }

  return (
    <dialog id="edit_user_modal" className="modal modal-open">
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">Edit User</h3>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={user.name}
              className="input input-bordered w-full px-5"
              required
            />
            {state?.errors?.name && <p className="text-error text-sm mt-1">{state.errors.name[0]}</p>}
          </div>

          <div>
            <label htmlFor="email" className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={user.email}
              className="input input-bordered w-full px-5"
              required
            />
            {state?.errors?.email && <p className="text-error text-sm mt-1">{state.errors.email[0]}</p>}
          </div>

          <div>
            <label htmlFor="role" className="label">
              <span className="label-text">Role</span>
            </label>
            <select
              id="role"
              name="role"
              defaultValue={user.role}
              className="select select-bordered w-full px-5"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {state?.errors?.role && <p className="text-error text-sm mt-1">{state.errors.role[0]}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">
              <span className="label-text">New Password (leave blank to keep current)</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="input input-bordered w-full px-5"
              placeholder="Leave blank to keep current password"
            />
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <span className="label-text">Show password</span>
            </label>
            {state?.errors?.password && <p className="text-error text-sm mt-1">{state.errors.password[0]}</p>}
          </div>

          {state?.message && !state?.success && (
            <div className="alert alert-error">
              <span>{state.message}</span>
            </div>
          )}

          {state?.success && (
            <div className="alert alert-success">
              <span>{state.message}</span>
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
