"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { addCustomer } from "./actions"
import DateField from "@/components/date-field"
import { Check } from "lucide-react"
import { parseDate, formatDateForSubmission, validateDate, MIN_YEAR } from "@/utils/date"

// Get today's date
function getTodayDate(): Date {
  return new Date()
}

export default function AddCustomer() {
  const router = useRouter()
  const today = getTodayDate()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: parseDate(today),
    nationality: "",
    passportNumber: "",
    passportExpiryDate: parseDate(today),
    visaType: "",
    visaExpiryDate: parseDate(today),
    lastReportDate: parseDate(today),
    nextReportDate: parseDate(new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)),
    noReportRequired: false,
  })

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    passportNumber: "",
    visaType: "",
    dateOfBirth: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Flag to track if we should update next report date
  const [shouldUpdateNextReportDate, setShouldUpdateNextReportDate] = useState(false)

  // Calculate next report date (90 days after last report date)
  useEffect(() => {
    if (formData.lastReportDate && !formData.noReportRequired && shouldUpdateNextReportDate) {
      try {
        const nextReportDate = new Date(formData.lastReportDate)
        nextReportDate.setDate(nextReportDate.getDate() + 90)
        setFormData((prev) => ({ ...prev, nextReportDate }))

        // Reset the flag
        setShouldUpdateNextReportDate(false)
      } catch (error) {
        console.error("Error calculating next report date:", error)
      }
    }
  }, [formData.lastReportDate, formData.noReportRequired, shouldUpdateNextReportDate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  // Handle date change from DatePicker with validation
  const handleDateChange = useCallback(
    (name: string, date: Date) => {
      try {
        // Validate the date
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          console.error("Invalid date selected:", date)
          return
        }

        // For date of birth, ensure it's not in the future and not too far in the past
        if (name === "dateOfBirth") {
          const year = date.getFullYear()
          if (year < MIN_YEAR) {
            setErrors((prev) => ({ ...prev, dateOfBirth: `Birth year cannot be before ${MIN_YEAR}` }))
            return
          }
          if (date > new Date()) {
            setErrors((prev) => ({ ...prev, dateOfBirth: "Birth date cannot be in the future" }))
            return
          }
        }

        setFormData((prev) => ({ ...prev, [name]: date }))

        // Only set the flag to update next report date if the last report date was changed
        if (name === "lastReportDate") {
          setShouldUpdateNextReportDate(true)
        }

        // Clear any errors for this field
        if (errors[name as keyof typeof errors]) {
          setErrors((prev) => ({ ...prev, [name as keyof typeof errors]: "" }))
        }
      } catch (error) {
        console.error(`Error handling date change for ${name}:`, error)
        // Don't propagate the error - just log it
      }
    },
    [errors],
  )

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
      valid = false
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
      valid = false
    }

    if (!formData.passportNumber.trim()) {
      newErrors.passportNumber = "Passport number is required"
      valid = false
    }

    if (!formData.visaType) {
      newErrors.visaType = "Visa type is required"
      valid = false
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    // Date validation
    const dateOfBirthError = validateDate(formData.dateOfBirth, "Date of birth")
    if (dateOfBirthError) {
      newErrors.dateOfBirth = dateOfBirthError
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Create a FormData object to submit
      const formDataToSubmit = new FormData()

      // Add text fields
      formDataToSubmit.append("firstName", formData.firstName)
      formDataToSubmit.append("lastName", formData.lastName)
      formDataToSubmit.append("email", formData.email)
      formDataToSubmit.append("phone", formData.phone)
      formDataToSubmit.append("nationality", formData.nationality)
      formDataToSubmit.append("passportNumber", formData.passportNumber)
      formDataToSubmit.append("visaType", formData.visaType)

      // Add date fields (formatted as YYYY-MM-DD) with validation
      try {
        formDataToSubmit.append("dateOfBirth", formatDateForSubmission(formData.dateOfBirth))
        formDataToSubmit.append("passportExpiryDate", formatDateForSubmission(formData.passportExpiryDate))
        formDataToSubmit.append("visaExpiryDate", formatDateForSubmission(formData.visaExpiryDate))
        formDataToSubmit.append("lastReportDate", formatDateForSubmission(formData.lastReportDate))
      } catch (error) {
        console.error("Error formatting dates for submission:", error)
        setSubmitError("Error processing dates. Please check all date fields.")
        setIsSubmitting(false)
        return
      }

      // Add next report date if required
      if (!formData.noReportRequired) {
        formDataToSubmit.append("nextReportDate", formatDateForSubmission(formData.nextReportDate))
      } else {
        formDataToSubmit.append("nextReportDate", "")
      }

      // Add checkbox state
      if (formData.noReportRequired) {
        formDataToSubmit.append("noReportRequired", "on")
      }

      // Submit the form using the server action with error handling
      let result
      try {
        result = await addCustomer(formDataToSubmit)
      } catch (error) {
        console.error("Error from server action:", error)
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Check for rate limit errors
        if (
          errorMessage.includes("Too Many Requests") ||
          errorMessage.includes("Too Many R") ||
          (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many"))
        ) {
          setSubmitError("The database is currently experiencing high traffic. Please try again in a few moments.")
        } else if (errorMessage.includes("Redirect")) {
          // Prevent redirect errors from causing a page navigation
          setSubmitError("An unexpected redirect occurred. Please try again.")
        } else {
          setSubmitError("An error occurred while adding the customer. Please try again.")
        }

        setIsSubmitting(false)
        return
      }

      if (result && result.success) {
        // Manually redirect to dashboard after successful submission
        try {
          router.push("/dashboard")
        } catch (error) {
          console.error("Error navigating to dashboard:", error)
          // Use setTimeout to ensure the current execution context completes first
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 100)
        }
      } else {
        setSubmitError(result?.error || "Failed to add customer. Please try again.")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting form:", error)

      // Check for rate limit errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (
        errorMessage.includes("Too Many Requests") ||
        errorMessage.includes("Too Many R") ||
        (errorMessage.includes("Unexpected token") && errorMessage.includes("Too Many"))
      ) {
        setSubmitError("The database is currently experiencing high traffic. Please try again in a few moments.")
      } else if (errorMessage.includes("Redirect")) {
        // Prevent redirect errors from causing a page navigation
        setSubmitError("An unexpected redirect occurred. Please try again.")
      } else {
        setSubmitError("Failed to add customer. Please try again.")
      }

      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8">Add New Customer</h1>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          {submitError && (
            <div className="alert alert-error mb-4">
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="divider">Personal Information</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">First Name *</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className={`input input-bordered w-full ${errors.firstName ? "input-error" : ""}`}
                />
                {errors.firstName && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.firstName}</span>
                  </label>
                )}
              </div>

              {/* Last Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Last Name *</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className={`input input-bordered w-full ${errors.lastName ? "input-error" : ""}`}
                />
                {errors.lastName && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.lastName}</span>
                  </label>
                )}
              </div>

              {/* Email */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.email}</span>
                  </label>
                )}
              </div>

              {/* Phone */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Date of Birth */}
              <DateField
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(date) => handleDateChange("dateOfBirth", date)}
                placeholder="Select date of birth"
                error={errors.dateOfBirth}
              />

              {/* Nationality */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Nationality</span>
                </label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Select nationality</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  <option value="India">India</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Mexico">Mexico</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Russia">Russia</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                </select>
              </div>
            </div>

            {/* Passport Information */}
            <div className="divider">Passport Information</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Passport Number */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Passport Number *</span>
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  placeholder="Enter passport number"
                  className={`input input-bordered w-full ${errors.passportNumber ? "input-error" : ""}`}
                />
                {errors.passportNumber && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.passportNumber}</span>
                  </label>
                )}
              </div>

              {/* Passport Expiry Date */}
              <DateField
                label="Passport Expiry Date"
                value={formData.passportExpiryDate}
                onChange={(date) => handleDateChange("passportExpiryDate", date)}
                placeholder="Select passport expiry date"
              />
            </div>

            {/* Visa Information */}
            <div className="divider">Visa Information</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visa Type */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Visa Type *</span>
                </label>
                <select
                  name="visaType"
                  value={formData.visaType}
                  onChange={handleChange}
                  className={`select select-bordered w-full ${errors.visaType ? "select-error" : ""}`}
                >
                  <option value="">Select visa type</option>
                  <option value="Tourist">Tourist</option>
                  <option value="Business">Business</option>
                  <option value="Work">Work</option>
                  <option value="Education">Education</option>
                </select>
                {errors.visaType && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.visaType}</span>
                  </label>
                )}
              </div>

              {/* Visa Expiry Date */}
              <DateField
                label="Visa Expiry Date"
                value={formData.visaExpiryDate}
                onChange={(date) => handleDateChange("visaExpiryDate", date)}
                placeholder="Select visa expiry date"
              />
            </div>

            {/* Reporting Information */}
            <div className="divider">Reporting Information</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom No Report Required Button */}
              <div className="form-control col-span-full mb-4">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, noReportRequired: !prev.noReportRequired }))}
                  className={`btn ${
                    formData.noReportRequired ? "btn-primary" : "btn-outline"
                  } flex items-center justify-start gap-3 w-64`}
                >
                  {formData.noReportRequired && <Check className="w-5 h-5" />}
                  <span>No Report Required</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-full">
                {/* Last Report Date */}
                <DateField
                  label="Last Report Date"
                  value={formData.lastReportDate}
                  onChange={(date) => handleDateChange("lastReportDate", date)}
                  placeholder="Select last report date"
                  disabled={formData.noReportRequired}
                />

                {/* Next Report Date (Auto-calculated) */}
                <DateField
                  label="Next Report Date"
                  value={formData.nextReportDate}
                  onChange={(date) => handleDateChange("nextReportDate", date)}
                  placeholder="Auto-calculated (90 days after last report)"
                  disabled={formData.noReportRequired}
                  readOnly={!formData.noReportRequired}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Submitting...
                  </>
                ) : (
                  "Add Customer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
