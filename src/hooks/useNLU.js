import { useState, useCallback } from 'react';
import { processCommand, getIntent, getEntities } from '../utils/nluService';

const useNLU = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processUserInput = useCallback(async (text) => {
    setIsProcessing(true);
    setError(null);
    try {
      const nluResponse = await processCommand(text);
      const intent = getIntent(nluResponse);
      const entities = getEntities(nluResponse);
      
      // Generate a response based on the NLU results
      let response = "I've recorded your answer. ";
      if (intent === 'provide_information') {
        response += "Thank you for providing that information. ";
      } else if (intent === 'request_clarification') {
        response += "If you need any clarification, please ask. ";
      }
      
      // Add entity-specific responses
      if (entities.condition) {
        response += `You mentioned the condition is ${entities.condition}. `;
      }
      if (entities.presence) {
        response += `You indicated the presence is ${entities.presence}. `;
      }
      
      setIsProcessing(false);
      return response;
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      throw err;
    }
  }, []);

  return {
    processUserInput,
    isProcessing,
    error,
  };
};

export default useNLU;