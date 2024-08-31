import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HiveProvider } from '../context/HiveContext';
import HiveList from '../components/views/HiveList';
import useHives from '../hooks/useHives';
import { useCreateHive, useUpdateHive, useDeleteHive } from '../hooks/useHives';

jest.mock('../hooks/useHives');

const mockHives = [
  { _id: '1', name: 'Hive 1', queenId: 'Q1', status: 'Active', notes: 'Test hive 1' },
  { _id: '2', name: 'Hive 2', queenId: 'Q2', status: 'Inactive', notes: 'Test hive 2' },
];

const queryClient = new QueryClient();

const renderWithProviders = (ui, { route = '/apiaries/1/hives' } = {}) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <HiveProvider>
        <MemoryRouter initialEntries={[route]}>
          <Route path="/apiaries/:apiaryId/hives">{ui}</Route>
        </MemoryRouter>
      </HiveProvider>
    </QueryClientProvider>
  );
};

describe('HiveList', () => {
  beforeEach(() => {
    useHives.mockReturnValue({
      data: { hives: mockHives, totalHives: 2 },
      isLoading: false,
      error: null,
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
      const statusSelect = screen.getByLabelText('Status:');
      const notesInput = screen.getByLabelText('Notes:');

      userEvent.type(nameInput, 'New Hive');
      userEvent.type(queenIdInput, 'Q3');
      userEvent.selectOptions(statusSelect, 'Active');
      userEvent.type(notesInput, 'Test new hive');

      const submitButton = screen.getByText('Create Hive');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockCreateHive).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Hive',
          queenId: 'Q3',
          status: 'Active',
          notes: 'Test new hive',
        }),
        expect.anything()
      );
    });
  });

  it('opens the edit hive modal when clicking the edit button', async () => {
    renderWithProviders(<HiveList />);

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Hive')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Hive 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Q1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Active')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test hive 1')).toBeInTheDocument();
    });
  });

  it('updates a hive when submitting the edit form', async () => {
    const mockUpdateHive = jest.fn();
    useUpdateHive.mockReturnValue({ mutate: mockUpdateHive });

    renderWithProviders(<HiveList />);

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Hive 1');
      const queenIdInput = screen.getByDisplayValue('Q1');
      const statusSelect = screen.getByDisplayValue('Active');
      const notesInput = screen.getByDisplayValue('Test hive 1');

      userEvent.clear(nameInput);
      userEvent.type(nameInput, 'Updated Hive 1');
      userEvent.clear(queenIdInput);
      userEvent.type(queenIdInput, 'Q1-updated');
      userEvent.selectOptions(statusSelect, 'Inactive');
      userEvent.clear(notesInput);
      userEvent.type(notesInput, 'Updated test hive 1');

      const submitButton = screen.getByText('Update Hive');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockUpdateHive).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: '1',
          name: 'Updated Hive 1',
          queenId: 'Q1-updated',
          status: 'Inactive',
          notes: 'Updated test hive 1',
        }),
        expect.anything()
      );
    });
  });

  it('deletes a hive when clicking the delete button', async () => {
    const mockDeleteHive = jest.fn();
    useDeleteHive.mockReturnValue({ mutate: mockDeleteHive });

    renderWithProviders(<HiveList />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this hive?')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteHive).toHaveBeenCalledWith('1', expect.anything());
    });
  });

  it('displays loading state', () => {
    useHives.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<HiveList />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    useHives.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch hives'),
    });

    renderWithProviders(<HiveList />);

    expect(screen.getByText('Error: Failed to fetch hives')).toBeInTheDocument();
  });

  it('displays empty state when no hives', () => {
    useHives.mockReturnValue({
      data: { hives: [], totalHives: 0 },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<HiveList />);

    expect(screen.getByText('No hives found.')).toBeInTheDocument();
  });
});
