import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApiaryList from '../components/views/ApiaryList';
import { useApiaries, useCreateApiary, useUpdateApiary, useDeleteApiary } from '../hooks/useApiaries';

jest.mock('../hooks/useApiaries');

const mockApiaries = [
  { _id: '1', name: 'Apiary 1', location: 'Location 1', hives: [] },
  { _id: '2', name: 'Apiary 2', location: 'Location 2', hives: [{}, {}] },
];

const queryClient = new QueryClient();

const renderWithProviders = (ui, { route = '/apiaries' } = {}) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Route path="/apiaries">{ui}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ApiaryList', () => {
  beforeEach(() => {
    useApiaries.mockReturnValue({
      data: mockApiaries,
      isLoading: false,
      error: null,
    });
    useCreateApiary.mockReturnValue({ mutate: jest.fn() });
    useUpdateApiary.mockReturnValue({ mutate: jest.fn() });
    useDeleteApiary.mockReturnValue({ mutate: jest.fn() });
  });

  it('renders the list of apiaries', async () => {
    renderWithProviders(<ApiaryList />);

    await waitFor(() => {
      expect(screen.getByText('Apiary 1')).toBeInTheDocument();
      expect(screen.getByText('Apiary 2')).toBeInTheDocument();
      expect(screen.getByText('Location: Location 1')).toBeInTheDocument();
      expect(screen.getByText('Location: Location 2')).toBeInTheDocument();
      expect(screen.getByText('0 Hives')).toBeInTheDocument();
      expect(screen.getByText('2 Hives')).toBeInTheDocument();
    });
  });

  it('opens the create apiary modal when clicking the create button', async () => {
    renderWithProviders(<ApiaryList />);

    const createButton = screen.getByText('Create New Apiary');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Apiary')).toBeInTheDocument();
      expect(screen.getByLabelText('Name:')).toBeInTheDocument();
      expect(screen.getByLabelText('Location:')).toBeInTheDocument();
    });
  });

  it('creates a new apiary when submitting the form', async () => {
    const mockCreateApiary = jest.fn();
    useCreateApiary.mockReturnValue({ mutate: mockCreateApiary });

    renderWithProviders(<ApiaryList />);

    const createButton = screen.getByText('Create New Apiary');
    fireEvent.click(createButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Name:');
      const locationInput = screen.getByLabelText('Location:');

      userEvent.type(nameInput, 'New Apiary');
      userEvent.type(locationInput, 'New Location');

      const submitButton = screen.getByText('Create Apiary');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockCreateApiary).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Apiary',
          location: 'New Location',
        }),
        expect.anything()
      );
    });
  });

  it('opens the edit apiary modal when clicking the edit button', async () => {
    renderWithProviders(<ApiaryList />);

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Apiary')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Apiary 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Location 1')).toBeInTheDocument();
    });
  });

  it('updates an apiary when submitting the edit form', async () => {
    const mockUpdateApiary = jest.fn();
    useUpdateApiary.mockReturnValue({ mutate: mockUpdateApiary });

    renderWithProviders(<ApiaryList />);

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Apiary 1');
      const locationInput = screen.getByDisplayValue('Location 1');

      userEvent.clear(nameInput);
      userEvent.type(nameInput, 'Updated Apiary 1');
      userEvent.clear(locationInput);
      userEvent.type(locationInput, 'Updated Location 1');

      const submitButton = screen.getByText('Update Apiary');
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockUpdateApiary).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: '1',
          name: 'Updated Apiary 1',
          location: 'Updated Location 1',
        }),
        expect.anything()
      );
    });
  });

  it('deletes an apiary when clicking the delete button', async () => {
    const mockDeleteApiary = jest.fn();
    useDeleteApiary.mockReturnValue({ mutate: mockDeleteApiary });

    renderWithProviders(<ApiaryList />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this apiary?')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteApiary).toHaveBeenCalledWith('1', expect.anything());
    });
  });

  it('displays loading state', () => {
    useApiaries.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<ApiaryList />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    useApiaries.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch apiaries'),
    });

    renderWithProviders(<ApiaryList />);

    expect(screen.getByText('Error: Failed to fetch apiaries')).toBeInTheDocument();
  });

  it('displays empty state when no apiaries', () => {
    useApiaries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<ApiaryList />);

    expect(screen.getByText('No apiaries found.')).toBeInTheDocument();
  });
});