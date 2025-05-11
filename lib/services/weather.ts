// lib/services/weather.ts

export interface WeatherData {
    temperature: number;
    feelsLike: number;
    condition: string;
    location: string;
    windSpeed: number;
    humidity: number;
    rainChance: number;
    icon: string;
  }
  
  // Kirinyaga coordinates
  const KIRINYAGA_COORDINATES = {
    lat: -0.65905650,
    lon: 37.38272340
  };
  
  /**
   * Fetches current weather data for Kirinyaga using coordinates
   */
  export async function fetchWeather(): Promise<WeatherData> {
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Weather API key is not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your environment variables.');
    }
  
    try {
      // Use the coordinates directly
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${KIRINYAGA_COORDINATES.lat}&lon=${KIRINYAGA_COORDINATES.lon}&units=metric&appid=${API_KEY}`
      );
  
      if (!response.ok) {
        throw new Error(`Weather API error (${response.status})`);
      }
  
      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        location: "Kirinyaga, KE",
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        humidity: data.main.humidity,
        rainChance: data.rain ? 100 : (data.clouds.all > 60 ? 30 : 0), // Simplified rain chance
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
  
  /**
   * Gets appropriate weather icon name based on condition
   */
  export function getWeatherIconName(condition: string, iconCode: string): string {
    // Check if it's night time (iconCode ends with 'n')
    const isNight = iconCode.endsWith('n');
    const lowercaseCondition = condition.toLowerCase();
    
    if (lowercaseCondition.includes('rain') || lowercaseCondition.includes('drizzle')) {
      return 'CloudRain';
    } else if (lowercaseCondition.includes('thunder')) {
      return 'CloudLightning';
    } else if (lowercaseCondition.includes('snow')) {
      return 'Snowflake';
    } else if (lowercaseCondition.includes('mist') || lowercaseCondition.includes('fog')) {
      return 'Cloud';
    } else if (lowercaseCondition.includes('cloud')) {
      return isNight ? 'CloudMoon' : 'CloudSun';
    } else {
      // Clear weather
      return isNight ? 'Moon' : 'Sun';
    }
  }