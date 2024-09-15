import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { useFeedings } from '../../hooks/useFeedings';

jest.mock('axios');

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useFeedings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch feedings', async () => {
    const mockFeedings = [
      { id: '1', date: '2023-05-01', type: '1:1 Syrup', amount: 1, units: 'liters' },
    ];
    axios.get.mockResolvedValue({ data: mockFeedings });

    const { result, waitFor } = renderHook(() => useFeedings(), { wrapper });

    await act(async () => {
      const feedings = await result.current.getFeedings('hive1');
      expect(feedings).toEqual(mockFeedings);
    });

    expect(axios.get).toHaveBeenCalledWith('/api/feedings/hive/hive1');
  });

  it('should add a feeding', async () => {
    const newFeeding = {
      hiveId: 'hive1',
      date: '2023-05-01',
      type: '1:1 Syrup',
      amount: 1,
      units: 'liters',
    };
    const mockResponse = { ...newFeeding, id: '1' };
    axios.post.mockResolvedValue({ data: mockResponse });

    const { result, waitFor } = renderHook(() => useFeedings(), { wrapper });

    await act(async () => {
      await result.current.addFeeding(newFeeding);
    });

    expect(axios.post).toHaveBeenCalledWith('/api/feedings', newFeeding);
  });

  it('should update a feeding', async () => {
    const updatedFeeding = {
      id: '1',
      date: '2023-05-02',
      type: '2:1 Syrup',
      amount: 2,
      units: 'liters',
    };
    axios.patch.mockResolvedValue({ data: updatedFeeding });

    const { result, waitFor } = renderHook(() => useFeedings(), { wrapper });

    await act(async () => {
      await result.current.updateFeeding(updatedFeeding);
    });

    expect(axios.patch).toHaveBeenCalledWith('/api/feedings/1', {
      date: '2023-05-02',
      type: '2:1 Syrup',
      amount: 2,
      units: 'liters',
    });
  });

  it('should delete a feeding', async () => {
    axios.delete.mockResolvedValue({ data: {} });

    const { result, waitFor } = renderHook(() => useFeedings(), { wrapper });

    await act(async () => {
      await result.current.deleteFeeding('1');
    });

    expect(axios.delete).toHaveBeenCalledWith('/api/feedings/1');
  });
});
