import localforage from 'localforage';

// Initialize a specific instance of localforage if needed
localforage.config({
  name: 'myApp',
});

const localForageUtil = {
  setItem: async (key, value) => {
    try {
      await localforage.setItem(key, value);
      console.log(`Data saved: ${key}`);
    } catch (err) {
      console.error(`Error saving data for key ${key}:`, err);
    }
  },

  getItem: async (key) => {
    try {
      const value = await localforage.getItem(key);
      return value;
    } catch (err) {
      console.error(`Error retrieving data for key ${key}:`, err);
      return null;
    }
  },

  removeItem: async (key) => {
    try {
      await localforage.removeItem(key);
      console.log(`Data removed: ${key}`);
    } catch (err) {
      console.error(`Error removing data for key ${key}:`, err);
    }
  },

  clear: async () => {
    try {
      await localforage.clear();
      console.log('All data cleared');
    } catch (err) {
      console.error('Error clearing data:', err);
    }
  },
};

export default localForageUtil;
