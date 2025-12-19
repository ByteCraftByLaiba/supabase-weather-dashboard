import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HeaderNav } from '@/components/Header_Nav';
import Dashboard from '@/pages/Dashboard';
import Locations from '@/pages/Locations';
import WeatherData from '@/pages/WeatherData';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import { User } from '@/types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Mock user authentication
    const mockUser: User = {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    };
    setUser(mockUser);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const headerNavProps = {
    user,
    darkMode: {
      isDarkMode,
      toggleDarkMode,
    },
    companyName: 'Weather Analytics',
    className: 'shadow-sm'
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <HeaderNav {...headerNavProps} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/weather-data" element={<WeatherData />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;