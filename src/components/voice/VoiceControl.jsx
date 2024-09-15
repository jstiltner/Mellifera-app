import { useEffect, useCallback } from 'react';
import { useSpeechRecognition } from '../../context/SpeechRecognitionContext';
import { useVoiceCommand } from '../../hooks/useVoiceCommand';

const VoiceControl = ({ onCommand }) => {
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const voiceCommandMutation = useVoiceCommand();

  const processCommand = useCallback(
    async (text) => {
      if (text.trim()) {
        try {
          const result = await voiceCommandMutation.mutateAsync({
            command: text,
            context: 'The user is performing a hive inspection.',
          });

          const { aiResponse, audioUrl } = result;

          // Check if the AI response contains a recognized command
          const commandMatch = aiResponse.match(/Recognized command: (\w+) (\w+)/);
          if (commandMatch) {
            const [, action, entity] = commandMatch;
            onCommand(action, entity, text);
          }

          // Play the audio response
          const audio = new Audio(audioUrl);
          audio.play();
        } finally {
          resetTranscript();
        }
      }
    },
    [voiceCommandMutation, resetTranscript, onCommand]
  );

  useEffect(() => {
    if (transcript) {
      processCommand(transcript);
    }
  }, [transcript, processCommand]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div>
      <h2>Voice Control</h2>
      <p>Microphone: {isListening ? 'on' : 'off'}</p>
      <button onClick={startListening} disabled={isListening}>
        Start Listening
      </button>
      <button onClick={stopListening} disabled={!isListening}>
        Stop Listening
      </button>
      <p>Current transcript: {transcript}</p>
      {voiceCommandMutation.isLoading && <p>Processing voice command...</p>}
      {voiceCommandMutation.isError && <p>Error: {voiceCommandMutation.error.message}</p>}
    </div>
  );
};

export default VoiceControl;
