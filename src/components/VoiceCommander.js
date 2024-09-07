import React, { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import nlp from 'compromise';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAudioFeedback from '../utils/audioFeedback';
import { useCreateHive, useHives } from '../hooks/useHives';

const VoiceCommander = () => {
  const [command, setCommand] = useState('');
  const [isSpeechRecognitionAvailable, setIsSpeechRecognitionAvailable] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const navigate = useNavigate();
  const createHiveMutation = useCreateHive();
  const { data: apiaries, isLoading: isLoadingApiaries, isError: isApiariesError } = useHives({});
  const { playSuccessSound, playErrorSound, playNotificationSound } = useAudioFeedback();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setIsSpeechRecognitionAvailable(false);
    }
  }, [browserSupportsSpeechRecognition]);

  const playGreetingMessage = () => {
    sayCommand('Welcome to the Mellifera app. Click Start Listening to begin using voice commands.');
    playNotificationSound();
  };
  
  const sayCommand = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  useEffect(() => {
    console.log('trying to speak');
    playGreetingMessage();
  }, []);

  const processCommand = useCallback(async (text) => {
    const doc = nlp(text.toLowerCase());

    try {
      const response = await axios.post('/api/voice/command', { command: text });
      const { action, message } = response.data;

      setCommand(message);
      sayCommand(message);

      switch (action) {
        case 'addHive':
          if (apiaries && apiaries.length > 0) {
            createHiveMutation.mutate({ 
              apiaryId: apiaries[0]?._id, 
              hiveData: { name: 'New Voice Hive' }
            });
          } else {
            sayCommand('Sorry, I couldn\'t add a hive because no apiaries were found. Please create an apiary first.');
            playErrorSound();
          }
          break;
        case 'showApiaries':
          navigate('/apiaries');
          playSuccessSound();
          break;
        case 'startInspection':
          navigate('/inspections/new');
          playSuccessSound();
          break;
        case 'showDashboard':
          navigate('/dashboard');
          playSuccessSound();
          break;
        case 'createApiary':
          navigate('/apiaries/new');
          playSuccessSound();
          break;
        case 'showHelp':
          setShowHelp(true);
          playNotificationSound();
          break;
        default:
          const unknownResponses = [
            'I\'m sorry, I didn\'t quite catch that. Could you try again?',
            'Hmm, I\'m not sure what you mean. Can you rephrase that?',
            'I didn\'t understand that command. Say "show help" if you need a list of what I can do.',
            'That command isn\'t in my database. Can you try something else?',
            'I\'m having trouble understanding. Could you say that differently?'
          ];
          sayCommand(getRandomResponse(unknownResponses));
          playErrorSound();
          break;
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      sayCommand('Sorry, there was an error processing your command. Please try again.');
      playErrorSound();
    }
  }, [navigate, createHiveMutation, apiaries, playSuccessSound, playErrorSound, playNotificationSound]);

  useEffect(() => {
    if (transcript) {
      processCommand(transcript);
    }
  }, [transcript, processCommand]);

  const handleStart = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true })
      .then(() => {
        setError(null);
        const startPrompts = [
          'I\'m listening. How can I help you today?',
          'Voice commands activated. What would you like to do?',
          'I\'m ready to assist. What\'s your command?',
          'Listening mode on. How may I help you with your beekeeping tasks?',
          'Voice control active. What beekeeping operation shall we perform?'
        ];
        sayCommand(getRandomResponse(startPrompts));
        playNotificationSound();
      })
      .catch((err) => {
        console.error('Error starting speech recognition:', err);
        setError('Failed to start speech recognition. Please try again.');
        setIsSpeechRecognitionAvailable(false);
        playErrorSound();
      });
  };

  const handleStop = () => {
    SpeechRecognition.stopListening();
    const stopPrompts = [
      'Voice commands paused. Click Start Listening when you need me again.',
      'I\'m taking a break now. Feel free to activate me again when needed.',
      'Voice assistant off. Tap the button to resume voice controls.',
      'Listening mode deactivated. Reactivate anytime for more assistance.',
      'Voice commands disabled. Click to enable when you need my help.'
    ];
    sayCommand(getRandomResponse(stopPrompts));
    playNotificationSound();
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
    playNotificationSound();
  };

  if (!isSpeechRecognitionAvailable) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
        <p>Speech recognition is not supported in your browser or an error occurred.</p>
        <p>You can still use the app, but voice commands won't be available.</p>
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </div>
    );
  }

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
          onClick={listening ? handleStop : handleStart}
          className={`px-4 py-2 rounded ${
            listening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white font-bold transition duration-300`}
        >
          {listening ? 'Stop Listening' : 'Start Listening'}
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
        >
          Play Greeting
        </button>
      </div>
      <p className="mt-2">Microphone: {listening ? 'on' : 'off'}</p>
      <p className="mt-2">Transcript: {transcript}</p>
      <p className="mt-2">Command: {command}</p>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {showHelp && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Available Voice Commands:</h3>
          <ul className="list-disc pl-5">
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