import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import VoiceCommander from '../../components/voice/VoiceCommander';
import useNLU from '../../hooks/useNLU';
import useAudioFeedback from '../../hooks/useNLU';
import { useApiaries } from '../../hooks/useApiaries';

// Mock the hooks
jest.mock('../../hooks/useNLU');
jest.mock('../../utils/audioFeedback');
jest.mock('../../hooks/useApiaries');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('VoiceCommander', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    useNLU.mockReturnValue({
      processNLU: jest.fn().mockResolvedValue({ intent: 'showDashboard', entities: {} }),
      isProcessing: false,
      error: null,
    });
    useAudioFeedback.mockReturnValue({
      playSuccessSound: jest.fn(),
      playErrorSound: jest.fn(),
      playNotificationSound: jest.fn(),
      speakText: jest.fn().mockResolvedValue(),
    });
    useApiaries.mockReturnValue({
      data: [
        { id: 1, name: 'Apiary 1' },
        { id: 2, name: 'Apiary 2' },
      ],
      isLoading: false,
      isError: false,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <VoiceCommander />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Start Listening')).toBeInTheDocument();
    expect(screen.getByText('Show Help')).toBeInTheDocument();
    expect(screen.getByText('Play Greeting')).toBeInTheDocument();
  });

  it('starts listening when the start button is clicked', async () => {
    renderComponent();
    const startButton = screen.getByText('Start Listening');
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(useAudioFeedback().speakText).toHaveBeenCalled();
      expect(useAudioFeedback().playNotificationSound).toHaveBeenCalled();
    });
  });

  it('processes voice commands correctly', async () => {
    useNLU.mockReturnValue({
      processNLU: jest.fn().mockResolvedValue({ intent: 'showDashboard', entities: {} }),
      isProcessing: false,
      error: null,
    });
    renderComponent();
    const startButton = screen.getByText('Start Listening');
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(useNLU().processNLU).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(useAudioFeedback().playSuccessSound).toHaveBeenCalled();
    });
  });

  it('selects an apiary correctly', async () => {
    useNLU.mockReturnValue({
      processNLU: jest.fn().mockResolvedValue({ intent: 'selectApiary', entities: { apiaryName: 'Apiary 1' } }),
      isProcessing: false,
      error: null,
    });
    renderComponent();
    const startButton = screen.getByText('Start Listening');
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(useNLU().processNLU).toHaveBeenCalled();
      expect(screen.getByText('Selected Apiary: Apiary 1')).toBeInTheDocument();
      expect(useAudioFeedback().playSuccessSound).toHaveBeenCalled();
    });
  });

  it('requires a selected apiary to start an inspection', async () => {
    useNLU.mockReturnValue({
      processNLU: jest.fn().mockResolvedValue({ intent: 'startInspection', entities: {} }),
      isProcessing: false,
      error: null,
    });
    renderComponent();
    const startButton = screen.getByText('Start Listening');
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(useNLU().processNLU).toHaveBeenCalled();
      expect(useAudioFeedback().speakText).toHaveBeenCalledWith("Please select an apiary first before starting an inspection.");
      expect(useAudioFeedback().playErrorSound).toHaveBeenCalled();
    });
  });

  it('displays help information when "Show Help" is clicked', () => {
    renderComponent();
    const helpButton = screen.getByText('Show Help');
    fireEvent.click(helpButton);
    expect(screen.getByText('Available Voice Commands:')).toBeInTheDocument();
    expect(screen.getByText(/"Select apiary \[name\]" - Selects an apiary to work within/)).toBeInTheDocument();
  });

  it('plays greeting message when "Play Greeting" is clicked', () => {
    renderComponent();
    const greetingButton = screen.getByText('Play Greeting');
    fireEvent.click(greetingButton);
    expect(useAudioFeedback().speakText).toHaveBeenCalledWith('Welcome to the Mellifera app. Click Start Listening to begin using voice commands.');
    expect(useAudioFeedback().playNotificationSound).toHaveBeenCalled();
  });
});