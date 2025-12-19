-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Locations table
CREATE TABLE locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    elevation INTEGER,
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather readings table with foreign key
CREATE TABLE weather_readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature_c DECIMAL(5, 2),
    humidity_percent DECIMAL(5, 2),
    pressure_hpa DECIMAL(7, 2),
    wind_speed_ms DECIMAL(5, 2),
    wind_direction_deg INTEGER,
    precipitation_mm DECIMAL(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_location_time UNIQUE(location_id, recorded_at)
);

-- Indexes for performance
CREATE INDEX idx_weather_readings_location ON weather_readings(location_id);
CREATE INDEX idx_weather_readings_recorded ON weather_readings(recorded_at);
CREATE INDEX idx_weather_readings_location_recorded ON weather_readings(location_id, recorded_at);

-- RLS Policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_readings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to locations" ON locations
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to weather_readings" ON weather_readings
    FOR SELECT USING (true);

-- For authenticated users to insert/update (adjust as needed)
CREATE POLICY "Allow authenticated users to insert locations" ON locations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert weather_readings" ON weather_readings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);