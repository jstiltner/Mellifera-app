import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestMode } from '../../context/GuestModeContext';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import useAudioFeedback from '../../utils/audioFeedback';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mic, MicOff, HelpCircle } from 'lucide-react';

const VoiceCommander = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { isGuestMode } = useGuestMode();

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
    if (!isGuestMode) {
      checkOpenAIKey();
    }
  }, [checkOpenAIKey, isGuestMode]);

  useEffect(() => {
    if (error && !isGuestMode) {
      // Don't play error sound for missing API key (it's optional)
      if (!error.includes('OpenAI API key not found')) {
        setErrorMessage(error);
        playErrorSound();
      }
      // Still log to console for debugging
      console.warn('Voice Commander:', error);

      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, playErrorSound, isGuestMode]);

  const toggleHelp = useCallback(() => {
    setShowHelp((prevShowHelp) => !prevShowHelp);
    if (!isGuestMode) {
      playNotificationSound();
    }
  }, [playNotificationSound, isGuestMode]);

  const handleVoiceInput = useCallback(
    async (text) => {
      if (isGuestMode) return;
      
      try {
        await processCommand(text);
      } catch (err) {
        console.error('Error processing voice command:', err);
        setErrorMessage('Failed to process voice command. Please try again.');
        playErrorSound();
      }
    },
    [processCommand, playErrorSound, isGuestMode]
  );

  return (
    <div className={`flex items-center gap-3 bg-card border border-border p-2 rounded-lg ${isGuestMode ? 'opacity-50' : ''}`}>
      <Button
        variant={isListening ? 'destructive' : 'default'}
        size="sm"
        onClick={isListening ? handleStop : handleStart}
        disabled={isSpeaking || isGuestMode}
        title={isGuestMode ? 'Voice commands unavailable in guest mode' : undefined}
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-1" />
            Stop
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-1" />
            Start
          </>
        )}
      </Button>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={isListening ? 'default' : 'secondary'} className="text-xs">
            {isListening ? '🎙️ Listening' : '🔇 Idle'}
          </Badge>
          {command && !isGuestMode && (
            <span className="text-xs text-muted-foreground truncate">
              {command.length > 20 ? `${command.substring(0, 20)}...` : command}
            </span>
          )}
          {isGuestMode && (
            <span className="text-xs text-muted-foreground">
              Unavailable in guest mode
            </span>
          )}
        </div>
      </div>
      
      {errorMessage && !isGuestMode && (
        <span className="text-xs text-destructive">{errorMessage}</span>
      )}
      
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleHelp}
          disabled={isGuestMode}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        {showHelp && !isGuestMode && (
          <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg p-4 z-10">
            <h3 className="font-semibold mb-2 text-sm">Voice Commands:</h3>
            <ul className="text-xs space-y-1 text-muted-foreground">
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

export default VoiceCommander;
