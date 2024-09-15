import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function speakText(text) {
  const params = {
    Engine: 'generative',
    LanguageCode: 'en-US',
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: 'Ruth',
  };

  try {
    const command = new SynthesizeSpeechCommand(params);
    const response = await pollyClient.send(command);

    // Convert the audio stream to an ArrayBuffer
    const audioArrayBuffer = await response.AudioStream.transformToByteArray();

    // Create a Blob from the ArrayBuffer
    const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });

    // Create a URL for the Blob
    const audioUrl = URL.createObjectURL(audioBlob);

    return audioUrl;
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
}
