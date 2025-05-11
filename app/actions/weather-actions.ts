// app/actions/weather-actions.ts
'use server'

import { cache } from 'react'
import { type WeatherData } from '@/lib/types/weather'

// Cache the weather data for 30 minutes to avoid excessive API calls
export const getWeather = cache(async (location: string): Promise<WeatherData> => {
  const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
  if (!WEATHER_API_KEY) {
    throw new Error('Weather API key is not configured');
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${WEATHER_API_KEY}`,
    { next: { revalidate: 1800 } } // 30 minutes cache
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    condition: data.weather[0].main,
    location: `${data.name}, ${data.sys.country}`,
    windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
    humidity: data.main.humidity,
    rainChance: data.rain ? 100 : (data.clouds.all > 60 ? 30 : 0), // Simplified rain chance
    icon: data.weather[0].icon
  };
})

// Get weather for all farms
export async function getWeatherForFarms(farmLocations: string[]): Promise<Record<string, WeatherData | null>> {
  const weatherPromises = farmLocations.map(location => 
    getWeather(location)
      .then(data => ({ [location]: data }))
      .catch(error => {
        console.error(`Error fetching weather for ${location}:`, error);
        return { [location]: null };
      })
  );
  const weatherResults = await Promise.all(weatherPromises);
  return weatherResults.reduce<Record<string, WeatherData | null>>(
    (acc, curr) => ({ ...acc, ...curr }), 
    {}
  );
}