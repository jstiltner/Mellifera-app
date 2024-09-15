import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { useTreatments } from '../../hooks/useTreatments';

jest.mock('axios');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useTreatments', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.resetAllMocks();
  });

  it('should fetch treatments by hive', async () => {
    const mockTreatments = [
      { _id: '1', type: 'Varroa', dose: '5ml', date: '2023-05-01' },
      { _id: '2', type: 'Nosema', dose: '10ml', date: '2023-05-15' },
    ];
    axios.get.mockResolvedValueOnce({ data: mockTreatments });

    const { result } = renderHook(() => useTreatments(), { wrapper });

    result.current.getTreatmentsByHive('hive123');

    await waitFor(
      () => expect(result.current.getTreatmentsByHive('hive123').isSuccess).toBe(true),
      { timeout: 2000 }
    );

    expect(axios.get).toHaveBeenCalledWith('/api/treatments/hive123');
    expect(result.current.getTreatmentsByHive('hive123').data).toEqual(mockTreatments);
  });

  it('should create a treatment', async () => {
    const newTreatment = { type: 'Varroa', dose: '5ml', date: '2023-05-01', hiveId: 'hive123' };
    const mockResponse = { ...newTreatment, _id: '3' };
    axios.post.mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => useTreatments(), { wrapper });

    await act(async () => {
      await result.current.createTreatment.mutateAsync(newTreatment);
    });

    await waitFor(() => expect(result.current.createTreatment.isSuccess).toBe(true), {
      timeout: 2000,
    });

    expect(axios.post).toHaveBeenCalledWith('/api/treatments', newTreatment);
    expect(result.current.createTreatment.data).toEqual(mockResponse);
  });

  it('should update a treatment', async () => {
    const updatedTreatment = {
      _id: '1',
      type: 'Varroa',
      dose: '7ml',
      date: '2023-05-02',
      hiveId: 'hive123',
    };
    axios.put.mockResolvedValueOnce({ data: updatedTreatment });

    const { result } = renderHook(() => useTreatments(), { wrapper });

    await act(async () => {
      await result.current.updateTreatment.mutateAsync(updatedTreatment);
    });

    await waitFor(() => expect(result.current.updateTreatment.isSuccess).toBe(true), {
      timeout: 2000,
    });

    expect(axios.put).toHaveBeenCalledWith('/api/treatments/1', updatedTreatment);
    expect(result.current.updateTreatment.data).toEqual(updatedTreatment);
  });

  it('should delete a treatment', async () => {
    const treatmentId = '1';
    axios.delete.mockResolvedValueOnce({ data: { message: 'Treatment deleted successfully' } });

    const { result } = renderHook(() => useTreatments(), { wrapper });

    await act(async () => {
      await result.current.deleteTreatment.mutateAsync(treatmentId);
    });

    await waitFor(() => expect(result.current.deleteTreatment.isSuccess).toBe(true), {
      timeout: 2000,
    });

    expect(axios.delete).toHaveBeenCalledWith(`/api/treatments/${treatmentId}`);
    expect(result.current.deleteTreatment.data).toEqual({
      message: 'Treatment deleted successfully',
    });
  });
});
