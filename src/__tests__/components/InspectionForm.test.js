import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import InspectionForm from '../../pages/InspectionForm';
import * as useInspections from '../../hooks/useInspections';

jest.mock('localforage', () => ({
  localforage: {
    createInstance: jest.fn(),
    getItem: jest.fn(),
    setItem: jest.fn(),
    config: jest.fn()
  }
}));

// Mock the hooks
jest.mock('../../hooks/useInspections');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

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
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useInspections.useCreateInspection.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
    });
    useInspections.useUpdateInspection.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
    });
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
  });

  test('submits new inspection form successfully', async () => {
    const createMutateAsync = jest.fn().mockResolvedValue({});
    useInspections.useCreateInspection.mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: false,
      isError: false,
    });

    renderWithRouter(<InspectionForm />);

    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2023-05-01' } });
    fireEvent.change(screen.getByLabelText('Overall Health:'), { target: { value: 'Good' } });
    fireEvent.click(screen.getByLabelText('Queen Seen'));
    fireEvent.change(screen.getByLabelText('Notes:'), { target: { value: 'Test notes' } });

    fireEvent.click(screen.getByText('Submit Inspection'));

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        hiveId: '1',
        inspectionData: expect.objectContaining({
          date: '2023-05-01',
          overallHealth: 'Good',
          queenSeen: true,
          notes: 'Test notes',
        }),
      });
      expect(mockNavigate).toHaveBeenCalledWith('/hives/1');
    });
  });

  test('handles error when submitting new inspection form', async () => {
    const createMutateAsync = jest.fn().mockRejectedValue(new Error('Submission failed'));
    useInspections.useCreateInspection.mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: false,
      isError: false,
    });

    renderWithRouter(<InspectionForm />);

    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2023-05-01' } });
    fireEvent.change(screen.getByLabelText('Overall Health:'), { target: { value: 'Good' } });

    fireEvent.click(screen.getByText('Submit Inspection'));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit inspection: Submission failed')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('updates existing inspection successfully', async () => {
    const updateMutateAsync = jest.fn().mockResolvedValue({});
    useInspections.useUpdateInspection.mockReturnValue({
      mutateAsync: updateMutateAsync,
      isPending: false,
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

    fireEvent.click(screen.getByText('Update Inspection'));

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        hiveId: '1',
        inspectionId: '123',
        inspectionData: expect.objectContaining({
          date: '2023-05-01',
          overallHealth: 'Good',
          queenSeen: true,
          notes: 'Updated notes',
        }),
      });
      expect(mockNavigate).toHaveBeenCalledWith('/hives/1');
    });
  });

  test('handles error when updating existing inspection', async () => {
    const updateMutateAsync = jest.fn().mockRejectedValue(new Error('Update failed'));
    useInspections.useUpdateInspection.mockReturnValue({
      mutateAsync: updateMutateAsync,
      isPending: false,
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

    fireEvent.click(screen.getByText('Update Inspection'));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit inspection: Update failed')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('disables submit button during submission', async () => {
    useInspections.useCreateInspection.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true,
      isError: false,
    });

    renderWithRouter(<InspectionForm />);

    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2023-05-01' } });
    fireEvent.change(screen.getByLabelText('Overall Health:'), { target: { value: 'Good' } });

    const submitButton = screen.getByText('Submitting...');

    expect(submitButton).toBeDisabled();
  });

  test('navigates back to hive details when cancel button is clicked', () => {
    renderWithRouter(<InspectionForm />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockNavigate).toHaveBeenCalledWith('/hives/1');
  });
});