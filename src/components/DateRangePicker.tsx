import React, { useState, useEffect } from 'react';

interface DateRangePickerProps {
  onChange: (startDate: Date, endDate: Date) => void;
  defaultRange?: 'last7days' | 'last30days' | 'last90days' | 'ytd' | 'custom';
  className?: string;
  showPresets?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onChange,
  defaultRange = 'last7days',
  className = '',
  showPresets = true,
}) => {
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [rangePreset, setRangePreset] = useState<string>(defaultRange);

  useEffect(() => {
    applyPreset(defaultRange);
  }, []);

  const applyPreset = (preset: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of day
    
    let start = new Date();
    start.setHours(0, 0, 0, 0); // Start of day
    
    switch (preset) {
      case 'last7days':
        start.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        start.setDate(today.getDate() - 30);
        break;
      case 'last90days':
        start.setDate(today.getDate() - 90);
        break;
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }
    
    setStartDate(start);
    setEndDate(today);
    setRangePreset(preset);
    onChange(start, today);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    newStartDate.setHours(0, 0, 0, 0);
    setStartDate(newStartDate);
    setRangePreset('custom');
    onChange(newStartDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    newEndDate.setHours(23, 59, 59, 999);
    setEndDate(newEndDate);
    setRangePreset('custom');
    onChange(startDate, newEndDate);
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const presets = [
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'Last 90 Days', value: 'last90days' },
    { label: 'Year to Date', value: 'ytd' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {showPresets && (
        <>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Date Range
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => applyPreset(preset.value)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  rangePreset === preset.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            max={formatDateForInput(endDate)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            min={formatDateForInput(startDate)}
            max={formatDateForInput(new Date())}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {rangePreset === 'custom' && (
        <div className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          Custom range selected: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
        </div>
      )}
    </div>
  );
};