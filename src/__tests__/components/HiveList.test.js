import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HiveList from '../../pages/HiveList';
import { useHives, useCreateHive, useUpdateHive, useDeleteHive } from '../../hooks/useHives';

jest.mock('../../hooks/useHives');

const mockHives = [
  { _id: '1', name: 'Hive 1', queenId: 'Q1', status: 'Active', notes: 'Test hive 1', children: [] },
  { _id: '2', name: 'Hive 2', queenId: 'Q2', status: 'Inactive', notes: 'Test hive 2', children: [] },
];

const queryClient = new QueryClient();

const renderWithProviders = (ui, { route = '/apiaries/1/hives' } = {}) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Route path="/apiaries/:apiaryId/hives">{ui}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('HiveList', () => {
  beforeEach(() => {
    useHives.mockReturnValue({
      data: { pages: [{ hives: mockHives, totalHives: 2 }] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      status: 'success',
    });
    useCreateHive.mockReturnValue({ mutate: jest.fn() });
    useUpdateHive.mockReturnValue({ mutate: jest.fn() });
    useDeleteHive.mockReturnValue({ mutate: jest.fn() });
  });

  it('renders the list of hives', async () => {
    renderWithProviders(<HiveList />);

    await waitFor(() => {
      expect(screen.getByText('2 Hives')).toBeInTheDocument();
      expect(screen.getByText('Hive 1')).toBeInTheDocument();
      expect(screen.getByText('Hive 2')).toBeInTheDocument();
    });
  });

  it('opens the create hive modal when clicking the create button', async () => {
    renderWithProviders(<HiveList />);

    const createButton = screen.getByText('Create New Hive');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Hive')).toBeInTheDocument();
      expect(screen.getByLabelText('Name:')).toBeInTheDocument();
      expect(screen.getByLabelText('Queen ID:')).toBeInTheDocument();
      expect(screen.getByLabelText('Status:')).toBeInTheDocument();
      expect(screen.getByLabelText('Notes:')).toBeInTheDocument();
    });
  });

  it('creates a new hive when submitting the form', async () => {
    const mockCreateHive = jest.fn();
    useCreateHive.mockReturnValue({ mutate: mockCreateHive });

    renderWithProviders(<HiveList />);

    const createButton = screen.getByText('Create New Hive');
    fireEvent.click(createButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Name:');
      const queenIdInput = screen.getByLabelText('Queen ID:');
      const statusInput = screen.getByLabelText('Status:');
      const notesInput = screen.getByLabelText('Notes:');

      userEvent.type(nameInput, 'New Hive');
      userEvent.type(queenIdInput, 'Q3');
      userEvent.type(statusInput, 'Active');
      userEvent.type(notesInput, 'Test new hive');

      const submitButton = screen.getByText('Create Hive');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockCreateHive).toHaveBeenCalledWith(
        expect.objectContaining({
          apiaryId: '1',
          hiveData: expect.objectContaining({
            name: 'New Hive',
            queenId: 'Q3',
            status: 'Active',
            notes: 'Test new hive',
          }),
        }),
        expect.anything()
      );
    });
  });

  it('displays loading state', () => {
    useHives.mockReturnValue({
      data: null,
      status: 'loading',
    });

    renderWithProviders(<HiveList />);

    expect(screen.getByText('Loading hives...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    useHives.mockReturnValue({
      data: null,
      status: 'error',
      error: { message: 'Failed to fetch hives' },
    });

    renderWithProviders(<HiveList />);

    expect(screen.getByText('Error: Failed to fetch hives')).toBeInTheDocument();
  });

  it('displays empty state when no hives', () => {
    useHives.mockReturnValue({
      data: { pages: [{ hives: [], totalHives: 0 }] },
      status: 'success',
    });

    renderWithProviders(<HiveList />);

    expect(screen.getByText('No hives found. Create a new hive to get started.')).toBeInTheDocument();
  });
});
