import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAudioFeedback from '../utils/audioFeedback';
import useNLU from './useNLU';
import { debounce } from 'lodash';
import localForage from 'localforage';

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [command, setCommand] = useState('');
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();
  const { playSuccessSound, playErrorSound, playNotificationSound, speakText } = useAudioFeedback();
  const { processNLU, isProcessing, error: nluError } = useNLU();

  const voiceCommandMutation = useMutation({
    mutationFn: processNLU,
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries after a successful mutation
      queryClient.invalidateQueries({ queryKey: ['apiaries'] });
      queryClient.invalidateQueries({ queryKey: ['hives'] });
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });

  useEffect(() => {
    if (nluError) {
      handleErrorMessage(nluError);
    }
  }, [nluError]);

  const checkOpenAIKey = async () => {
    const apiKey = await localForage.getItem('openai_api_key');
    if (!apiKey) {
      handleErrorMessage('OpenAI API key not found. Voice commands may not work properly.');
    }
  };

  const speakTextWithPause = async (text) => {
    setIsSpeaking(true);
    if (isListening) {
      setIsListening(false);
    }
    await speakText(text);
    setIsSpeaking(false);
    if (!isListening) {
      setIsListening(true);
    }
  };

  const processCommand = useCallback(
    debounce(async (text) => {
      if (isSpeaking) return;

      try {
        const context = {
          // Add relevant context here, e.g., current page, selected apiary, etc.
        };

        const { intent, entities } = await voiceCommandMutation.mutateAsync({ text, context });
        let message = '';

        // Process the intent and entities
        switch (intent) {
          case 'createHive':
            // Logic to create a new hive
            message = 'Creating a new hive...';
            // Add API call or mutation to create hive
            break;
          case 'startInspection':
            // Logic to start a new inspection
            message = 'Starting a new inspection...';
            // Add API call or mutation to start inspection
            break;
          case 'addTreatment':
            // Logic to add a treatment
            message = 'Adding a new treatment...';
            // Add API call or mutation to add treatment
            break;
          // Add more cases for different intents
          default:
            message = "I'm sorry, I didn't understand that command.";
            playErrorSound();
            break;
        }

        setCommand(message);
        await speakTextWithPause(message);
      } catch (error) {
        console.error('Error processing voice command:', error);
        await speakTextWithPause(
          'Sorry, there was an error processing your command. Please try again.'
        );
        playErrorSound();
        handleErrorMessage(`Error processing voice command: ${error.message}`);
      }
    }, 300),
    [isSpeaking, voiceCommandMutation, playErrorSound, speakTextWithPause]
  );

  const handleStart = async () => {
    setIsListening(true);
    setError(null);
    await speakTextWithPause("I'm listening.");
    playNotificationSound();
  };

  const handleStop = async () => {
    setIsListening(false);
    await speakTextWithPause(
      'Voice commands paused. Click Start Listening when you need me again.'
    );
    playNotificationSound();
  };

  const handleErrorMessage = (errorMsg) => {
    setError(errorMsg);
    // You can add more error handling logic here
  };

  return {
    isListening,
    isSpeaking,
    command,
    error,
    processCommand,
    handleStart,
    handleStop,
    checkOpenAIKey,
  };
};

export default useVoiceRecognition;
