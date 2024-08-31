import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useVoiceCommand from '../hooks/useVoiceCommand';

const VoiceControl = ({ onCommand }) => {
  const [feedback, setFeedback] = useState('');
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const voiceCommandMutation = useVoiceCommand();

  useEffect(() => {
    if (transcript) {
      processCommand(transcript);
    }
  }, [transcript]);

  const processCommand = async (text) => {
    try {
      const result = await voiceCommandMutation.mutateAsync({
        command: text,
        context: 'The user is performing a hive inspection.',
      });

      const aiResponse = result.response;
      setFeedback(aiResponse);

      // Check if the AI response contains a recognized command
      const commandMatch = aiResponse.match(/Recognized command: (\w+) (\w+)/);
      if (commandMatch) {
        const [, action, entity] = commandMatch;
        onCommand(action, entity, text);
      }

      // Use text-to-speech to read the AI response
      const speech = new SpeechSynthesisUtterance(aiResponse);
      window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error('Error processing voice command:', error);
      setFeedback('Sorry, I encountered an error while processing your request.');
    }

    resetTranscript();
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div>
      <h2>Voice Control</h2>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={() => SpeechRecognition.startListening({ continuous: true })}>
        Start Listening
      </button>
      <button onClick={SpeechRecognition.stopListening}>Stop Listening</button>
      <p>Current transcript: {transcript}</p>
      <p>AI Response: {feedback}</p>
      {voiceCommandMutation.isLoading && <p>Processing voice command...</p>}
      {voiceCommandMutation.isError && (
        <p>Error: {voiceCommandMutation.error.message}</p>
      )}
    </div>
  );
};

export default VoiceControl;
