const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Function to process voice commands using OpenAI
const processVoiceCommand = async (command, context) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not set in the server environment');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              "You are a beekeeping assistant AI. Interpret the user's voice command and provide a structured response.",
          },
          { role: 'user', content: `Command: ${command}\nContext: ${JSON.stringify(context)}` },
        ],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    const parsedResponse = JSON.parse(aiResponse);

    return {
      action: parsedResponse.action,
      message: parsedResponse.message,
    };
  } catch (error) {
    console.error('Error processing voice command with OpenAI:', error);
    if (error.response) {
      console.error('OpenAI API error response:', error.response.data);
    }
    throw new Error('Failed to process voice command with OpenAI: ' + error.message);
  }
};

// Route to handle voice commands
router.post('/voice-command', async (req, res) => {
  const { command, context } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Voice command is required' });
  }

  try {
    const result = await processVoiceCommand(command, context);
    res.json(result);
  } catch (error) {
    console.error('Error in voice command route:', error);
    res.status(500).json({ error: 'Error processing voice command', details: error.message });
  }
});

module.exports = router;
