import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HiveDetails from '../../pages/HiveDetails';
import { fetchHive, updateHive } from '../../api/hiveApi';
import { errorToast, successToast } from '../../utils/errorHandling';

jest.mock('../../api/hiveApi');
jest.mock('../../utils/errorHandling');
jest.mock('../../hooks/useTreatments', () => ({
  useTreatments: () => ({
    getTreatmentsByHive: () => ({
      data: [],
      isLoading: false,
      isError: false,
    }),
    updateTreatment: { mutateAsync: jest.fn() },
    deleteTreatment: { mutateAsync: jest.fn() },
  }),
}));
jest.mock('../../hooks/useInspections', () => ({
  useInspections: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

const mockHive = {
  _id: '1',
  name: 'Test Hive',
  type: 'Langstroth',
  status: 'Active',
  queenPresent: true,
  children: [],
};

const queryClient = new QueryClient();

const renderWithRouter = (ui, { route = '/hives/1' } = {}) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/hives/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('HiveDetails', () => {
  beforeEach(() => {
    fetchHive.mockResolvedValue(mockHive);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders hive details and allows editing', async () => {
    renderWithRouter(<HiveDetails />);

    await waitFor(() => {
      expect(screen.getByText('Test Hive')).toBeInTheDocument();
    });

    expect(screen.getByText('Langstroth')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const nameInput = screen.getByDisplayValue('Test Hive');
    fireEvent.change(nameInput, { target: { value: 'Updated Hive' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateHive).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ name: 'Updated Hive' })
      );
    });

    expect(successToast).toHaveBeenCalledWith('Hive updated successfully');
  });

  test('handles API errors', async () => {
    fetchHive.mockRejectedValue(new Error('API Error'));
    renderWithRouter(<HiveDetails />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  test('displays loading state', async () => {
    fetchHive.mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<HiveDetails />);

    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });
});
