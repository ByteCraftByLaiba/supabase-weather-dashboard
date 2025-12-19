import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { User, NavigationItem } from '@/types';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';
import { SupabaseStatus } from '@/components/SupabaseStatus';

interface HeaderNavProps {
  user: User | null;
  logoUrl?: string;
  companyName?: string;
  navigationItems?: NavigationItem[];
  className?: string;
  darkMode?: {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
  };
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  user,
  logoUrl = '/logo.webp',
  companyName = 'Weather Dashboard',
  navigationItems = defaultNavigationItems,
  className = '',
  darkMode,
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 ${className}`}>
      <div className="container space-x-5">

        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <img 
              src={logoUrl} 
              alt={`${companyName} Logo`}
              className="h-8 w-auto"
            />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              {companyName}
            </span>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* User & Action Section */}
          <div className="flex items-center space-x-4">
            {darkMode && (
              <button
                onClick={darkMode.toggleDarkMode}
                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={darkMode.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode.isDarkMode ? '🌞' : '🌙'}
              </button>
            )}

            <div className="hidden md:block">
              <Breadcrumbs />
            </div>
            <div className="hidden lg:block">
              <SupabaseStatus />
            </div>

            <UserMenu user={user} />

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✖️' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="mt-3 flex flex-col space-y-1 md:hidden">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </a>
            ))}
            {/* Mobile breadcrumbs */}
            <div className="mt-2">
              <Breadcrumbs />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

// Default navigation items
const defaultNavigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Locations', href: '/locations' },
  { label: 'Weather Data', href: '/weather-data' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Settings', href: '/settings' },
];
