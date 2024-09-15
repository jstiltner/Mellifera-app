import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Custom hook for handling voice commands.
 * This hook uses axios for HTTP requests and is compatible with AWS SDK v3.
 * It sends voice commands to the server for processing and returns the response.
 *
 * @returns {Object} A mutation object from react-query for handling voice commands.
 */
export const useVoiceCommand = () => {
  const mutation = useMutation({
    mutationFn: async ({ command, context }) => {
      try {
        // Send the command to the server for processing using axios
        const response = await axios.post(
          '/api/voice-command',
          { command, context },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Axios automatically throws for non-2xx status codes, so we don't need to check response.ok
        return response.data;
      } catch (error) {
        console.error('Error in voice command processing:', error);
        throw error;
      }
    },
  });

  return mutation;
};

export default useVoiceCommand;
