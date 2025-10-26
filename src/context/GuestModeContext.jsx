/**
 * Guest Mode Context
 *
 * Provides guest mode functionality that works entirely without a backend.
 * All data is stored in localStorage and syncs when user logs in.
 */

import { createContext, useContext, useState, useEffect } from 'react';

const GuestModeContext = createContext();

// Generate UUID without external dependency
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// LocalStorage keys
const STORAGE_KEYS = {
  GUEST_MODE: 'mellifera_guest_mode',
  GUEST_DATA: 'mellifera_guest_data',
  GUEST_ID: 'mellifera_guest_id',
};

// Initialize guest data structure
const initializeGuestData = () => ({
  apiaries: [],
  hives: [],
  inspections: [],
  treatments: [],
  feedings: [],
  equipment: [],
  lastSync: null,
});

export function GuestModeProvider({ children }) {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestData, setGuestData] = useState(initializeGuestData());
  const [guestId, setGuestId] = useState(null);

  // Load guest mode state on mount
  useEffect(() => {
    const savedGuestMode = localStorage.getItem(STORAGE_KEYS.GUEST_MODE);
    const savedGuestData = localStorage.getItem(STORAGE_KEYS.GUEST_DATA);
    const savedGuestId = localStorage.getItem(STORAGE_KEYS.GUEST_ID);

    if (savedGuestMode === 'true') {
      setIsGuestMode(true);
      if (savedGuestData) {
        try {
          setGuestData(JSON.parse(savedGuestData));
        } catch (error) {
          console.error('Error parsing guest data:', error);
          setGuestData(initializeGuestData());
        }
      }
      if (savedGuestId) {
        setGuestId(savedGuestId);
      } else {
        const newGuestId = generateUUID();
        setGuestId(newGuestId);
        localStorage.setItem(STORAGE_KEYS.GUEST_ID, newGuestId);
      }
    }
  }, []);

  // Save guest data whenever it changes
  useEffect(() => {
    if (isGuestMode) {
      localStorage.setItem(STORAGE_KEYS.GUEST_DATA, JSON.stringify(guestData));
    }
  }, [guestData, isGuestMode]);

  // Enable guest mode
  const enableGuestMode = () => {
    const newGuestId = generateUUID();
    setIsGuestMode(true);
    setGuestId(newGuestId);
    setGuestData(initializeGuestData());
    localStorage.setItem(STORAGE_KEYS.GUEST_MODE, 'true');
    localStorage.setItem(STORAGE_KEYS.GUEST_ID, newGuestId);
  };

  // Disable guest mode (when user logs in)
  const disableGuestMode = () => {
    setIsGuestMode(false);
    localStorage.removeItem(STORAGE_KEYS.GUEST_MODE);
    // Keep guest data for potential sync
  };

  // Clear all guest data
  const clearGuestData = () => {
    setGuestData(initializeGuestData());
    localStorage.removeItem(STORAGE_KEYS.GUEST_DATA);
    localStorage.removeItem(STORAGE_KEYS.GUEST_ID);
    setGuestId(null);
  };

  // Generic CRUD operations for guest mode
  const guestOperations = {
    // Create
    create: (collection, item) => {
      const newItem = {
        ...item,
        _id: item._id || generateUUID(),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guestId,
      };
      
      setGuestData(prev => ({
        ...prev,
        [collection]: [...prev[collection], newItem],
      }));
      
      return newItem;
    },

    // Read all
    getAll: (collection) => {
      return guestData[collection] || [];
    },

    // Read one
    getById: (collection, id) => {
      return guestData[collection]?.find(item => item._id === id);
    },

    // Update
    update: (collection, id, updates) => {
      setGuestData(prev => ({
        ...prev,
        [collection]: prev[collection].map(item =>
          item._id === id
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        ),
      }));
    },

    // Delete
    delete: (collection, id) => {
      setGuestData(prev => ({
        ...prev,
        [collection]: prev[collection].filter(item => item._id !== id),
      }));
    },

    // Query with filter
    query: (collection, filterFn) => {
      return (guestData[collection] || []).filter(filterFn);
    },
  };

  // Export guest data for sync
  const exportGuestData = () => {
    return {
      guestId,
      data: guestData,
      exportedAt: new Date().toISOString(),
    };
  };

  // Import data after sync
  const importSyncedData = (syncedData) => {
    setGuestData(prev => ({
      ...prev,
      ...syncedData,
      lastSync: new Date().toISOString(),
    }));
  };

  const value = {
    isGuestMode,
    guestId,
    guestData,
    enableGuestMode,
    disableGuestMode,
    clearGuestData,
    guestOperations,
    exportGuestData,
    importSyncedData,
  };

  return (
    <GuestModeContext.Provider value={value}>
      {children}
    </GuestModeContext.Provider>
  );
}

export function useGuestMode() {
  const context = useContext(GuestModeContext);
  if (!context) {
    throw new Error('useGuestMode must be used within GuestModeProvider');
  }
  return context;
}