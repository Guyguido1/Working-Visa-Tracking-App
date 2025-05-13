# Tenant Isolation Architecture

This document outlines how multi-tenant isolation works in our visa management application, including registration, data access controls, and session management.

## Table of Contents

1. [Multi-Tenant Architecture Overview](#multi-tenant-architecture-overview)
2. [Admin Registration Process](#admin-registration-process)
3. [Company and User Relationship](#company-and-user-relationship)
4. [Data Isolation via company_id](#data-isolation-via-company_id)
5. [Session Structure and Enforcement](#session-structure-and-enforcement)
6. [Best Practices](#best-practices)
7. [Common Pitfalls](#common-pitfalls)
8. [Error Handling Patterns](#error-handling-patterns)

## Multi-Tenant Architecture Overview

Our application uses a multi-tenant architecture where each company (tenant) has its own isolated data. This is achieved through a `company_id` foreign key that links all data to a specific company. The system ensures that users can only access data belonging to their company.

## Admin Registration Process

The registration process creates both a company and an admin user in a single transaction:

1. **Company Creation**: A new company record is created with a unique ID
2. **Admin User Creation**: An admin user is created and linked to the company via `company_id`
3. **Error Handling**: If either step fails, the entire transaction is rolled back

### Registration Flow

\`\`\`
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Form Validation │────▶│ Create Company  │────▶│  Create Admin   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  Return Success │
                                               └─────────────────┘
\`\`\`

### Code Example

\`\`\`typescript
// 1. Insert new company
const companyResult = await sql`
  INSERT INTO companies (name, email)
  VALUES (${companyName}, ${email})
  RETURNING id
`
const companyId = companyResult[0].id

// 2. Insert admin user linked to the company
await sql`
  INSERT INTO users (company_id, name, email, password_hash, is_admin, role)
  VALUES (${companyId}, ${name}, ${email}, ${hashedPassword}, ${true}, 'admin')
`
\`\`\`

## Company and User Relationship

### Database Schema

- **Companies Table**: Stores company information
- **Users Table**: Stores user information with a `company_id` foreign key
- **Customers Table**: Stores customer information with a `company_id` foreign key
- **Reports Table**: Stores report information with a `customer_id` foreign key (indirectly linked to company)

### Relationship Diagram

\`\`\`
┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Companies  │◄──────┤    Users    │       │  Customers  │◄──────┤   Reports   │
└─────────────┘       └─────────────┘       └─────────────┘       └─────────────┘
       ▲                                           ▲
       │                                           │
       └───────────────────────────────────────────┘
                    company_id link
\`\`\`

## Data Isolation via company_id

All data access is filtered by `company_id` to ensure tenant isolation:

### Query Pattern

Every query that retrieves data must include a `company_id` filter:

\`\`\`typescript
// Example: Fetching customers for a specific company
const customers = await sql`
  SELECT * FROM customers 
  WHERE company_id = ${session.company_id}
`
\`\`\`

### Insert Pattern

Every insert must include the `company_id`:

\`\`\`typescript
// Example: Adding a new customer
await sql`
  INSERT INTO customers (company_id, first_name, last_name, ...)
  VALUES (${session.company_id}, ${firstName}, ${lastName}, ...)
`
\`\`\`

## Session Structure and Enforcement

### Session Object Structure

The session object contains:

\`\`\`typescript
{
  id: string,           // Session ID
  user_id: number,      // User ID
  name: string,         // User name
  email: string,        // User email
  is_admin: boolean,    // Admin status
  role: string,         // User role
  company_id: number,   // Company ID - CRITICAL for tenant isolation
  expires: Date         // Session expiration
}
\`\`\`

### Session Validation

Before any data operation:

1. Check if session exists
2. Verify `company_id` is present and valid
3. Use `company_id` for all data operations

\`\`\`typescript
const session = await getSession()
if (!session?.company_id) {
  console.error("❌ Missing company_id in session:", session)
  return { success: false, name: "Missing company ID" }
}
\`\`\`

## Best Practices

### 1. Always Check Session Before Data Access

\`\`\`typescript
export async function fetchData() {
  const session = await getSession()
  if (!session?.company_id) {
    return { success: false, name: "Unauthorized" }
  }
  
  // Now safe to proceed with data access
}
\`\`\`

### 2. Never Skip the company_id Filter

\`\`\`typescript
// GOOD: Filtered by company_id
const customers = await sql`SELECT * FROM customers WHERE company_id = ${session.company_id}`

// BAD: No company_id filter - NEVER DO THIS
const customers = await sql`SELECT * FROM customers` // Security risk!
\`\`\`

### 3. Use Consistent Error Responses

\`\`\`typescript
// Standard error response pattern
return {
  success: false,
  name: "Descriptive error message"
}
\`\`\`

### 4. Log All Errors with Context

\`\`\`typescript
console.error("❌ Operation failed:", error, { context: "additional info" })
\`\`\`

## Common Pitfalls

### 1. Using redirect() in Server Actions

\`\`\`typescript
// BAD: Using redirect() in server actions
if (condition) {
  redirect("/some-path") // Causes NEXT_REDIRECT errors
}

// GOOD: Return a result object instead
if (condition) {
  return { success: false, name: "Error message" }
}
\`\`\`

### 2. Missing company_id Validation

\`\`\`typescript
// BAD: Not checking company_id
const session = await getSession()
const data = await fetchData() // Might fail if company_id is missing

// GOOD: Validate company_id first
const session = await getSession()
if (!session?.company_id) {
  return { success: false, name: "Missing company ID" }
}
const data = await fetchData(session.company_id)
\`\`\`

### 3. Unsafe Error Handling

\`\`\`typescript
// BAD: Returning undefined or inconsistent errors
catch (error) {
  return { success: false } // Missing name/message
}

// GOOD: Proper error handling
catch (error) {
  let message = "Unknown error"
  if (typeof error === "string") message = error
  else if (error?.message) message = error.message
  
  return { success: false, name: message }
}
\`\`\`

## Error Handling Patterns

### Standard Error Response

All server actions should return a consistent error structure:

\`\`\`typescript
{
  success: false,
  name: "Descriptive error message",
  errors?: {
    _form?: string[],
    [fieldName]?: string[]
  }
}
\`\`\`

### Error Conversion

Convert all error types to strings for consistent handling:

\`\`\`typescript
let message = "Unknown error"

try {
  if (typeof error === "string") {
    message = error
  } else if (typeof error === "object") {
    message = JSON.stringify(error)
  } else {
    message = String(error)
  }
} catch (e) {
  console.error("❌ Failed to stringify error:", e)
}
\`\`\`

---

## For V0 Developers

When modifying tenant-related logic, always refer to this document to maintain proper tenant isolation. Key points to remember:

1. Every data access must be filtered by `company_id`
2. Session must include `company_id` for all authenticated operations
3. Never use `redirect()` inside server actions
4. Always return `{ success, name }` for error states
5. Log all errors with context for debugging
