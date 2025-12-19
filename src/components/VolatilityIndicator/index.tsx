import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';

interface VolatilityIndicatorProps {
  value: number;
  threshold?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  showTooltip?: boolean;
}

export const VolatilityIndicator: React.FC<VolatilityIndicatorProps> = ({
  value,
  threshold = 5,
  size = 'md',
  showLabel = false,
  className = '',
  showTooltip = true,
}) => {
  const isHighVolatility = value > threshold;
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };
  
  const label = isHighVolatility ? 'High Volatility' : 'Low Volatility';
  const color = isHighVolatility ? 'bg-red-500' : 'bg-green-500';
  const pulseClass = isHighVolatility ? 'animate-pulse' : '';
  
  const tooltipContent = (
    <div className="max-w-xs">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-sm">
        Volatility score: <span className="font-medium">{value.toFixed(2)}</span> 
        {threshold && <span className="text-gray-500"> (threshold: {threshold})</span>}
      </p>
      {isHighVolatility ? (
        <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
          This indicates significant fluctuations in weather conditions. 
          High volatility can affect forecasting accuracy and may indicate:
          <ul className="list-disc list-inside mt-1 text-xs">
            <li>Rapid temperature changes</li>
            <li>Unstable atmospheric pressure</li>
            <li>Variable wind patterns</li>
            <li>Potential for severe weather</li>
          </ul>
        </p>
      ) : (
        <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
          Weather conditions are stable with minimal fluctuations.
        </p>
      )}
    </div>
  );

  const indicator = (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${color} ${pulseClass} rounded-full`}
        title={showTooltip ? undefined : label}
      />
      {showLabel && (
        <span className={`text-sm font-medium ${
          isHighVolatility ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'
        }`}>
          {label}
        </span>
      )}
    </div>
  );

  // Always show tooltip when showTooltip is true (default)
  if (showTooltip) {
    return <Tooltip content={tooltipContent}>{indicator}</Tooltip>;
  }

  return indicator;
};

// Utility function to calculate volatility from weather readings
export const calculateVolatility = (readings: number[]): number => {
  if (readings.length < 2) return 0;
  
  const mean = readings.reduce((sum, val) => sum + val, 0) / readings.length;
  const variance = readings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / readings.length;
  
  return Math.sqrt(variance);
};

// Utility function to calculate volatility score from multiple metrics
export const calculateWeatherVolatility = (metrics: {
  temperature?: number[];
  humidity?: number[];
  pressure?: number[];
  windSpeed?: number[];
}): number => {
  const volatilities: number[] = [];
  const weights = { temperature: 0.4, humidity: 0.2, pressure: 0.2, windSpeed: 0.2 };
  
  if (metrics.temperature && metrics.temperature.length > 1) {
    const tempVol = calculateVolatility(metrics.temperature);
    console.log('Temperature volatility:', tempVol);
    volatilities.push(tempVol * weights.temperature);
  }
  
  if (metrics.humidity && metrics.humidity.length > 1) {
    const humidityVol = calculateVolatility(metrics.humidity);
    console.log('Humidity volatility:', humidityVol);
    volatilities.push(humidityVol * weights.humidity);
  }
  
  if (metrics.pressure && metrics.pressure.length > 1) {
    const pressureVol = calculateVolatility(metrics.pressure);
    console.log('Pressure volatility:', pressureVol);
    volatilities.push(pressureVol * weights.pressure);
  }
  
  if (metrics.windSpeed && metrics.windSpeed.length > 1) {
    const windVol = calculateVolatility(metrics.windSpeed);
    console.log('Wind speed volatility:', windVol);
    volatilities.push(windVol * weights.windSpeed);
  }
  
  const totalVolatility = volatilities.length > 0 
    ? volatilities.reduce((sum, vol) => sum + vol, 0) 
    : 0;
  
  console.log('Total calculated volatility:', totalVolatility);
  return totalVolatility;
};