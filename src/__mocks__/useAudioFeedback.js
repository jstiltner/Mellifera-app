const useAudioFeedback = jest.fn().mockReturnValue({
  playSuccessSound: jest.fn(),
  playErrorSound: jest.fn(),
  playNotificationSound: jest.fn(),
  speakText: jest.fn(),
});

export default useAudioFeedback;
