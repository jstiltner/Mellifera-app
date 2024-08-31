import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HiveProvider, useHive } from '../context/HiveContext';
import { useCreateHive, useUpdateHive, useDeleteHive } from '../hooks/useHives';

jest.mock('../hooks/useHives', () => ({
  useCreateHive: jest.fn(),
  useUpdateHive: jest.fn(),
  useDeleteHive: jest.fn(),
}));

const queryClient = new QueryClient();

const TestComponent = () => {
  const { hives, addHive, updateHive, deleteHive } = useHive();
  return (
    <div>
      <span data-testid="hive-count">{hives.length}</span>
      <button onClick={() => addHive({ id: 'test-hive', name: 'Test Hive' })}>Add Hive</button>
      <button onClick={() => updateHive({ id: 'test-hive', name: 'Updated Hive' })}>Update Hive</button>
      <button onClick={() => deleteHive('test-hive')}>Delete Hive</button>
    </div>
  );
};

const renderWithProviders = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <HiveProvider>{ui}</HiveProvider>
    </QueryClientProvider>
  );
};

describe('HiveContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('provides initial empty hives array', () => {
    const { getByTestId } = renderWithProviders(<TestComponent />);
    expect(getByTestId('hive-count')).toHaveTextContent('0');
  });

  it('adds a new hive', async () => {
    const mockCreateHive = jest.fn().mockResolvedValue({ id: 'test-hive', name: 'Test Hive' });
    useCreateHive.mockReturnValue({ mutate: mockCreateHive });

    const { getByText, getByTestId } = renderWithProviders(<TestComponent />);
    const addButton = getByText('Add Hive');

    await act(async () => {
      addButton.click();
    });

    await waitFor(() => {
      expect(mockCreateHive).toHaveBeenCalledWith(
        { id: 'test-hive', name: 'Test Hive' },
        expect.anything()
      );
      expect(getByTestId('hive-count')).toHaveTextContent('1');
    });
  });

  it('updates an existing hive', async () => {
    const mockUpdateHive = jest.fn().mockResolvedValue({ id: 'test-hive', name: 'Updated Hive' });
    useUpdateHive.mockReturnValue({ mutate: mockUpdateHive });

    const { getByText } = renderWithProviders(<TestComponent />);
    const updateButton = getByText('Update Hive');

    await act(async () => {
      updateButton.click();
    });

    await waitFor(() => {
      expect(mockUpdateHive).toHaveBeenCalledWith(
        { id: 'test-hive', name: 'Updated Hive' },
        expect.anything()
      );
    });
  });

  it('deletes a hive', async () => {
    const mockDeleteHive = jest.fn().mockResolvedValue({ id: 'test-hive' });
    useDeleteHive.mockReturnValue({ mutate: mockDeleteHive });

    const { getByText, getByTestId } = renderWithProviders(<TestComponent />);
    const deleteButton = getByText('Delete Hive');

    await act(async () => {
      deleteButton.click();
    });

    await waitFor(() => {
      expect(mockDeleteHive).toHaveBeenCalledWith('test-hive', expect.anything());
      expect(getByTestId('hive-count')).toHaveTextContent('0');
    });
  });

  it('handles errors when adding a hive', async () => {
    const mockCreateHive = jest.fn().mockRejectedValue(new Error('Failed to add hive'));
    useCreateHive.mockReturnValue({ mutate: mockCreateHive });

    const { getByText } = renderWithProviders(<TestComponent />);
    const addButton = getByText('Add Hive');

    await act(async () => {
      addButton.click();
    });

    await waitFor(() => {
      expect(mockCreateHive).toHaveBeenCalled();
    });

    // You might want to add assertions here to check if an error message is displayed
    // or if the error is handled appropriately in your UI
  });

  it('handles errors when updating a hive', async () => {
    const mockUpdateHive = jest.fn().mockRejectedValue(new Error('Failed to update hive'));
    useUpdateHive.mockReturnValue({ mutate: mockUpdateHive });

    const { getByText } = renderWithProviders(<TestComponent />);
    const updateButton = getByText('Update Hive');

    await act(async () => {
      updateButton.click();
    });

    await waitFor(() => {
      expect(mockUpdateHive).toHaveBeenCalled();
    });

    // Add assertions for error handling in your UI
  });

  it('handles errors when deleting a hive', async () => {
    const mockDeleteHive = jest.fn().mockRejectedValue(new Error('Failed to delete hive'));
    useDeleteHive.mockReturnValue({ mutate: mockDeleteHive });

    const { getByText } = renderWithProviders(<TestComponent />);
    const deleteButton = getByText('Delete Hive');

    await act(async () => {
      deleteButton.click();
    });

    await waitFor(() => {
      expect(mockDeleteHive).toHaveBeenCalled();
    });

    // Add assertions for error handling in your UI
  });
});
