import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    volatilityAlerts: true,
    dailyReports: false,
    darkMode: false,
    temperatureUnit: 'celsius',
    language: 'english',
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure your weather dashboard preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Notification Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive email alerts for important updates
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Volatility Alerts
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when volatility exceeds thresholds
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('volatilityAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.volatilityAlerts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.volatilityAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Daily Reports
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive daily summary reports
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('dailyReports')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.dailyReports ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.dailyReports ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="card mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Display Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature Unit
                </label>
                <select
                  value={settings.temperatureUnit}
                  onChange={(e) => handleSelectChange('temperatureUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                  <option value="kelvin">Kelvin (K)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSelectChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div>
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
                  JD
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    John Doe
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    john@example.com
                  </p>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="pt-4">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card mt-6 border-red-200 dark:border-red-800">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-4">
              Danger Zone
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Permanently delete your account and all data
                </p>
                <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                  Delete Account
                </button>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Export Data
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Download all your weather data
                </p>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                  Export All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;