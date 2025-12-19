import React, { useState, useEffect } from 'react';
import { VolatilityIndicator, calculateWeatherVolatility } from '@/components/VolatilityIndicator';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

export type Location =
  Database['public']['Tables']['locations']['Row'];

export type WeatherReading =
  Database['public']['Tables']['weather_readings']['Row'];

const Analytics: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      const startDate = new Date();
      if (timeRange === 'week') startDate.setDate(startDate.getDate() - 7);
      if (timeRange === 'month') startDate.setDate(startDate.getDate() - 30);
      if (timeRange === 'year') startDate.setDate(startDate.getDate() - 365);

      const { data, error } = await supabase
        .from('weather_readings')
        .select(`
          *,
          locations!inner(name)
        `)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', new Date().toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      setWeatherData(data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate trends from real data
  const calculateTrends = () => {
    if (weatherData.length === 0) return [];
    
    // Group by day
    const dailyData = weatherData.reduce((acc, reading) => {
      const date = new Date(reading.recorded_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          temps: [],
          humidities: [],
          pressures: [],
          windSpeeds: [],
        };
      }
      acc[date].temps.push(reading.temperature_c || 0);
      acc[date].humidities.push(reading.humidity_percent || 0);
      acc[date].pressures.push(reading.pressure_hpa || 0);
      acc[date].windSpeeds.push(reading.wind_speed_ms || 0);
      return acc;
    }, {} as Record<string, any>);

    // Calculate daily averages
    return Object.values(dailyData).map((day: any) => ({
      date: day.date,
      avgTemp: day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length,
      avgHumidity: day.humidities.reduce((a: number, b: number) => a + b, 0) / day.humidities.length,
      avgPressure: day.pressures.reduce((a: number, b: number) => a + b, 0) / day.pressures.length,
      avgWindSpeed: day.windSpeeds.reduce((a: number, b: number) => a + b, 0) / day.windSpeeds.length,
    })).slice(-7); // Last 7 days
  };

  const trends = calculateTrends();
  const volatility = weatherData.length > 0 
    ? calculateWeatherVolatility({
        temperature: weatherData.map(r => r.temperature_c || 0),
        humidity: weatherData.map(r => r.humidity_percent || 0),
        pressure: weatherData.map(r => r.pressure_hpa || 0),
        windSpeed: weatherData.map(r => r.wind_speed_ms || 0),
      })
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Weather patterns and trends from Supabase data
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-4 py-2 rounded-md ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Last Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded-md ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Last Month
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`px-4 py-2 rounded-md ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          Last Year
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Loading analytics data...</p>
        </div>
      ) : weatherData.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No analytics data available. Add some weather data first.
        </div>
      ) : (
        <>
          {/* Volatility Analysis */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Volatility Analysis
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Overall Volatility Score
                </span>
                <div className="flex items-center space-x-2">
                  <VolatilityIndicator value={volatility} size="md" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {volatility.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Data Points Analyzed</span>
                  <span className="font-medium">{weatherData.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Time Period</span>
                  <span className="font-medium">
                    {timeRange === 'week' ? '7 days' : timeRange === 'month' ? '30 days' : '365 days'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Temperature Trends */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Temperature Trends
            </h2>
            <div className="h-64 flex items-end space-x-2">
              {trends.map((trend, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div 
                    className="w-full bg-blue-500 rounded-t-md"
                    style={{ height: `${(trend.avgTemp / 40) * 100}%` }}
                  >
                    <div className="text-xs text-white text-center pt-1">
                      {trend.avgTemp.toFixed(0)}°C
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Average Temperature
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {trends.length > 0 
                  ? (trends.reduce((sum, t) => sum + t.avgTemp, 0) / trends.length).toFixed(1)
                  : '0.0'}°C
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Average Humidity
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {trends.length > 0 
                  ? (trends.reduce((sum, t) => sum + t.avgHumidity, 0) / trends.length).toFixed(1)
                  : '0.0'}%
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Data Coverage
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {weatherData.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total readings analyzed
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;