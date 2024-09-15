import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import useAudioFeedback from '../../utils/audioFeedback';

const VoiceCommander = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const {
    isListening,
    isSpeaking,
    command,
    error,
    processCommand,
    handleStart,
    handleStop,
    checkOpenAIKey,
  } = useVoiceRecognition();

  const { playNotificationSound, playErrorSound } = useAudioFeedback();

  useEffect(() => {
    checkOpenAIKey();
  }, [checkOpenAIKey]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      playErrorSound();
      console.error('Voice Commander Error:', error);

      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, playErrorSound]);

  const toggleHelp = useCallback(() => {
    setShowHelp((prevShowHelp) => !prevShowHelp);
    playNotificationSound();
  }, [playNotificationSound]);

  const handleVoiceInput = useCallback(
    async (text) => {
      try {
        await processCommand(text);
      } catch (err) {
        console.error('Error processing voice command:', err);
        setErrorMessage('Failed to process voice command. Please try again.');
        playErrorSound();
      }
    },
    [processCommand, playErrorSound]
  );

  return (
    <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow">
      <button
        onClick={isListening ? handleStop : handleStart}
        className={`px-3 py-1 rounded ${
          isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white font-bold transition duration-300 text-sm`}
        disabled={isSpeaking}
      >
        {isListening ? 'Stop' : 'Start'}
      </button>
      <div className="flex-grow">
        <span className="text-sm mr-2">{isListening ? '🎙️ Listening' : '🔇 Not Listening'}</span>
        {command && (
          <span className="text-sm text-gray-600">
            Last: {command.length > 20 ? `${command.substring(0, 20)}...` : command}
          </span>
        )}
      </div>
      {errorMessage && <span className="text-sm text-red-600">{errorMessage}</span>}
      <div className="relative">
        <button
          onClick={toggleHelp}
          className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition duration-300 text-sm"
        >
          ?
        </button>
        {showHelp && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
            <h3 className="font-bold mb-2 text-sm">Voice Commands:</h3>
            <ul className="text-xs space-y-1">
              <li>"Create hive" - Creates a new hive</li>
              <li>"Start inspection" - Begins a new hive inspection</li>
              <li>"Add treatment" - Adds a new treatment</li>
              <li>"Show apiaries" - Navigates to the apiaries list</li>
              <li>"Go to dashboard" - Returns to the main dashboard</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(VoiceCommander);
