import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const SupabaseStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [locationCount, setLocationCount] = useState<number>(0);
  const [readingCount, setReadingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    
    try {
      // Check locations count
      const { count: locCount, error: locError } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true });
      
      // Check readings count
      const { count: readCount, error: readError } = await supabase
        .from('weather_readings')
        .select('*', { count: 'exact', head: true });

      if (locError || readError) {
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setLocationCount(locCount || 0);
        setReadingCount(readCount || 0);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="inline-flex items-center text-sm text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
        Checking database...
      </div>
    );
  }

  if (isConnected === false) {
    return (
      <div className="inline-flex items-center text-sm text-red-600">
        <span className="mr-2">⚠️</span>
        Database connection failed
      </div>
    );
  }

  return (
    <div className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
      <span className="mr-2 text-green-500">✓</span>
      Connected: {locationCount} locations, {readingCount} readings
    </div>
  );
};