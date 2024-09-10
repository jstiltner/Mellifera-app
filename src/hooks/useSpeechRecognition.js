import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const useCustomSpeechRecognition = (confidenceThreshold = 0.8) => {
  const [isSpeechRecognitionAvailable, setIsSpeechRecognitionAvailable] = useState(true);
  const [error, setError] = useState(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setIsSpeechRecognitionAvailable(false);
      setError('Your browser does not support speech recognition.');
    }
  }, [browserSupportsSpeechRecognition]);

  const startListening = useCallback(() => {
    return new Promise((resolve, reject) => {
      SpeechRecognition.startListening({ continuous: true })
        .then(() => {
          setError(null);
          resolve();
        })
        .catch((error) => {
          console.error('Error starting speech recognition:', error);
          setError(`Failed to start speech recognition: ${error.message}`);
          setIsSpeechRecognitionAvailable(false);
          reject(error);
        });
    });
  }, []);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  useEffect(() => {
    const handleError = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
    };

    SpeechRecognition.onError = handleError;

    return () => {
      SpeechRecognition.onError = null;
    };
  }, []);

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    isSpeechRecognitionAvailable,
    error
  };
};

export default useCustomSpeechRecognition;