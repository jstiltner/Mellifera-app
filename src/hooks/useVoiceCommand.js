import { useMutation } from '@tanstack/react-query';

export const useVoiceCommand = () => {
  const mutation = useMutation({
    mutationFn: async ({ command, context }) => {
      try {
        // Send the command to the server for processing
        const serverResponse = await fetch('/api/voice-command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command, context }),
        });

        if (!serverResponse.ok) {
          throw new Error('Failed to process voice command on server');
        }

        return serverResponse.json();
      } catch (error) {
        console.error('Error in voice command processing:', error);
        throw error;
      }
    },
  });

  return mutation;
};

export default useVoiceCommand;