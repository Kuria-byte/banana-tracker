"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, type ChartData } from "chart.js/auto"

interface PieChartProps {
  data: ChartData
}

export function PieChart({ data }: PieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 11,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ""
                  const value = context.raw as number
                  const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0) as number
                  const percentage = Math.round((value / total) * 100)
                  return `${label}: $${value} (${percentage}%)`
                },
              },
            },
          },
        },
      } as ChartConfiguration)
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}
