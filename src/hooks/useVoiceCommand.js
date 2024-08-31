import { useMutation } from '@tanstack/react-query';

const useVoiceCommand = () => {
  const mutation = useMutation({
    mutationFn: async ({ command, context }) => {
      const response = await fetch('/api/voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command, context }),
      });
      if (!response.ok) {
        throw new Error('Failed to process voice command');
      }
      return response.json();
    },
  });

  return mutation;
};

export default useVoiceCommand;