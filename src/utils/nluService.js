import mongoose from 'mongoose';
import axios from 'axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { OPENAI_CONFIG } from './nluConfig';

// MongoDB connection (ensure this is set up in your main server file)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for storing NLU results
const NluResultSchema = new mongoose.Schema({
  command: String,
  intent: String,
  entities: Object,
  timestamp: { type: Date, default: Date.now }
});

const NluResult = mongoose.model('NluResult', NluResultSchema);

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const processCommand = async (command) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_CONFIG.model,
        messages: [
          { role: 'system', content: OPENAI_CONFIG.systemPrompt },
          { role: 'user', content: command }
        ],
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.max_tokens
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);

    // Store the result in MongoDB
    const nluResult = new NluResult({
      command,
      intent: result.intent,
      entities: result.entities
    });
    await nluResult.save();

    return result;
  } catch (error) {
    console.error('Error processing command:', error);
    throw error;
  }
};

export const getIntent = (nluResponse) => {
  return nluResponse?.intent || null;
};

export const getEntities = (nluResponse) => {
  return nluResponse?.entities || {};
};

export const getRecentCommands = async (limit = 10) => {
  try {
    const recentCommands = await NluResult.find().sort({ timestamp: -1 }).limit(limit);
    return recentCommands;
  } catch (error) {
    console.error('Error fetching recent commands:', error);
    throw error;
  }
};

export const useNluService = () => {
  const processMutation = useMutation({
    mutationFn: processCommand,
    onError: (error) => {
      console.error('Error in NLU service:', error);
    }
  });

  const recentCommandsQuery = useQuery({
    queryKey: ['recentCommands'],
    queryFn: () => getRecentCommands(),
    staleTime: 60000, // 1 minute
  });

  const processNluCommand = async (command) => {
    try {
      const result = await processMutation.mutateAsync(command);
      return result;
    } catch (error) {
      console.error('Error processing NLU command:', error);
      throw error;
    }
  };

  return {
    processNluCommand,
    isProcessing: processMutation.isPending,
    error: processMutation.error,
    recentCommands: recentCommandsQuery.data,
    isLoadingRecentCommands: recentCommandsQuery.isLoading,
  };
};