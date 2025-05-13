import { redirect } from "next/navigation"

export default function EditCustomerBasePage() {
  // Only redirect if someone visits /edit-customer without an ID
  redirect("/dashboard")
}
