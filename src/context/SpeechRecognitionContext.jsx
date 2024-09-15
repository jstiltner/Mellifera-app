import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useGlobalSpeechRecognition from '../hooks/useGlobalSpeechRecognition';

const SpeechRecognitionContext = createContext();

export const useSpeechRecognition = () => {
  const context = useContext(SpeechRecognitionContext);
  if (!context) {
    throw new Error('useSpeechRecognition must be used within a SpeechRecognitionProvider');
  }
  return context;
};

export const SpeechRecognitionProvider = ({ children }) => {
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useGlobalSpeechRecognition();

  const [globalTranscript, setGlobalTranscript] = useState('');

  useEffect(() => {
    if (transcript) {
      setGlobalTranscript((prevTranscript) => prevTranscript + ' ' + transcript);
    }
  }, [transcript]);

  const clearGlobalTranscript = useCallback(() => {
    setGlobalTranscript('');
    resetTranscript();
  }, [resetTranscript]);

  const value = {
    transcript: globalTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript: clearGlobalTranscript,
    browserSupportsSpeechRecognition,
  };

  return (
    <SpeechRecognitionContext.Provider value={value}>{children}</SpeechRecognitionContext.Provider>
  );
};

export default SpeechRecognitionContext;
