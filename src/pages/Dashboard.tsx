import React, { useState, useEffect } from 'react';
import { DateRangePicker } from '@/components/DateRangePicker';
import { VolatilityIndicator, calculateWeatherVolatility } from '@/components/VolatilityIndicator';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

// Define types
type Location = Database['public']['Tables']['locations']['Row'];
type WeatherReading = Database['public']['Tables']['weather_readings']['Row'];
type WeatherReadingWithLocation = WeatherReading & {
  locations: Pick<Location, 'id' | 'name'> | null;
};

const Dashboard: React.FC = () => {
  // Use the joined type for state
  const [weatherReadings, setWeatherReadings] = useState<WeatherReadingWithLocation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [volatility, setVolatility] = useState<number>(0);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      fetchWeatherData();
    }
  }, [dateRange, locations]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load locations');
    }
  };

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Query with ALL required fields
      const { data, error } = await supabase
        .from('weather_readings')
        .select(`
          id,
          location_id,
          recorded_at,
          temperature_c,
          humidity_percent,
          pressure_hpa,
          wind_speed_ms,
          wind_direction_deg,
          precipitation_mm,
          created_at,
          locations!inner(id, name)
        `)
        .gte('recorded_at', dateRange.start.toISOString())
        .lte('recorded_at', dateRange.end.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      // Type assertion is safe here
      const typedData = data as unknown as WeatherReadingWithLocation[];
      setWeatherReadings(typedData || []);
      
      // Calculate volatility
      if (typedData && typedData.length > 1) {
        const temperatures = typedData
          .map(r => r.temperature_c)
          .filter((temp): temp is number => temp !== null && !isNaN(temp));
        
        const humidities = typedData
          .map(r => r.humidity_percent)
          .filter((hum): hum is number => hum !== null && !isNaN(hum));
        
        const pressures = typedData
          .map(r => r.pressure_hpa)
          .filter((press): press is number => press !== null && !isNaN(press));
        
        const windSpeeds = typedData
          .map(r => r.wind_speed_ms)
          .filter((wind): wind is number => wind !== null && !isNaN(wind));
        
        if (temperatures.length > 1) {
          const vol = calculateWeatherVolatility({
            temperature: temperatures,
            humidity: humidities.length > 1 ? humidities : undefined,
            pressure: pressures.length > 1 ? pressures : undefined,
            windSpeed: windSpeeds.length > 1 ? windSpeeds : undefined
          });
          setVolatility(vol);
        } else {
          setVolatility(0);
        }
      } else {
        setVolatility(0);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load weather data');
      setWeatherReadings([]);
      setVolatility(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  // Calculate metrics - fixed to use proper typing
  const metrics = {
    temperature: weatherReadings.length > 0 
      ? weatherReadings.reduce((sum, r) => sum + (r.temperature_c || 0), 0) / weatherReadings.length 
      : 0,
    humidity: weatherReadings.length > 0 
      ? weatherReadings.reduce((sum, r) => sum + (r.humidity_percent || 0), 0) / weatherReadings.length 
      : 0,
    pressure: weatherReadings.length > 0 
      ? weatherReadings.reduce((sum, r) => sum + (r.pressure_hpa || 0), 0) / weatherReadings.length 
      : 0,
    precipitation: weatherReadings.reduce((sum, r) => sum + (r.precipitation_mm || 0), 0),
    windSpeed: weatherReadings.length > 0 
      ? weatherReadings.reduce((sum, r) => sum + (r.wind_speed_ms || 0), 0) / weatherReadings.length 
      : 0,
  };

  // Remove type assertions in JSX
  const readingsByLocation = weatherReadings.reduce((acc, reading) => {
    const locationName = reading.locations?.name || 'Unknown';
    if (!acc[locationName]) {
      acc[locationName] = [];
    }
    acc[locationName].push(reading);
    return acc;
  }, {} as Record<string, WeatherReadingWithLocation[]>);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Weather Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time data from {locations.length} weather stations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <VolatilityIndicator value={volatility} showLabel />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600 dark:text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Error loading data
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {error}. Please check your Supabase connection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Picker */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Date Range
        </h2>
        <DateRangePicker
          onChange={handleDateRangeChange}
          defaultRange="last7days"
        />
      </div>

      {/* Weather Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Temperature</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.temperature.toFixed(1)}°C
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Based on {weatherReadings.length} readings
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">🌡️</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Humidity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.humidity.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Across all locations
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">💧</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Precipitation</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.precipitation.toFixed(1)} mm
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Over selected period
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">🌧️</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Weather Volatility</p>
              <div className="flex items-center space-x-2 mt-1">
                <VolatilityIndicator value={volatility} size="lg" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {volatility.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Calculated from {weatherReadings.length} data points
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weather Stations ({locations.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(location => {
            const locationReadings = readingsByLocation[location.name] || [];
            const lastReading = locationReadings[0];
            
            return (
              <div key={location.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full">
                    Active
                  </span>
                </div>
                
                {lastReading ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Temperature</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {lastReading.temperature_c?.toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Humidity</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {lastReading.humidity_percent?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(lastReading.recorded_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                    No data for selected period
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Weather Readings
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? 'Loading...' : `${weatherReadings.length} records`}
          </span>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading weather data from Supabase...</p>
          </div>
        ) : weatherReadings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No weather data available for the selected period.
            {locations.length === 0 && ' Please add locations first.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Temperature
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Humidity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pressure
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Wind
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {weatherReadings.slice(0, 10).map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                       {(reading as any).locations?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(reading.recorded_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reading.temperature_c?.toFixed(1) || '0.0'}°C
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reading.humidity_percent?.toFixed(1) || '0.0'}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reading.pressure_hpa?.toFixed(1) || '0.0'} hPa
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reading.wind_speed_ms?.toFixed(1) || '0.0'} m/s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {weatherReadings.length > 10 && (
          <div className="mt-4 text-center">
            <button 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              onClick={() => {/* Implement view all functionality */}}
            >
              View all {weatherReadings.length} records →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;