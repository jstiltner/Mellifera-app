import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { useVoiceCommand } from '../hooks/useVoiceCommand';
import { speakText } from '../utils/pollyService';
import { useNLU } from '../hooks/useNLU';

const inspectionSteps = [
  { id: 'hiveCondition', question: "How would you describe the overall condition of the hive?", options: ["Strong", "Average", "Weak"] },
  { id: 'queenPresence', question: "Did you spot the queen or see evidence of recent egg laying?", options: ["Yes", "No", "Unsure"] },
  { id: 'broodPattern', question: "How would you describe the brood pattern?", options: ["Solid", "Spotty", "None"] },
  { id: 'honeyStores', question: "How are the honey stores?", options: ["Abundant", "Adequate", "Low"] },
  { id: 'pestSigns', question: "Did you notice any signs of pests or diseases?", options: ["Yes", "No", "Unsure"] },
  { id: 'spacingIssues', question: "Are there any spacing issues in the hive?", options: ["Yes", "No"] },
  { id: 'temperament', question: "How would you describe the bees' temperament?", options: ["Calm", "Nervous", "Aggressive"] },
  { id: 'forageActivity', question: "How would you rate the foraging activity?", options: ["High", "Medium", "Low"] },
];

const InspectionAIFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const { startListening, stopListening, transcript, isListening } = useVoiceCommand();
  const { processUserInput } = useNLU();
  const audioRef = useRef(new Audio());

  useEffect(() => {
    speakCurrentQuestion();
  }, [currentStep]);

  const speakCurrentQuestion = async () => {
    const currentQuestion = inspectionSteps[currentStep].question;
    const audioUrl = await speakText(currentQuestion);
    audioRef.current.src = audioUrl;
    audioRef.current.play();
  };

  const handleAnswer = async (answer) => {
    setAnswers({ ...answers, [inspectionSteps[currentStep].id]: answer });
    
    // Process the answer through NLU
    const nluResponse = await processUserInput(answer);
    
    // Speak the NLU response
    const audioUrl = await speakText(nluResponse);
    audioRef.current.src = audioUrl;
    audioRef.current.play();

    if (currentStep < inspectionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleVoiceCommand = async () => {
    if (isListening) {
      stopListening();
      const lowercaseTranscript = transcript.toLowerCase();
      const matchedOption = inspectionSteps[currentStep].options.find(
        option => lowercaseTranscript.includes(option.toLowerCase())
      );
      if (matchedOption) {
        await handleAnswer(matchedOption);
      } else {
        const audioUrl = await speakText("I'm sorry, I didn't understand that. Please try again.");
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } else {
      startListening();
    }
  };

  const currentQuestion = inspectionSteps[currentStep];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Inspection AI Assistant</h2>
      <p className="mb-4">{currentQuestion.question}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {currentQuestion.options.map((option) => (
          <Button key={option} onClick={() => handleAnswer(option)}>
            {option}
          </Button>
        ))}
      </div>
      <Button onClick={handleVoiceCommand} className="bg-blue-500 hover:bg-blue-600">
        {isListening ? 'Stop Listening' : 'Start Voice Command'}
      </Button>
      {isListening && <p className="mt-2">Listening... Say your answer.</p>}
      {transcript && <p className="mt-2">Transcript: {transcript}</p>}
    </div>
  );
};

export default InspectionAIFlow;