import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useQueryClient } from '@tanstack/react-query';

const useGlobalSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const queryClient = useQueryClient();

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const startListening = useCallback(() => {
    SpeechRecognition.startListening({ continuous: true });
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (isListening && !listening) {
      startListening();
    }
  }, [isListening, listening, startListening]);

  useEffect(() => {
    // Invalidate and refetch relevant queries when transcript changes
    if (transcript) {
      queryClient.invalidateQueries(['voiceCommand']);
    }
  }, [transcript, queryClient]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  };
};

export default useGlobalSpeechRecognition;
