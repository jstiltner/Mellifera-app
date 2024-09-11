import { renderHook, act } from '@testing-library/react';
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
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useTreatments', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should fetch treatments by hive', async () => {
    const mockTreatments = [
      { _id: '1', type: 'Varroa', dose: '5ml', date: '2023-05-01' },
      { _id: '2', type: 'Nosema', dose: '10ml', date: '2023-05-15' },
    ];
    axios.get.mockResolvedValueOnce({ data: mockTreatments });

    const { result, waitFor } = renderHook(() => useTreatments(), { wrapper });

    const { getTreatmentsByHive } = result.current;
    const { data: treatments } = getTreatmentsByHive('hive123');

    await waitFor(() => treatments);

    expect(axios.get).toHaveBeenCalledWith('/api/treatments/hive123');
    expect(treatments).toEqual(mockTreatments);
  });

  it('should create a treatment', async () => {
    const newTreatment = { type: 'Varroa', dose: '5ml', date: '2023-05-01', hiveId: 'hive123' };
    const mockResponse = { ...newTreatment, _id: '3' };
    axios.post.mockResolvedValueOnce({ data: mockResponse });

    const { result, waitFor } = renderHook(() => useTreatments(), { wrapper });

    const { createTreatment } = result.current;

    await act(async () => {
      await createTreatment.mutateAsync(newTreatment);
    });

    await waitFor(() => createTreatment.isSuccess);

    expect(axios.post).toHaveBeenCalledWith('/api/treatments', newTreatment);
    expect(createTreatment.data).toEqual(mockResponse);
  });

  it('should update a treatment', async () => {
    const updatedTreatment = { _id: '1', type: 'Varroa', dose: '7ml', date: '2023-05-02', hiveId: 'hive123' };
    axios.put.mockResolvedValueOnce({ data: updatedTreatment });

    const { result, waitFor } = renderHook(() => useTreatments(), { wrapper });

    const { updateTreatment } = result.current;

    await act(async () => {
      await updateTreatment.mutateAsync(updatedTreatment);
    });

    await waitFor(() => updateTreatment.isSuccess);

    expect(axios.put).toHaveBeenCalledWith('/api/treatments/1', updatedTreatment);
    expect(updateTreatment.data).toEqual(updatedTreatment);
  });

  it('should delete a treatment', async () => {
    const treatmentId = '1';
    axios.delete.mockResolvedValueOnce({ data: { message: 'Treatment deleted successfully' } });

    const { result, waitFor } = renderHook(() => useTreatments(), { wrapper });

    const { deleteTreatment } = result.current;

    await act(async () => {
      await deleteTreatment.mutateAsync(treatmentId);
    });

    await waitFor(() => deleteTreatment.isSuccess);

    expect(axios.delete).toHaveBeenCalledWith(`/api/treatments/${treatmentId}`);
    expect(deleteTreatment.data).toEqual({ message: 'Treatment deleted successfully' });
  });
});