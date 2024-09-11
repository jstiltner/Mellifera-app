import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InspectionReview from '../../pages/InspectionReview';
import { useInspections } from '../../hooks/useInspections';

jest.mock('localforage', () => ({
  localforage: {
    createInstance: jest.fn(),
    getItem: jest.fn(),
    setItem: jest.fn(),
    config: jest.fn()
  }
}));
// Mock the useInspections hook
jest.mock('../../hooks/useInspections');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockInspections = [
  {
    _id: '1',
    date: '2023-05-01',
    hive: 'hive1',
    queenSeen: true,
    honeyStores: 5,
    broodPattern: 4,
  },
  {
    _id: '2',
    date: '2023-04-15',
    hive: 'hive1',
    queenSeen: false,
    honeyStores: 3,
    broodPattern: 3,
  },
];

const renderWithRouter = (ui, { route = '/hive/hive1/inspection-review' } = {}) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/hive/:hiveId/inspection-review" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('InspectionReview', () => {
  beforeEach(() => {
    useInspections.mockReturnValue({
      data: mockInspections,
      isLoading: false,
      isError: false,
    });
  });

  it('renders loading state', () => {
    useInspections.mockReturnValue({ isLoading: true });
    renderWithRouter(<InspectionReview />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    useInspections.mockReturnValue({ isError: true });
    renderWithRouter(<InspectionReview />);
    expect(screen.getByText('Error loading inspections')).toBeInTheDocument();
  });

  it('renders no inspections found', () => {
    useInspections.mockReturnValue({ data: [] });
    renderWithRouter(<InspectionReview />);
    expect(screen.getByText('No inspections found')).toBeInTheDocument();
  });

  it('renders inspection data', () => {
    renderWithRouter(<InspectionReview />);
    expect(screen.getByText('Inspection Review')).toBeInTheDocument();
    expect(screen.getByText('Back to Hive Details')).toBeInTheDocument();
    expect(screen.getByText('queenSeen')).toBeInTheDocument();
    expect(screen.getByText('honeyStores')).toBeInTheDocument();
    expect(screen.getByText('broodPattern')).toBeInTheDocument();
  });

  it('navigates back to hive details', () => {
    renderWithRouter(<InspectionReview />);
    fireEvent.click(screen.getByText('Back to Hive Details'));
    expect(mockNavigate).toHaveBeenCalledWith('/hive/hive1');
  });

  it('allows comparison between inspections', () => {
    renderWithRouter(<InspectionReview />);
    const select = screen.getByLabelText('Compare with:');
    fireEvent.change(select, { target: { value: '1' } });
    expect(screen.getByText('Previous Value: 3')).toBeInTheDocument();
    expect(screen.getByText('Percent Change: 66.67%')).toBeInTheDocument();
  });
});