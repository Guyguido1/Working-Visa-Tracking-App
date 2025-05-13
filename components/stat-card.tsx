import type React from "react"

type StatCardProps = {
  title: string
  value: number | string | React.ReactNode
  icon?: React.ReactNode
  color?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = "bg-blue-500 text-white" }) => {
  // Safely render the value prop
  const renderValue = () => {
    if (value === null || value === undefined) {
      return "N/A"
    }

    if (typeof value === "object") {
      // Convert object to string to avoid React Error #31
      return JSON.stringify(value)
    }

    return value
  }

  return (
    <div className={`card shadow-xl ${color}`}>
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-sm font-medium">{title}</h2>
          {icon && <div className="opacity-80">{icon}</div>}
        </div>
        <p className="text-3xl font-bold mt-2">{renderValue()}</p>
      </div>
    </div>
  )
}

export default StatCard
