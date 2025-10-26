/**
 * Guest Mode Banner Component
 *
 * Displays a banner when user is in guest mode, with option to create account.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestMode } from '../../context/GuestModeContext';

export default function GuestModeBanner() {
  const navigate = useNavigate();
  const { isGuestMode, guestData, exportGuestData, clearGuestData } = useGuestMode();
  const [showDetails, setShowDetails] = useState(false);

  if (!isGuestMode) return null;

  // Count items in guest data
  const itemCounts = {
    apiaries: guestData.apiaries?.length || 0,
    hives: guestData.hives?.length || 0,
    inspections: guestData.inspections?.length || 0,
    treatments: guestData.treatments?.length || 0,
    feedings: guestData.feedings?.length || 0,
  };

  const totalItems = Object.values(itemCounts).reduce((sum, count) => sum + count, 0);

  const handleCreateAccount = () => {
    // Export data for potential sync
    const exportedData = exportGuestData();
    sessionStorage.setItem('guestDataForSync', JSON.stringify(exportedData));
    navigate('/register?from=guest');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all guest data? This cannot be undone.')) {
      clearGuestData();
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-400 dark:text-amber-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Guest Mode Active
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            <p>
              You're using Mellifera in guest mode. Your data is stored locally in your browser.
              {totalItems > 0 && ` You have ${totalItems} item${totalItems !== 1 ? 's' : ''} saved.`}
            </p>

            {showDetails && totalItems > 0 && (
              <div className="mt-2 text-xs space-y-1">
                <p className="font-medium">Saved data:</p>
                <ul className="list-disc list-inside ml-2">
                  {itemCounts.apiaries > 0 && <li>{itemCounts.apiaries} apiary/apiaries</li>}
                  {itemCounts.hives > 0 && <li>{itemCounts.hives} hive(s)</li>}
                  {itemCounts.inspections > 0 && <li>{itemCounts.inspections} inspection(s)</li>}
                  {itemCounts.treatments > 0 && <li>{itemCounts.treatments} treatment(s)</li>}
                  {itemCounts.feedings > 0 && <li>{itemCounts.feedings} feeding(s)</li>}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleCreateAccount}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-700 dark:text-amber-200 bg-amber-100 dark:bg-amber-800 hover:bg-amber-200 dark:hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create Account to Sync
            </button>

            {totalItems > 0 && (
              <button
                onClick={handleClearData}
                className="inline-flex items-center px-3 py-1.5 border border-amber-300 dark:border-amber-600 text-xs font-medium rounded-md text-amber-700 dark:text-amber-200 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear Data
              </button>
            )}
          </div>

          <div className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            <p>⚠️ Guest data is stored in your browser and will be lost if you clear browser data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}