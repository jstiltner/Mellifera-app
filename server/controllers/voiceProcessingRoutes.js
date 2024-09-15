const express = require('express');
const dotenv = require('dotenv').config();
const router = express.Router();
const { OpenAI } = require('openai');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure AWS Polly
const pollyClient = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post('/', async (req, res) => {
  try {
    const { transcript, context } = req.body;

    // Send transcript to OpenAI
    const openAIResponse = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: `${context}\nUser: ${transcript}\nAI:`,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = openAIResponse.choices[0].text.trim();

    // Send AI response to Polly
    const pollyParams = {
      Text: aiResponse,
      OutputFormat: 'mp3',
      VoiceId: 'Joanna',
    };

    const command = new SynthesizeSpeechCommand(pollyParams);
    const pollyResponse = await pollyClient.send(command);

    // Convert audio stream to base64
    const audioBase64 = Buffer.from(
      await pollyResponse.AudioStream.transformToByteArray()
    ).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    res.json({ aiResponse, audioUrl });
  } catch (error) {
    console.error('Error processing voice command:', error);
    res.status(500).json({ error: 'An error occurred while processing the voice command' });
  }
});

module.exports = router;
