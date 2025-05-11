// types/weather.ts

/**
 * Represents weather data for a specific location
 */
export interface WeatherData {
    /** Temperature in Celsius */
    temperature: number;
    
    /** "Feels like" temperature in Celsius */
    feelsLike: number;
    
    /** Weather condition description (e.g., "Clear", "Clouds", "Rain") */
    condition: string;
    
    /** Location name and country code */
    location: string;
    
    /** Wind speed in km/h */
    windSpeed: number;
    
    /** Humidity percentage */
    humidity: number;
    
    /** Chance of rain percentage (approximate) */
    rainChance: number;
    
    /** OpenWeatherMap icon code */
    icon: string;
  }
  
  /**
   * Weather condition categories for farming activities
   */
  export enum WeatherConditionCategory {
    IDEAL = "ideal",
    GOOD = "good",
    CAUTION = "caution",
    WARNING = "warning"
  }
  
  /**
   * Weather recommendation for farming activities
   */
  export interface WeatherRecommendation {
    /** Category of recommendation */
    category: WeatherConditionCategory;
    
    /** Text recommendation for farmers */
    text: string;
    
    /** Suitable farming activities in these conditions */
    suitableActivities?: string[];
    
    /** Activities to avoid in these conditions */
    avoidActivities?: string[];
  }
  
  /**
   * Weather forecast data for a specific day
   */
  export interface ForecastDay {
    /** Date of the forecast */
    date: string;
    
    /** High temperature in Celsius */
    highTemp: number;
    
    /** Low temperature in Celsius */
    lowTemp: number;
    
    /** Weather condition description */
    condition: string;
    
    /** Icon code */
    icon: string;
    
    /** Chance of rain percentage */
    rainChance: number;
  }
  
  /**
   * Error response from weather service
   */
  export interface WeatherServiceError {
    /** Error code */
    code: string;
    
    /** Error message */
    message: string;
  }
  
  /**
   * Weather alert information
   */
  export interface WeatherAlert {
    /** Alert type */
    type: string;
    
    /** Alert severity */
    severity: "minor" | "moderate" | "severe" | "extreme";
    
    /** Alert description */
    description: string;
    
    /** Start time of alert */
    startTime: string;
    
    /** End time of alert */
    endTime: string;
  }
  
  /**
   * Parameters for weather fetch requests
   */
  export interface WeatherRequestParams {
    /** Location to fetch weather for (city,country format or lat,lon) */
    location: string;
    
    /** Units to use (metric or imperial) */
    units?: "metric" | "imperial";
    
    /** Whether to include forecast data */
    includeForecast?: boolean;
    
    /** Whether to include alerts */
    includeAlerts?: boolean;
  }