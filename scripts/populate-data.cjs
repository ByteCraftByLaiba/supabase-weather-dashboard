// Simple Node.js script to populate data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Create a .env file with:');
  console.error('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  try {
    // Delete in correct order (due to foreign key constraints)
    await supabase.from('weather_readings').delete().neq('id', 0);
    await supabase.from('locations').delete().neq('id', 0);
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error.message);
  }
}

async function populateSimpleData() {
  console.log('🚀 Starting simple data population...\n');
  
  // Clear existing data first
  await clearExistingData();
  
  // Create 3 sample locations
  console.log('📍 Creating sample locations...');
  const locations = [
    { 
      name: 'Headquarters', 
      latitude: 40.7128, 
      longitude: -74.0060, 
      elevation: 10, 
      timezone: 'America/New_York' 
    },
    { 
      name: 'East Station', 
      latitude: 40.7589, 
      longitude: -73.9851, 
      elevation: 15, 
      timezone: 'America/New_York' 
    },
    { 
      name: 'West Station', 
      latitude: 40.7831, 
      longitude: -73.9712, 
      elevation: 20, 
      timezone: 'America/New_York' 
    },
  ];

  const { data: locationData, error: locationError } = await supabase
    .from('locations')
    .insert(locations)
    .select('id, name');

  if (locationError) {
    console.error('❌ Error creating locations:', locationError.message);
    return;
  }

  console.log(`✅ Created ${locationData.length} locations`);
  locationData.forEach(loc => console.log(`   - ${loc.name} (ID: ${loc.id})`));
  console.log();
  
  // Create 7 days of sample data (more interesting for the dashboard)
  console.log('🌤️  Creating sample weather readings (7 days of data)...');
  const now = new Date();
  const weatherReadings = [];
  
  locationData.forEach(location => {
    // Create data for the last 7 days
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const recordedAt = new Date(now);
        recordedAt.setDate(recordedAt.getDate() - (6 - day));
        recordedAt.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
        
        // Generate realistic data with daily patterns
        const baseTemp = 20; // Base temperature
        const dayOfWeekVariation = Math.sin((day - 3.5) * Math.PI / 7) * 5; // Weekly pattern
        const hourTempVariation = Math.sin((hour - 14) * Math.PI / 24) * 8; // Daily pattern
        const locationVariation = location.name.includes('East') ? 1 : 
                                 location.name.includes('West') ? -1 : 0;
        
        const temperature_c = baseTemp + dayOfWeekVariation + hourTempVariation + locationVariation + (Math.random() - 0.5) * 3;
        const humidity_percent = 60 - hourTempVariation * 1.5 + (Math.random() - 0.5) * 10;
        
        weatherReadings.push({
          location_id: location.id,
          recorded_at: recordedAt.toISOString(),
          temperature_c: parseFloat(temperature_c.toFixed(1)),
          humidity_percent: parseFloat(Math.max(30, Math.min(90, humidity_percent)).toFixed(1)),
          pressure_hpa: parseFloat((1013 + (Math.random() - 0.5) * 10 + dayOfWeekVariation).toFixed(1)),
          wind_speed_ms: parseFloat((5 + Math.sin(hour * Math.PI / 12) * 8 + Math.random() * 3).toFixed(1)),
          wind_direction_deg: Math.floor(Math.random() * 360),
          precipitation_mm: hour >= 6 && hour <= 18 && Math.random() > 0.9 ? 
                           parseFloat((Math.random() * 3).toFixed(1)) : 0,
        });
      }
    }
  });

  console.log(`Generated ${weatherReadings.length} weather readings`);
  
  // Insert in batches of 500 to avoid timeouts
  const batchSize = 500;
  let insertedCount = 0;
  
  for (let i = 0; i < weatherReadings.length; i += batchSize) {
    const batch = weatherReadings.slice(i, i + batchSize);
    const { error: weatherError } = await supabase
      .from('weather_readings')
      .insert(batch);

    if (weatherError) {
      console.error(`❌ Error creating weather readings batch ${Math.floor(i/batchSize) + 1}:`, weatherError.message);
      return;
    }
    
    insertedCount += batch.length;
    console.log(`   Inserted ${insertedCount}/${weatherReadings.length} records...`);
  }
  
  console.log(`✅ Successfully inserted ${weatherReadings.length} weather readings`);
  
  // Display summary
  console.log('\n📊 Data Summary:');
  console.log('================');
  console.log(`Locations: ${locationData.length}`);
  console.log(`Weather readings: ${weatherReadings.length} (7 days × 24 hours × ${locationData.length} locations)`);
  console.log('\n📈 Sample data points per location:');
  
  // Show some sample data for each location
  for (const location of locationData) {
    const { data: latestReading } = await supabase
      .from('weather_readings')
      .select('*')
      .eq('location_id', location.id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
    
    if (latestReading) {
      console.log(`\n📍 ${location.name}:`);
      console.log(`   Latest reading: ${new Date(latestReading.recorded_at).toLocaleString()}`);
      console.log(`   Temperature: ${latestReading.temperature_c}°C`);
      console.log(`   Humidity: ${latestReading.humidity_percent}%`);
      console.log(`   Pressure: ${latestReading.pressure_hpa} hPa`);
    }
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:5173 (or your dev server URL)');
  console.log('3. Check the dashboard to see your data!');
}

// Run the script
populateSimpleData().catch(console.error);