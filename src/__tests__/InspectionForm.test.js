import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import InspectionForm from '../components/views/InspectionForm';
import * as useInspections from '../hooks/useInspections';

// Mock the hooks
jest.mock('../hooks/useInspections');

const queryClient = new QueryClient();

const renderWithRouter = (ui, { route = '/hives/1/inspections' } = {}) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/hives/:hiveId/inspections" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('InspectionForm', () => {
  beforeEach(() => {
    useInspections.useCreateInspection.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      isError: false,
    });
    useInspections.useUpdateInspection.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      isError: false,
    });
    useInspections.useDeleteInspection.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      isError: false,
    });
  });

  test('renders new inspection form correctly', () => {
    renderWithRouter(<InspectionForm />);
    expect(screen.getByText('New Inspection for Hive 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('Overall Health:')).toBeInTheDocument();
    expect(screen.getByText('Submit Inspection')).toBeInTheDocument();
  });

  test('renders edit inspection form correctly', () => {
    const mockInspection = {
      _id: '123',
      date: '2023-05-01',
      overallHealth: 'Good',
      queenSeen: true,
      notes: 'Test notes',
    };

    renderWithRouter(<InspectionForm initialInspection={mockInspection} />);

    expect(screen.getByText('Edit Inspection for Hive 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Date:')).toHaveValue('2023-05-01');
    expect(screen.getByLabelText('Overall Health:')).toHaveValue('Good');
    expect(screen.getByLabelText('Queen Seen')).toBeChecked();
    expect(screen.getByLabelText('Notes:')).toHaveValue('Test notes');
    expect(screen.getByText('Update Inspection')).toBeInTheDocument();
    expect(screen.getByText('Delete Inspection')).toBeInTheDocument();
  });

  test('submits new inspection form successfully', async () => {
    const createMutate = jest.fn();
    useInspections.useCreateInspection.mockReturnValue({
      mutate: createMutate,
      isLoading: false,
      isError: false,
    });

    renderWithRouter(<InspectionForm />);

    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2023-05-01' } });
    fireEvent.change(screen.getByLabelText('Overall Health:'), { target: { value: 'Good' } });
    fireEvent.click(screen.getByLabelText('Queen Seen'));
    fireEvent.change(screen.getByLabelText('Notes:'), { target: { value: 'Test notes' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit Inspection'));
    });

    expect(createMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        hiveId: 1,
        inspectionData: expect.objectContaining({
          date: '2023-05-01',
          overallHealth: 'Good',
          queenSeen: true,
          notes: 'Test notes',
        }),
      }),
      expect.anything()
    );
  });

  test('handles error when submitting new inspection form', async () => {
    const createMutate = jest.fn().mockImplementation((_, options) => {
      options.onError(new Error('Submission failed'));
    });
    useInspections.useCreateInspection.mockReturnValue({
      mutate: createMutate,
      isLoading: false,
      isError: false,
    });

    renderWithRouter(<InspectionForm />);

    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2023-05-01' } });
    fireEvent.change(screen.getByLabelText('Overall Health:'), { target: { value: 'Good' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit Inspection'));
    });

    expect(screen.getByText('Failed to create inspection: Submission failed')).toBeInTheDocument();
  });

  test('updates existing inspection successfully', async () => {
    const updateMutate = jest.fn();
    useInspections.useUpdateInspection.mockReturnValue({
      mutate: updateMutate,
      isLoading: false,
      isError: false,
    });

    const mockInspection = {
      _id: '123',
      date: '2023-05-01',
      overallHealth: 'Good',
      queenSeen: true,
      notes: 'Initial notes',
    };

    renderWithRouter(<InspectionForm initialInspection={mockInspection} />);

    fireEvent.change(screen.getByLabelText('Notes:'), { target: { value: 'Updated notes' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Update Inspection'));
    });

    expect(updateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        hiveId: 1,
        inspectionId: '123',
        inspectionData: expect.objectContaining({
          date: '2023-05-01',
          overallHealth: 'Good',
          queenSeen: true,
          notes: 'Updated notes',
        }),
      }),
      expect.anything()
    );
  });

  test('handles error when updating existing inspection', async () => {
    const updateMutate = jest.fn().mockImplementation((_, options) => {
      options.onError(new Error('Update failed'));
    });
    useInspections.useUpdateInspection.mockReturnValue({
      mutate: updateMutate,
      isLoading: false,
      isError: false,
    });

    const mockInspection = {
      _id: '123',
      date: '2023-05-01',
      overallHealth: 'Good',
      queenSeen: true,
      notes: 'Initial notes',
    };

    renderWithRouter(<InspectionForm initialInspection={mockInspection} />);

    fireEvent.change(screen.getByLabelText('Notes:'), { target: { value: 'Updated notes' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Update Inspection'));
    });

    expect(screen.getByText('Failed to update inspection: Update failed')).toBeInTheDocument();
  });

  test('deletes existing inspection successfully', async () => {
    const deleteMutate = jest.fn();
    useInspections.useDeleteInspection.mockReturnValue({
      mutate: deleteMutate,
      isLoading: false,
      isError: false,
    });

    const mockInspection = {
      _id: '123',
      date: '2023-05-01',
      overallHealth: 'Good',
      queenSeen: true,
      notes: 'Test notes',
    };

    window.confirm = jest.fn(() => true);

    renderWithRouter(<InspectionForm initialInspection={mockInspection} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Delete Inspection'));
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        hiveId: 1,
        inspectionId: '123',
      }),
      expect.anything()
    );
  });

  test('handles error when deleting existing inspection', async () => {
    const deleteMutate = jest.fn().mockImplementation((_, options) => {
      options.onError(new Error('Delete failed'));
    });
    useInspections.useDeleteInspection.mockReturnValue({
      mutate: deleteMutate,
      isLoading: false,
      isError: false,
    });

    const mockInspection = {
      _id: '123',
      date: '2023-05-01',
      overallHealth: 'Good',
      queenSeen: true,
      notes: 'Test notes',
    };

    window.confirm = jest.fn(() => true);

    renderWithRouter(<InspectionForm initialInspection={mockInspection} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Delete Inspection'));
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByText('Failed to delete inspection: Delete failed')).toBeInTheDocument();
  });

  test('disables submit button during submission', async () => {
    const createMutate = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    useInspections.useCreateInspection.mockReturnValue({
      mutate: createMutate,
      isLoading: true,
      isError: false,
    });

    renderWithRouter(<InspectionForm />);

    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2023-05-01' } });
    fireEvent.change(screen.getByLabelText('Overall Health:'), { target: { value: 'Good' } });

    const submitButton = screen.getByText('Submitting...');

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalled();
    });
  });
});