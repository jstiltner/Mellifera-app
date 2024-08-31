import React, { useState } from 'react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // TODO: Implement dark mode functionality
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // TODO: Implement notifications functionality
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            className={`${
              darkMode ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
          >
            <span
              className={`${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span>Enable Notifications</span>
          <button
            onClick={toggleNotifications}
            className={`${
              notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
          >
            <span
              className={`${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
