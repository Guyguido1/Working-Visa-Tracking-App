"use client"

import { useState, useEffect } from "react"
import { fetchUsers, deleteUser } from "./actions"
import AddUserForm from "./add-user-form"
import DeleteUserModal from "./delete-user-modal"
import { getSession } from "@/app/actions/session"
import EditUserModal from "./edit-user-modal"

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [companyName, setCompanyName] = useState("")
  const [userToEdit, setUserToEdit] = useState(null)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const session = await getSession()
        if (!session || !session.company_id) {
          setError("Failed to load users: Missing company ID")
          console.error("Missing session or company_id")
          return
        }

        const data = await fetchUsers(session.company_id)
        if (Array.isArray(data)) {
          setUsers(data)
          if (data.length > 0 && data[0].company_name) {
            setCompanyName(data[0].company_name)
          }
        } else {
          console.error("Failed to fetch users:", data)
          setError(data.error || "Failed to load users")
        }
      } catch (err) {
        setError("Failed to load users. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [refreshTrigger])

  const handleUserAdded = () => {
    setShowAddForm(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(userToDelete.id)
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setUserToDelete(null)
    } catch (err) {
      setError("Failed to delete user. Please try again.")
      console.error(err)
    }
  }

  const handleDeleteCancel = () => {
    setUserToDelete(null)
  }

  const handleEditClick = (user) => {
    setUserToEdit(user)
  }

  const handleEditConfirm = () => {
    setUserToEdit(null)
    // Optionally refresh the user list
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEditCancel = () => {
    setUserToEdit(null)
  }

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-error">{error}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Users in {companyName}</h2>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          Add New User
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 bg-base-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add New User</h3>
          <AddUserForm onUserAdded={handleUserAdded} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {Array.isArray(users) && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Role</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.company_name}</td>
                  <td>{user.role}</td>
                  <td>{user.is_admin ? "Yes" : "No"}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button className="btn btn-primary btn-sm" onClick={() => handleEditClick(user)}>
                        Edit
                      </button>
                      {user.id !== currentUser.id && (
                        <button className="btn btn-error btn-sm" onClick={() => handleDeleteClick(user)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">No users found. Add your first user using the button above.</div>
      )}

      {userToDelete && (
        <DeleteUserModal user={userToDelete} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} />
      )}
      {userToEdit && <EditUserModal user={userToEdit} onConfirm={handleEditConfirm} onCancel={handleEditCancel} />}
    </div>
  )
}
