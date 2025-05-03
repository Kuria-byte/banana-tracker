"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, type ChartData } from "chart.js/auto"

interface BarChartProps {
  data: ChartData
}

export function BarChart({ data }: BarChartProps) {
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
        type: "bar",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => "$" + value,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || ""
                  const value = context.raw as number
                  return `${label}: $${value}`
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
