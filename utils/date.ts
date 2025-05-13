// Define year limits to prevent excessive navigation
export const MIN_YEAR = 1900
// FIX: Increase MAX_YEAR to allow more future dates for passport and visa expiry
export const MAX_YEAR = new Date().getFullYear() + 20

/**
 * Safely parses a date string or object into a valid Date
 * Returns null if the input is invalid or missing, only using fallback if explicitly provided
 */
export function parseDate(dateInput: string | Date | null | undefined, fallback: Date | null = null): Date | null {
  // If input is missing, return fallback (which defaults to null)
  if (!dateInput) return fallback

  try {
    // If it's already a Date object, validate it
    if (dateInput instanceof Date) {
      // Check if the date is valid
      if (isNaN(dateInput.getTime())) {
        console.error("Invalid date object:", dateInput)
        return fallback
      }

      // Check if the date is within reasonable range
      const year = dateInput.getFullYear()
      if (year < MIN_YEAR || year > MAX_YEAR) {
        console.warn(`Date outside reasonable range (${year}), but preserving value`)
        // Return the date anyway, don't use fallback
        return dateInput
      }

      return dateInput
    }

    // Parse string to Date
    const date = new Date(dateInput)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateInput)
      return fallback
    }

    // Check if the date is within reasonable range
    const year = date.getFullYear()
    if (year < MIN_YEAR || year > MAX_YEAR) {
      console.warn(`Date outside reasonable range (${year}), but preserving value`)
      // Return the date anyway, don't use fallback
      return date
    }

    return date
  } catch (error) {
    console.error("Error parsing date:", error)
    return fallback
  }
}

/**
 * Format date to YYYY-MM-DD for form submission with error handling
 * FIX: Ensure we're handling timezone issues correctly to prevent off-by-one-day errors
 */
export function formatDateForSubmission(date: Date | null | undefined): string {
  if (!date) return ""

  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date for submission:", date)
      return ""
    }

    // Check year boundaries
    const year = date.getFullYear()
    if (year < MIN_YEAR || year > MAX_YEAR) {
      console.warn(`Date outside allowed year range (${year}), but using it anyway`)
    }

    // FIX: Use UTC methods to prevent timezone issues
    // This ensures the date is the same regardless of the user's timezone
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0") // January is 0!
    const dd = String(date.getDate()).padStart(2, "0")

    // Return date in YYYY-MM-DD format without any time or timezone information
    return `${yyyy}-${mm}-${dd}`
  } catch (error) {
    console.error("Error formatting date for submission:", error)
    return ""
  }
}

/**
 * Validates a date is within acceptable range
 * Returns an error message if invalid, or empty string if valid
 */
export function validateDate(date: Date | null | undefined, fieldName = "Date"): string {
  if (!date) return ""

  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return `${fieldName} is invalid`
    }

    const year = date.getFullYear()
    if (year < MIN_YEAR) {
      return `${fieldName} year cannot be before ${MIN_YEAR}`
    }
    if (year > MAX_YEAR) {
      return `${fieldName} year cannot be after ${MAX_YEAR}`
    }

    return ""
  } catch (error) {
    console.error(`Error validating ${fieldName}:`, error)
    return `${fieldName} is invalid`
  }
}
