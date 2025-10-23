"use client"

import { useState } from "react"
import { addUser } from "./actions"

export default function AddUserForm({ onUserAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    is_admin: false,
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error("All fields are required")
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      const result = await addUser(new FormData(e.target))

      if (!result.success) {
        throw new Error(result.name || "Failed to add user")
      }

      onUserAdded()
    } catch (err) {
      setError(err.message || "Failed to add user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
            minLength={6}
          />
        </div>

        <div className="form-control">
          <label className="block text-sm font-medium mb-2">Role</label>
          <select name="role" value={formData.role} onChange={handleChange} className="select select-bordered w-full">
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-control">
          <label className="flex items-center justify-between cursor-pointer mt-2">
            <span className="label-text">Admin Privileges</span>
            <input
              type="checkbox"
              name="is_admin"
              checked={formData.is_admin}
              onChange={handleChange}
              className="checkbox"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Adding..." : "Add User"}
        </button>
      </div>
    </form>
  )
}
