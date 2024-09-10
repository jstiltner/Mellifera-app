import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import localforage from 'localforage';

const Settings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, isError } = useQuery({
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

  if (isLoading) return <div>Loading settings...</div>;
  if (isError) return <div>Error loading settings</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="mb-4">
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
    </div>
  );
};

export default Settings;
