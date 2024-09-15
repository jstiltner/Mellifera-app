import { speakText as pollySpeak } from './pollyService';

const useAudioFeedback = () => {
  const playSound = (frequency, duration) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const playSuccessSound = () => {
    playSound(440, 0.2); // Play A4 note for 200ms
  };

  const playErrorSound = () => {
    playSound(220, 0.2); // Play A3 note for 200ms
  };

  const playNotificationSound = () => {
    playSound(660, 0.1); // Play E5 note for 100ms
    setTimeout(() => playSound(880, 0.1), 100); // Play A5 note for 100ms after 100ms delay
  };

  const speakText = async (text) => {
    try {
      const audioUrl = await pollySpeak(text);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      playErrorSound();
    }
  };

  return {
    playSuccessSound,
    playErrorSound,
    playNotificationSound,
    speakText,
  };
};

export default useAudioFeedback;
