import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function calculateTaskCompletionTime(createdAt: string, completedDate: string | null): {
  totalMinutes: number
  humanReadable: string
} | null {
  if (!completedDate || !createdAt) {
    return null
  }

  const startTime = new Date(createdAt)
  const endTime = new Date(completedDate)
  
  // Validate dates
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return null
  }

  // Ensure completion date is after creation date
  if (endTime <= startTime) {
    return null
  }

  const diffInMilliseconds = endTime.getTime() - startTime.getTime()
  const totalMinutes = Math.floor(diffInMilliseconds / (1000 * 60))

  // Format as human readable
  if (totalMinutes < 60) {
    return {
      totalMinutes,
      humanReadable: `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`
    }
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours < 24) {
    const hourStr = `${hours} hour${hours !== 1 ? 's' : ''}`
    const minuteStr = minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''
    return {
      totalMinutes,
      humanReadable: `${hourStr}${minuteStr}`
    }
  }

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  const dayStr = `${days} day${days !== 1 ? 's' : ''}`
  const hourStr = remainingHours > 0 ? ` ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}` : ''
  const minuteStr = minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''

  return {
    totalMinutes,
    humanReadable: `${dayStr}${hourStr}${minuteStr}`
  }
}
