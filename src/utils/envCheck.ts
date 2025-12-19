export const validateEnvironment = () => {
  const missingVars: string[] = [];
  
  if (!import.meta.env.VITE_SUPABASE_URL) {
    missingVars.push('VITE_SUPABASE_URL');
  }
  
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    missingVars.push('VITE_SUPABASE_ANON_KEY');
  }
  
  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars);
    console.error('Please check your .env file');
    return false;
  }
  
  return true;
};