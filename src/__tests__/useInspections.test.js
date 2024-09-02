import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import localForage from 'localforage';
import { useInspections, useCreateInspection } from '../hooks/useInspections';

jest.mock('axios');
jest.mock('localforage');

const mockInspections = [
  { id: '1', date: '2023-05-01', notes: 'Healthy hive' },
  { id: '2', date: '2023-05-15', notes: 'Queen spotted' },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useInspections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localForage.createInstance.mockReturnValue({
      getItem: jest.fn(),
      setItem: jest.fn(),
    });
  });

  it('fetches inspections successfully', async () => {
    axios.get.mockResolvedValueOnce({ data: mockInspections });
    const { result, waitFor } = renderHook(() => useInspections('hive1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toEqual(mockInspections);
    expect(axios.get).toHaveBeenCalledWith('/api/hives/hive1/inspections');
  });

  it('returns cached data when offline', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));
    const mockStore = {
      getItem: jest.fn().mockResolvedValueOnce(mockInspections),
      setItem: jest.fn(),
    };
    localForage.createInstance.mockReturnValueOnce(mockStore);

    const originalNavigator = { ...navigator };
    Object.defineProperty(window, 'navigator', {
      value: { onLine: false },
      writable: true,
    });

    const { result, waitFor } = renderHook(() => useInspections('hive1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toEqual(mockInspections);
    expect(mockStore.getItem).toHaveBeenCalledWith('hive_hive1');

    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });
});

describe('useCreateInspection', () => {
  it('creates inspection successfully', async () => {
    const newInspection = { date: '2023-05-30', notes: 'New inspection' };
    const createdInspection = { id: '3', ...newInspection };
    axios.post.mockResolvedValueOnce({ data: createdInspection });

    const { result, waitFor } = renderHook(() => useCreateInspection(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ hiveId: 'hive1', inspectionData: newInspection });
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toEqual(createdInspection);
    expect(axios.post).toHaveBeenCalledWith('/api/hives/hive1/inspections', newInspection);
  });

  it('handles offline creation', async () => {
    const newInspection = { date: '2023-05-30', notes: 'Offline inspection' };
    const mockStore = {
      getItem: jest.fn().mockResolvedValueOnce([]),
      setItem: jest.fn(),
    };
    localForage.createInstance.mockReturnValueOnce(mockStore);

    const originalNavigator = { ...navigator };
    Object.defineProperty(window, 'navigator', {
      value: { onLine: false },
      writable: true,
    });

    const { result, waitFor } = renderHook(() => useCreateInspection(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ hiveId: 'hive1', inspectionData: newInspection });
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toHaveProperty('isOffline', true);
    expect(mockStore.setItem).toHaveBeenCalled();

    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });
});

describe('Offline data syncing', () => {
  it('syncs offline data when coming back online', async () => {
    const offlineInspection = { id: 'offline1', date: '2023-06-01', notes: 'Offline inspection', isOffline: true };
    const syncedInspection = { ...offlineInspection, id: 'synced1', isOffline: false };

    const mockStore = {
      keys: jest.fn().mockResolvedValueOnce(['hive_hive1']),
      getItem: jest.fn().mockResolvedValueOnce([offlineInspection]),
      setItem: jest.fn(),
    };
    localForage.createInstance.mockReturnValueOnce(mockStore);

    axios.post.mockResolvedValueOnce({ data: syncedInspection });

    const onlineEvent = new Event('online');
    window.dispatchEvent(onlineEvent);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(axios.post).toHaveBeenCalledWith('/api/hives/hive1/inspections', offlineInspection);
    expect(mockStore.setItem).toHaveBeenCalledWith('hive_hive1', [syncedInspection]);
  });
});