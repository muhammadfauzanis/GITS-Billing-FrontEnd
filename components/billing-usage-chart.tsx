"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonthlyUsageProps {
  data: {
    data: Array<{
      id: string
      name: string
      months: Record<string, number>
    }>
    months: string[]
  }
}

// Predefined colors for chart lines
const COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#6b7280",
  "#ef4444",
  "#84cc16",
  "#06b6d4",
  "#a855f7",
]

// Format large numbers for display
const formatValue = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} Juta`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} Ribu`
  }
  return value.toFixed(0)
}

export function BillingUsageChart({ data }: MonthlyUsageProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Sort services by total usage (descending)
  const sortedServices = useMemo(() => {
    return [...data.data].sort((a, b) => {
      const totalA = Object.values(a.months).reduce((sum, val) => sum + val, 0)
      const totalB = Object.values(b.months).reduce((sum, val) => sum + val, 0)
      return totalB - totalA
    })
  }, [data.data])

  // Take top 5 services by default
  const topServices = useMemo(() => {
    return sortedServices.slice(0, 5).map((service) => service.id)
  }, [sortedServices])

  // If no selection, use top services
  const displayItems = selectedItems.length > 0 ? selectedItems : topServices

  // Transform data for the chart
  const chartData = useMemo(() => {
    return data.months.map((month) => {
      const monthData: any = { month }

      data.data.forEach((item) => {
        // Only include selected items or top services if none selected
        if (displayItems.includes(item.id)) {
          monthData[item.name] = item.months[month] || 0
        }
      })

      return monthData
    })
  }, [data.months, data.data, displayItems])

  // Handle selection change
  const handleSelectionChange = (value: string) => {
    if (value === "all") {
      setSelectedItems([])
    } else if (value === "top5") {
      setSelectedItems([])
    } else {
      setSelectedItems([value])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select onValueChange={handleSelectionChange} defaultValue="top5">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Top 5 Layanan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top5">Top 5 Layanan</SelectItem>
            <SelectItem value="all">Semua Layanan</SelectItem>
            {sortedServices.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.split(" ")[0]}
              stroke="#9ca3af"
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatValue(value)}
              stroke="#9ca3af"
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
              tickCount={5}
              domain={["auto", "auto"]}
              label={{
                value: "Juta",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "#9ca3af", fontSize: 12 },
              }}
            />
            <Tooltip
              formatter={(value: number) => [
                `Rp ${value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`,
                undefined,
              ]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                padding: "8px",
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: "10px" }}
              iconType="circle"
              iconSize={8}
            />
            {sortedServices.map((item, index) => {
              // Only render selected items or top services if none selected
              if (displayItems.includes(item.id)) {
                return (
                  <Line
                    key={item.id}
                    type="monotone"
                    dataKey={item.name}
                    name={item.name}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                )
              }
              return null
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
