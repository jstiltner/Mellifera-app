import { render, screen, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import VoiceCommander from '../../components/voice/VoiceCommander';
import useNLU from '../../hooks/useNLU';
import useAudioFeedback from '../../hooks/useAudioFeedback';
import { useApiaries } from '../../hooks/useApiaries';

// Mock the hooks
jest.mock('../../hooks/useNLU');
jest.mock('../../hooks/useAudioFeedback');
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
    useApiaries.mockReturnValue({
      data: [
        { id: 1, name: 'Apiary 1' },
        { id: 2, name: 'Apiary 2' },
      ],
      isLoading: false,
      isError: false,
    });

    // Reset all mock functions
    useAudioFeedback().playSuccessSound.mockClear();
    useAudioFeedback().playErrorSound.mockClear();
    useAudioFeedback().playNotificationSound.mockClear();
    useAudioFeedback().speakText.mockClear();
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
    await act(async () => {
      fireEvent.click(startButton);
    });
    expect(useAudioFeedback().speakText).toHaveBeenCalledWith('Listening for voice commands...');
    expect(useAudioFeedback().playNotificationSound).toHaveBeenCalledTimes(1);
  });

  it('processes voice commands correctly', async () => {
    useNLU.mockReturnValue({
      processNLU: jest.fn().mockResolvedValue({ intent: 'showDashboard', entities: {} }),
      isProcessing: false,
      error: null,
    });
    renderComponent();
    const startButton = screen.getByText('Start Listening');
    await act(async () => {
      fireEvent.click(startButton);
    });
    expect(useNLU().processNLU).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(useAudioFeedback().playSuccessSound).toHaveBeenCalledTimes(1);
    expect(useAudioFeedback().speakText).toHaveBeenCalledWith('Navigating to dashboard');
  });

  it('selects an apiary correctly', async () => {
    useNLU.mockReturnValue({
      processNLU: jest
        .fn()
        .mockResolvedValue({ intent: 'selectApiary', entities: { apiaryName: 'Apiary 1' } }),
      isProcessing: false,
      error: null,
    });
    renderComponent();
    const startButton = screen.getByText('Start Listening');
    await act(async () => {
      fireEvent.click(startButton);
    });
    expect(useNLU().processNLU).toHaveBeenCalled();
    expect(screen.getByText('Selected Apiary: Apiary 1')).toBeInTheDocument();
    expect(useAudioFeedback().playSuccessSound).toHaveBeenCalledTimes(1);
    expect(useAudioFeedback().speakText).toHaveBeenCalledWith('Apiary 1 selected');
  });

  it('requires a selected apiary to start an inspection', async () => {
    useNLU.mockReturnValue({
      processNLU: jest.fn().mockResolvedValue({ intent: 'startInspection', entities: {} }),
      isProcessing: false,
      error: null,
    });
    renderComponent();
    const startButton = screen.getByText('Start Listening');
    await act(async () => {
      fireEvent.click(startButton);
    });
    expect(useNLU().processNLU).toHaveBeenCalled();
    expect(useAudioFeedback().speakText).toHaveBeenCalledWith(
      'Please select an apiary first before starting an inspection.'
    );
    expect(useAudioFeedback().playErrorSound).toHaveBeenCalledTimes(1);
  });

  it('displays help information when "Show Help" is clicked', () => {
    renderComponent();
    const helpButton = screen.getByText('Show Help');
    fireEvent.click(helpButton);
    expect(screen.getByText('Available Voice Commands:')).toBeInTheDocument();
    expect(
      screen.getByText(/"Select apiary \[name\]" - Selects an apiary to work within/)
    ).toBeInTheDocument();
  });

  it('plays greeting message when "Play Greeting" is clicked', () => {
    renderComponent();
    const greetingButton = screen.getByText('Play Greeting');
    fireEvent.click(greetingButton);
    expect(useAudioFeedback().speakText).toHaveBeenCalledWith(
      'Welcome to the Mellifera app. Click Start Listening to begin using voice commands.'
    );
    expect(useAudioFeedback().playNotificationSound).toHaveBeenCalledTimes(1);
  });
});
