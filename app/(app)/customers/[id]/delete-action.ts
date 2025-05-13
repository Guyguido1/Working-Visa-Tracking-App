"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getSession } from "@/app/actions/session"

export async function deleteCustomer(customerId: number) {
  try {
    // Get the user's session to access their company_id
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // First verify this customer belongs to the user's company
    const customerCheck = await sql`
      SELECT id FROM customers 
      WHERE id = ${customerId} AND company_id = ${session.company_id}
    `

    if (customerCheck.length === 0) {
      return { success: false, error: "Customer not found or access denied" }
    }

    // Delete associated reports first (foreign key constraint)
    await sql`DELETE FROM reports WHERE customer_id = ${customerId}`

    // Delete associated notes
    await sql`DELETE FROM customer_notes WHERE customer_id = ${customerId}`

    // Delete associated files
    await sql`DELETE FROM customer_files WHERE customer_id = ${customerId}`

    // Finally delete the customer
    await sql`DELETE FROM customers WHERE id = ${customerId}`

    revalidatePath("/dashboard")
    revalidatePath("/customers")

    return { success: true }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { success: false, error: "Failed to delete customer" }
  }
}
