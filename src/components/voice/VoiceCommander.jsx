import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import useAudioFeedback from '../../utils/audioFeedback';
import { useApiaries } from '../../hooks/useApiaries';
import useNLU from '../../hooks/useNLU';
import { debounce } from 'lodash';
import localForage from 'localforage';

const VoiceCommander = () => {
  const [command, setCommand] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedApiary, setSelectedApiary] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const errorTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const { playSuccessSound, playErrorSound, playNotificationSound, speakText } = useAudioFeedback();
  const { processNLU, isProcessing, error: nluError } = useNLU();
  
  const { data: apiaries, isLoading: isLoadingApiaries, isError: isApiariesError } = useApiaries();

  const voiceCommandMutation = useMutation(processNLU);

  useEffect(() => {
    playGreetingMessage();
    checkOpenAIKey();
  }, []);

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

  const playGreetingMessage = () => {
    speakTextWithPause('Welcome to the Mellifera app. Click Start Listening to begin using voice commands.');
    playNotificationSound();
  };

  const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)];
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
      if (isSpeaking) return; // Don't process commands while speaking

      try {
        const context = {
          apiaries: apiaries?.length || 0,
          currentPage: window.location.pathname,
        };

        const { intent, entities } = await voiceCommandMutation.mutateAsync(text);
        let message = '';
        let action = intent;

        // Process the intent and entities
        switch (intent) {
          case 'selectApiary':
            const apiaryName = entities.apiaryName?.toLowerCase();
            const selectedApiary = apiaries.find(apiary => apiary.name.toLowerCase() === apiaryName);
            
            if (selectedApiary) {
              setSelectedApiary(selectedApiary);
              message = `Apiary ${selectedApiary.name} selected.`;
              playSuccessSound();
            } else {
              message = `Sorry, I couldn't find an apiary named ${apiaryName}. Please try again.`;
              playErrorSound();
            }
            break;
          case 'addHive':
            if (apiaries && apiaries.length > 0) {
              navigate('/hives/new');
              message = "Navigating to add a new hive.";
              playSuccessSound();
            } else {
              message = "Sorry, I couldn't add a hive because no apiaries were found. Please create an apiary first.";
              playErrorSound();
            }
            break;
          case 'showApiaries':
            navigate('/apiaries');
            message = "Showing apiaries list.";
            playSuccessSound();
            break;
          case 'startInspection':
            if (selectedApiary) {
              navigate(`/inspections/new?apiaryId=${selectedApiary.id}`);
              message = "Starting a new inspection.";
              playSuccessSound();
            } else {
              message = "Please select an apiary first before starting an inspection.";
              playErrorSound();
            }
            break;
          case 'showDashboard':
            navigate('/dashboard');
            message = "Returning to dashboard.";
            playSuccessSound();
            break;
          case 'createApiary':
            navigate('/apiaries/new');
            message = "Navigating to create a new apiary.";
            playSuccessSound();
            break;
          case 'showHelp':
            setShowHelp(true);
            message = "Showing help information.";
            playNotificationSound();
            break;
          default:
            const unknownResponses = [
              "I'm sorry, I didn't quite catch that. Could you try again?",
              "Hmm, I'm not sure what you mean. Can you rephrase that?",
              "I didn't understand that command. Say \"show help\" if you need a list of what I can do.",
              "That command isn't in my database. Can you try something else?",
              "I'm having trouble understanding. Could you say that differently?",
            ];
            message = getRandomResponse(unknownResponses);
            playErrorSound();
            break;
        }

        setCommand(message);
        await speakTextWithPause(message);

      } catch (error) {
        console.error('Error processing voice command:', error);
        await speakTextWithPause('Sorry, there was an error processing your command. Please try again.');
        playErrorSound();
        handleErrorMessage(`Error processing voice command: ${error.message}`);
      }
    }, 300),
    [navigate, apiaries, playSuccessSound, playErrorSound, playNotificationSound, speakTextWithPause, voiceCommandMutation, isSpeaking, selectedApiary]
  );

  const handleStart = async () => {
    setIsListening(true);
    setError(null);
    const startPrompts = [
      "I'm listening.",
      "Voice commands activated.",
      "I'm ready to assist.",
      "Listening mode on. ",
      "Voice control active.",
    ];
    await speakTextWithPause(getRandomResponse(startPrompts));
    playNotificationSound();
  };

  const handleStop = async () => {
    setIsListening(false);
    const stopPrompts = [
      'Voice commands paused. Click Start Listening when you need me again.',
      "I'm taking a break now. Feel free to activate me again when needed.",
      'Voice assistant off. Tap the button to resume voice controls.',
      'Listening mode deactivated. Reactivate anytime for more assistance.',
      'Voice commands disabled. Click to enable when you need my help.',
    ];
    await speakTextWithPause(getRandomResponse(stopPrompts));
    playNotificationSound();
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
    playNotificationSound();
  };

  const handleErrorMessage = (errorMsg) => {
    setError(errorMsg);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, 5000);
  };

  if (isLoadingApiaries) {
    return <div>Loading apiaries...</div>;
  }

  if (isApiariesError) {
    return <div>Error loading apiaries. Please try again later.</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={isListening ? handleStop : handleStart}
          className={`px-4 py-2 rounded ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white font-bold transition duration-300`}
          disabled={isSpeaking}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
        <button
          onClick={toggleHelp}
          className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition duration-300"
        >
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>
        <button
          onClick={playGreetingMessage}
          className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition duration-300"
          disabled={isSpeaking}
        >
          Play Greeting
        </button>
      </div>
      <p className="mt-2">Listening: {isListening ? 'on' : 'off'}</p>
      <p className="mt-2">Command: {command}</p>
      {selectedApiary && <p className="mt-2">Selected Apiary: {selectedApiary.name}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {showHelp && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Available Voice Commands:</h3>
          <ul className="list-disc pl-5">
            <li>"Select apiary [name]" - Selects an apiary to work within</li>
            <li>"Add hive", "Create new hive", "Set up a hive", "Establish a new colony" - Creates a new hive</li>
            <li>"Show apiaries", "List bee yards", "Display my apiaries", "Show me my bee farms" - Navigates to the apiaries list</li>
            <li>"Start inspection", "Begin hive check", "Initiate hive examination", "Let's inspect a hive" - Begins a new hive inspection</li>
            <li>"Go to dashboard", "Show main screen", "Return to homepage", "Take me to the main view" - Returns to the main dashboard</li>
            <li>"Create apiary", "Add new bee yard", "Set up a new apiary", "Establish a new bee farm" - Navigates to the apiary creation form</li>
            <li>"Show help", "List commands", "What can you do?", "Tell me available commands" - Displays this help information</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VoiceCommander;