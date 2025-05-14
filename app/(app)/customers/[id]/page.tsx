import Link from "next/link"
import { ArrowLeft, Edit, Calendar, User, Globe, FileText, RefreshCw } from "lucide-react"
import { getCustomerDetails } from "./actions"
import NotesSection from "./notes-section"
import FileUpload from "./file-upload"
import DeleteCustomerModal from "./delete-modal"

// Helper function to format dates
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function CustomerDetails({ params }: { params: { id: string } }) {
  const customerId = Number.parseInt(params.id, 10)
  const result = await getCustomerDetails(customerId)

  // Handle error state
  if (!result.success) {
    return (
      <div className="w-full">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h1 className="text-2xl font-bold text-error">Error</h1>
            <p>{result.error || "Failed to load customer details"}</p>

            {/* Add a retry button for rate limit errors */}
            {result.error && result.error.includes("high traffic") && (
              <div className="card-actions justify-end mt-4">
                <Link href={`/customers/${customerId}`} className="btn btn-primary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const { customer, report, notes = [], files = [] } = result
  const customerName = `${customer.first_name} ${customer.last_name}`

  return (
    <div className="w-full">
      {/* Header with back button, edit button, and delete button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/dashboard" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-3xl font-bold">Customer Details</h1>
        </div>

        <div className="flex gap-3">
          <Link href={`/edit-customer/${customerId}`} className="btn btn-primary">
            <Edit className="w-4 h-4 mr-2" />
            Edit Customer
          </Link>
          <DeleteCustomerModal customerId={customerId} customerName={customerName} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Customer Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formatDate(customer.date_of_birth)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{customer.email || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{customer.phone || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Nationality</p>
                  <p className="font-medium">{customer.nationality || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passport Information Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Passport Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Passport Number</p>
                  <p className="font-medium">{customer.passport_number || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Passport Expiry Date</p>
                  <p className="font-medium">{formatDate(customer.passport_expiry_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visa Information Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Visa Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Visa Type</p>
                  <p className="font-medium">{customer.visa_type || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Visa Expiry Date</p>
                  <p className="font-medium">{formatDate(customer.expiry_date)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Application Date</p>
                  <p className="font-medium">{formatDate(customer.application_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reporting Information Card */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Reporting Information
              </h2>

              {report ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Next Report Date</p>
                    <p className="font-medium">{formatDate(report.due_date)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium">{report.description || "N/A"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No reporting requirements</p>
              )}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <FileUpload customerId={customerId} existingFiles={files} />
            </div>
          </div>
        </div>

        {/* Sidebar with Notes */}
        <div className="lg:col-span-1">
          <div className="card bg-base-200 shadow-xl sticky top-4">
            <div className="card-body">
              <NotesSection customerId={customerId} existingNotes={notes} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
