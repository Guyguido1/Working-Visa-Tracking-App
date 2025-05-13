import { fetchCustomerById } from "./fetch-customer"
import EditCustomerForm from "./edit-customer-form"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const customerId = Number.parseInt(params.id, 10)

  if (isNaN(customerId)) {
    notFound()
  }

  // Fetch customer data server-side with error handling
  let result
  try {
    result = await fetchCustomerById(customerId)
  } catch (error) {
    console.error("Error fetching customer:", error)
    // Instead of redirecting, show an error page
    return (
      <div className="w-full">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-3xl font-bold">Edit Customer</h1>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-error">Error Loading Customer</h2>
            <p className="my-4">
              An unexpected error occurred while loading the customer data. Please try again later.
            </p>

            <div className="card-actions justify-end mt-4">
              <Link href="/dashboard" className="btn btn-outline mr-2">
                Return to Dashboard
              </Link>
              <Link href={`/edit-customer/${customerId}`} className="btn btn-primary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle error state without redirecting
  if (!result || !result.success) {
    return (
      <div className="w-full">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-3xl font-bold">Edit Customer</h1>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-error">Error Loading Customer</h2>
            <p className="my-4">{result?.error || "Failed to load customer details"}</p>

            <div className="card-actions justify-end mt-4">
              <Link href="/dashboard" className="btn btn-outline mr-2">
                Return to Dashboard
              </Link>
              <Link href={`/edit-customer/${customerId}`} className="btn btn-primary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!result.customer) {
    // Instead of using notFound() which might redirect, show a custom error
    return (
      <div className="w-full">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="btn btn-ghost btn-sm mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-3xl font-bold">Edit Customer</h1>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-error">Customer Not Found</h2>
            <p className="my-4">The customer you are looking for does not exist or has been deleted.</p>

            <div className="card-actions justify-end mt-4">
              <Link href="/dashboard" className="btn btn-primary">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pass the fetched data to the client component
  return <EditCustomerForm initialCustomer={result.customer} initialReport={result.report} customerId={customerId} />
}
