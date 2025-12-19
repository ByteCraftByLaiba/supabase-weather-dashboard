import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import type { Database } from '@/types/database.types';

export type Location =
  Database['public']['Tables']['locations']['Row'];

export type WeatherReading =
  Database['public']['Tables']['weather_readings']['Row'];

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    latitude: '',
    longitude: '',
    elevation: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insertError, setInsertError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch locations: ${error.message}`);
      }
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInsertError(null);
    
    try {
      // Validate inputs
      if (!newLocation.name.trim()) {
        throw new Error('Location name is required');
      }
      
      const latitude = parseFloat(newLocation.latitude);
      const longitude = parseFloat(newLocation.longitude);
      
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        throw new Error('Valid latitude is required (-90 to 90)');
      }
      
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        throw new Error('Valid longitude is required (-180 to 180)');
      }
      
      const locationData: Database['public']['Tables']['locations']['Insert'] = {
        name: newLocation.name.trim(),
        latitude,
        longitude,
        elevation: newLocation.elevation ? parseInt(newLocation.elevation) : null,
        timezone: newLocation.timezone,
      };

      console.log('Inserting location:', locationData);

      // Type-safe insert
      const { data, error } = await supabase
        .from('locations')
        .insert(locationData) // No array wrapper needed for single insert
        .select()
        .single();

      if (error) throw error;
      
      // Reset form and refresh
      setNewLocation({
        name: '',
        latitude: '',
        longitude: '',
        elevation: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      
      await fetchLocations();
      alert(`Location "${data.name}" added successfully!`);
    } catch (error) {
      console.error('Error adding location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add location';
      setInsertError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location? All weather data for this location will also be deleted.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchLocations();
      alert('Location deleted successfully!');
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Failed to delete location. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Locations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage weather stations
          </p>
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
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Weather Stations ({locations.length})
            </h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading locations...</p>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No locations found. Add your first weather station below.
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
                        Coordinates
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Elevation
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timezone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {locations.map((location) => (
                      <tr key={location.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                {location.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {location.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Added {location.created_at
                                        ? new Date(location.created_at).toLocaleDateString()
                                        : "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {location.elevation || 'N/A'} m
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {location.timezone || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => handleDelete(location.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Location
            </h2>
            
            {insertError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400">{insertError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Central Weather Station"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLocation.latitude}
                    onChange={(e) => setNewLocation({...newLocation, latitude: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="40.7128"
                    min="-90"
                    max="90"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLocation.longitude}
                    onChange={(e) => setNewLocation({...newLocation, longitude: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="-74.0060"
                    min="-180"
                    max="180"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Elevation (meters)
                </label>
                <input
                  type="number"
                  value={newLocation.elevation}
                  onChange={(e) => setNewLocation({...newLocation, elevation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  value={newLocation.timezone}
                  onChange={(e) => setNewLocation({...newLocation, timezone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone} (Auto-detected)
                  </option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="Australia/Sydney">Australia/Sydney</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : 'Add Location'}
              </button>
            </form>
          </div>
          
          {/* Debug Info */}
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Debug Info</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Total Locations: {locations.length}</p>
            <p className="text-gray-600 dark:text-gray-400">Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;