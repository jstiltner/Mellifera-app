// Custom Vite plugin to handle react-speech-recognition
export default function speechRecognitionPlugin() {
  const virtualModuleId = 'virtual:react-speech-recognition';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-speech-recognition',
    resolveId(id) {
      if (id === 'react-speech-recognition') {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `
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
          
          export default mockSpeechRecognition;
          export const useSpeechRecognition = mockUseSpeechRecognition;
        `;
      }
    },
    transform(code, id) {
      // Replace direct imports of react-speech-recognition with our virtual module
      if (id.endsWith('.js') || id.endsWith('.jsx') || id.endsWith('.ts') || id.endsWith('.tsx')) {
        if (code.includes('react-speech-recognition')) {
          return code.replace(
            /import\s+(?:(\*\s+as\s+)?([^\s,]+)\s*,?\s*)?(?:{([^}]+)})?\s+from\s+['"]react-speech-recognition['"]/g,
            (match, namespace, defaultImport, namedImports) => {
              let result = 'import ';
              if (defaultImport) {
                result += defaultImport;
              }
              if (namedImports) {
                if (defaultImport) result += ', ';
                result += `{ ${namedImports} }`;
              }
              result += ` from '${virtualModuleId}'`;
              return result;
            }
          );
        }
      }
    }
  };
}