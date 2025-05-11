"use client"

import { useEffect, useState } from "react"
import { useUser } from "@stackframe/stack"
import { 
  Clock, 
  CloudRain, 
  Droplets, 
  Leaf, 
  MapPin, 
  Sun, 
  Moon,
  CloudSun,
  CloudMoon,
  CloudLightning,
  Snowflake,
  Cloud,
  Thermometer, 
  Wind, 
  CheckCircle2, 
  LineChart 
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FarmSelectionModal } from "@/components/modals/farm-selection-modal"
import { fetchWeather, getWeatherIconName } from "@/lib/services/weather"
import type { WeatherData } from "@/lib/services/weather"

export function EnhancedGreeting({ farms, tasks }: { farms: any[]; tasks: any[] }) {
  const user = useUser()

  const [greeting, setGreeting] = useState("Hello")
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(true)
  const [weatherError, setWeatherError] = useState<string | null>(null)

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) setGreeting("Good morning")
      else if (hour < 18) setGreeting("Good afternoon")
      else setGreeting("Good evening")

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
      setCurrentTime(new Date().toLocaleTimeString(undefined, timeOptions))

      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
      }
      setCurrentDate(new Date().toLocaleDateString(undefined, dateOptions))
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsLoadingWeather(true)
        const weatherData = await fetchWeather()
        setWeather(weatherData)
        setWeatherError(null)
      } catch (error) {
        console.error('Error fetching weather:', error)
        setWeatherError('Could not load weather data')
      } finally {
        setIsLoadingWeather(false)
      }
    }

    fetchWeatherData()
    
    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(fetchWeatherData, 30 * 60 * 1000)
    return () => clearInterval(weatherInterval)
  }, [])

  // Calculate farm and task stats using props
  const totalFarms = farms.length
  const healthyFarms = farms.filter((farm) => farm.healthStatus === "Good").length
  const healthPercentage = Math.round((healthyFarms / totalFarms) * 100)
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "Completed").length
  const taskPercentage = Math.round((completedTasks / totalTasks) * 100)
  const today = new Date().toISOString().split("T")[0]
  const tasksDueToday = tasks.filter(
    (task) => task.status !== "Completed" && task.dueDate && task.dueDate.split("T")[0] === today,
  ).length

  // Function to render the appropriate weather icon component
  const renderWeatherIcon = (condition: string, iconCode: string) => {
    const iconName = getWeatherIconName(condition, iconCode)
    const iconProps = { className: "h-6 w-6 text-yellow-600 dark:text-yellow-400" }
    
    switch(iconName) {
      case 'CloudRain':
        return <CloudRain {...iconProps} className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      case 'CloudLightning':
        return <CloudLightning {...iconProps} className="h-6 w-6 text-purple-600 dark:text-purple-400" />
      case 'Snowflake':
        return <Snowflake {...iconProps} className="h-6 w-6 text-blue-200 dark:text-blue-200" />
      case 'Cloud':
        return <Cloud {...iconProps} className="h-6 w-6 text-gray-400 dark:text-gray-300" />
      case 'CloudSun':
        return <CloudSun {...iconProps} className="h-6 w-6 text-gray-600 dark:text-gray-400" />
      case 'CloudMoon':
        return <CloudMoon {...iconProps} className="h-6 w-6 text-gray-600 dark:text-gray-400" />
      case 'Moon':
        return <Moon {...iconProps} className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      case 'Sun':
      default:
        return <Sun {...iconProps} />
    }
  }

  // Get weather recommendation based on conditions
  const getWeatherRecommendation = (weather: WeatherData) => {
    if (weather.condition.toLowerCase().includes('rain') || weather.rainChance > 50) {
      return "Consider postponing outdoor activities"
    } else if (weather.condition.toLowerCase().includes('clear') && weather.temperature > 25) {
      return "Ideal for field inspections and harvesting"
    } else if (weather.condition.toLowerCase().includes('clear') && weather.temperature < 15) {
      return "Good weather for equipment maintenance"
    } else if (weather.windSpeed > 20) {
      return "High winds may affect spraying operations"
    } else {
      return "Good conditions for most farming activities"
    }
  }

  // Show loading state if user is not loaded yet
  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <Card className="border-none shadow-none bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* Left column - Greeting and stats */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span>{currentTime}</span>
                <span className="mx-1">•</span>
                <span>{currentDate}</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                {greeting}, {user.displayName || user.primaryEmail}
              </h1>
              <p className="text-muted-foreground">Welcome back to your farm management dashboard</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary" />
                    <span className="font-medium">Farm Health</span>
                  </div>
                  <span className="text-sm">
                    {healthyFarms}/{totalFarms} farms healthy
                  </span>
                </div>
                <Progress value={healthPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {healthPercentage >= 75 ? "Your farms are doing well overall" : "Some farms need attention"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">Task Progress</span>
                  </div>
                  <span className="text-sm">
                    {completedTasks}/{totalTasks} tasks completed
                  </span>
                </div>
                <Progress value={taskPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {tasksDueToday > 0 ? `${tasksDueToday} tasks due today` : "No tasks due today"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8" asChild>
                <Link href="/tasks">
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                  Assign Task
                </Link>
              </Button>
              <FarmSelectionModal>
                <Button variant="outline" size="sm" className="h-8">
                  <LineChart className="mr-2 h-3.5 w-3.5" />
                  Score Farm
                </Button>
              </FarmSelectionModal>
            </div>
          </div>

          {/* Right column - Weather and insights */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Today's Weather</h3>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Kirinyaga</span>
              </div>
            </div>

            {isLoadingWeather ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : weatherError ? (
              <div className="flex flex-col items-center justify-center h-32">
                <p className="text-muted-foreground">{weatherError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setIsLoadingWeather(true);
                    fetchWeather()
                      .then(data => {
                        setWeather(data);
                        setWeatherError(null);
                      })
                      .catch(error => {
                        console.error('Error retrying weather fetch:', error);
                        setWeatherError('Could not load weather data');
                      })
                      .finally(() => setIsLoadingWeather(false));
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : weather ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
                      {renderWeatherIcon(weather.condition, weather.icon)}
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{weather.temperature}°C</p>
                      <p className="text-xs text-muted-foreground">Feels like {weather.feelsLike}°C</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{weather.condition}</p>
                    <p className="text-xs text-muted-foreground">{weather.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center gap-1 rounded-md bg-muted p-2">
                    <Wind className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{weather.windSpeed} km/h</span>
                    <span className="text-muted-foreground">Wind</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-md bg-muted p-2">
                    <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{weather.humidity}%</span>
                    <span className="text-muted-foreground">Humidity</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-md bg-muted p-2">
                    <CloudRain className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{weather.rainChance}%</span>
                    <span className="text-muted-foreground">Rain</span>
                  </div>
                </div>

                <div className="mt-4 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Thermometer className="h-3.5 w-3.5" />
                    <span>{getWeatherRecommendation(weather)}</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}