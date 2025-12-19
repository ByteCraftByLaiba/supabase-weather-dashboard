import React, { useState, useEffect } from 'react';
import { DateRangePicker } from '@/components/DateRangePicker';
// import { VolatilityIndicator } from '@/components/VolatilityIndicator';
import { supabase } from '@/lib/supabase';

import type { Database } from '@/types/database.types';

export type Location =
  Database['public']['Tables']['locations']['Row'];

export type WeatherReading =
  Database['public']['Tables']['weather_readings']['Row'];

const WeatherData: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [locations, setLocations] = useState<Location[]>([]);
  const [weatherReadings, setWeatherReadings] = useState<WeatherReading[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch locations
  useEffect(() => {
    fetchLocations();
  }, []);

  // Fetch weather data when filters change
  useEffect(() => {
    if (locations.length > 0) {
      fetchWeatherData();
    }
  }, [selectedLocation, dateRange, locations]);

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
    }
  };

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('weather_readings')
        .select(`
          *,
          locations!inner(*)
        `)
        .gte('recorded_at', dateRange.start.toISOString())
        .lte('recorded_at', dateRange.end.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (selectedLocation !== 'all') {
        query = query.eq('location_id', selectedLocation);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWeatherReadings(data || []);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to load weather data');
      setWeatherReadings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  // Calculate statistics from real data
  const statistics = {
    avgTemp: weatherReadings.length > 0 
      ? weatherReadings.reduce((sum, r) => sum + (r.temperature_c || 0), 0) / weatherReadings.length 
      : 0,
    avgHumidity: weatherReadings.length > 0 
      ? weatherReadings.reduce((sum, r) => sum + (r.humidity_percent || 0), 0) / weatherReadings.length 
      : 0,
    totalPrecipitation: weatherReadings.reduce((sum, r) => sum + (r.precipitation_mm || 0), 0),
  };

  const exportToCSV = () => {
    if (weatherReadings.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Location', 'Time', 'Temperature (°C)', 'Humidity (%)', 'Pressure (hPa)', 'Wind Speed (m/s)', 'Precipitation (mm)'];
    const csvData = weatherReadings.map(reading => [
      (reading as any).locations?.name || 'Unknown',
      new Date(reading.recorded_at).toLocaleString(),
      reading.temperature_c?.toFixed(1) || '0.0',
      reading.humidity_percent?.toFixed(1) || '0.0',
      reading.pressure_hpa?.toFixed(1) || '0.0',
      reading.wind_speed_ms?.toFixed(1) || '0.0',
      reading.precipitation_mm?.toFixed(1) || '0.0',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Weather Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed weather readings and analytics from Supabase
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Range
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - days);
                    setDateRange({ start, end });
                  }}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data Export
          </h3>
          <div className="space-y-2">
            <button 
              onClick={exportToCSV}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              disabled={weatherReadings.length === 0}
            >
              Export as CSV
            </button>
            <button 
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={fetchWeatherData}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="card">
        <DateRangePicker
          onChange={handleDateRangeChange}
          defaultRange="last7days"
          showPresets={true}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Average Temperature
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {statistics.avgTemp.toFixed(1)}°C
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Based on {weatherReadings.length} readings
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Average Humidity
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {statistics.avgHumidity.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Across selected locations
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Total Precipitation
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {statistics.totalPrecipitation.toFixed(1)} mm
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Over selected period
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weather Readings
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? 'Loading...' : `${weatherReadings.length} records`}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading data from Supabase...</p>
          </div>
        ) : weatherReadings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No weather data found for the selected filters.
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
                    Timestamp
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
                    Wind Speed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {weatherReadings.map((reading) => (
                  <tr key={reading.id}>
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
      </div>
    </div>
  );
};

export default WeatherData;