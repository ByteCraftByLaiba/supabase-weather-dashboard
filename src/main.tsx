import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { validateEnvironment } from './utils/envCheck'
import './style.css'

// Validate environment on startup
if (!validateEnvironment()) {
  console.warn('Supabase environment variables are missing. The app may not function correctly.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)