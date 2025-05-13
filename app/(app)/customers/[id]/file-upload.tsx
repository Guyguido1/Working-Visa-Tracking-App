"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, type File, X, Eye } from "lucide-react"
import { uploadFile } from "./actions"

type FileUploadProps = {
  customerId: number
  existingFiles: Array<{
    id: number
    filename: string
    file_type: string
    file_path: string
    created_at: string
  }>
}

export default function FileUpload({ customerId, existingFiles }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showFilesModal, setShowFilesModal] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setError("")

    try {
      for (const file of files) {
        const result = await uploadFile(customerId, file)
        if (!result.success) {
          setError(`Failed to upload ${file.name}: ${result.error}`)
          break
        }
      }

      // Clear files after upload
      setFiles([])
    } catch (err) {
      setError("An error occurred during upload")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️"
    if (fileType.includes("pdf")) return "📄"
    return "📎"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Documents</h3>

      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or click to select files</p>
        <p className="text-xs text-gray-500 mt-1">Supports: PDF, Images, Documents</p>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Selected Files</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                <div className="flex items-center">
                  <span className="mr-2">{getFileIcon(file.type)}</span>
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-end">
            <button type="button" onClick={handleUpload} disabled={uploading} className="btn btn-primary btn-sm">
              {uploading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Uploading...
                </>
              ) : (
                <>Upload Files</>
              )}
            </button>
          </div>

          {error && <p className="text-error text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* Standalone View Files Button - Always visible when files exist */}
      {existingFiles.length > 0 && (
        <div className="mt-4 mb-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowFilesModal(true)}
            className="btn btn-primary btn-lg w-full md:w-auto"
          >
            <Eye size={20} className="mr-2" />
            View All Files ({existingFiles.length})
          </button>
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium">Uploaded Documents ({existingFiles.length})</h4>
            <button type="button" onClick={() => setShowFilesModal(true)} className="btn btn-primary">
              <Eye size={18} className="mr-2" />
              View All Files
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {existingFiles.map((file) => (
                  <tr key={file.id}>
                    <td className="flex items-center">
                      <span className="mr-2">{getFileIcon(file.file_type)}</span>
                      <span className="truncate max-w-[200px]">{file.filename}</span>
                    </td>
                    <td>{file.file_type.split("/")[1]?.toUpperCase() || file.file_type}</td>
                    <td>{formatDate(file.created_at)}</td>
                    <td>
                      <a
                        href={file.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-xs"
                      >
                        <Eye size={16} />
                        <span className="ml-1">View</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Files Modal */}
      {showFilesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Customer Documents</h3>
              <button onClick={() => setShowFilesModal(false)} className="btn btn-sm btn-circle">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {existingFiles.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No documents uploaded yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {existingFiles.map((file) => (
                    <div key={file.id} className="card bg-base-200">
                      <div className="card-body p-4">
                        <div className="flex items-center mb-2">
                          <span className="text-3xl mr-3">{getFileIcon(file.file_type)}</span>
                          <div>
                            <h4 className="font-medium truncate">{file.filename}</h4>
                            <p className="text-xs text-gray-500">
                              {file.file_type.split("/")[1]?.toUpperCase() || file.file_type}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Uploaded: {formatDate(file.created_at)}</p>
                        <div className="card-actions justify-end mt-2">
                          <a
                            href={file.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            <Eye size={16} className="mr-1" />
                            View Document
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setShowFilesModal(false)} className="btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
