import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import localforage from 'localforage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Menu from '../components/layout/Menu';

const Settings = () => {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const storedSettings = await localforage.getItem('settings');
      return storedSettings || { theme: 'light', notifications: true };
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      await localforage.setItem('settings', newSettings);
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleSettingChange = (key, value) => {
    if (settings) {
      updateSettingsMutation.mutate({ ...settings, [key]: value });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error?.message || 'Error loading settings'} />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="w-full md:w-64 bg-white shadow-md p-4 md:h-screen md:overflow-y-auto">
        <Menu />
      </aside>
      {/* // <div className="p-4"> */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <label className="block mb-2">
          Theme:
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="ml-2 p-2 border rounded"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => handleSettingChange('notifications', e.target.checked)}
            className="mr-2"
          />
          Enable Notifications
        </label>
      </div>
      {updateSettingsMutation.isError && (
        <ErrorMessage
          message={updateSettingsMutation.error?.message || 'Error updating settings'}
        />
      )}
      {updateSettingsMutation.isSuccess && (
        <div className="mt-4 text-green-600">Settings updated successfully</div>
      )}
    </div>
  );
};

export default Settings;
