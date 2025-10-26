// This file provides a safe wrapper around the react-speech-recognition library
// to prevent bundling issues with esbuild

// Create a mock implementation for non-browser environments or during build
const mockSpeechRecognition = {
  startListening: () => {},
  stopListening: () => {},
  abortListening: () => {},
};

const mockUseSpeechRecognition = () => ({
  transcript: '',
  listening: false,
  resetTranscript: () => {},
  browserSupportsSpeechRecognition: false,
});

// Export the mock implementations by default
export const SpeechRecognition = mockSpeechRecognition;
export const useSpeechRecognition = mockUseSpeechRecognition;

// In browser environments, replace the mock with the real implementation at runtime
if (typeof window !== 'undefined') {
  // This code will only run in the browser, not during build
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/react-speech-recognition@3.10.0/dist/index.js';
  script.async = true;
  script.onload = () => {
    // Once loaded, the library will be available as window.ReactSpeechRecognition
    if (window.ReactSpeechRecognition) {
      // Override the exports with the real implementation
      Object.assign(SpeechRecognition, window.ReactSpeechRecognition.default || {});
      
      // Replace the useSpeechRecognition implementation
      const originalUseSpeechRecognition = useSpeechRecognition;
      Object.defineProperty(window, 'useSpeechRecognition', {
        get: () => window.ReactSpeechRecognition.useSpeechRecognition || originalUseSpeechRecognition
      });
    }
  };
  
  // Add the script to the document
  document.head.appendChild(script);
}