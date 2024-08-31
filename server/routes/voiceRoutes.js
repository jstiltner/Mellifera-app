const express = require('express');
const router = express.Router();
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Mock database for demonstration purposes
const mockDatabase = {
  hives: [],
  apiaries: [],
  inspections: []
};

// NLP function to process voice commands
const processVoiceCommand = (command) => {
  const tokens = tokenizer.tokenize(command.toLowerCase());

  if (tokens.includes('add') && tokens.includes('hive')) {
    return { action: 'addHive' };
  } else if (tokens.includes('show') && tokens.includes('apiaries')) {
    return { action: 'showApiaries' };
  } else if (tokens.includes('start') && tokens.includes('inspection')) {
    return { action: 'startInspection' };
  } else if ((tokens.includes('go') && tokens.includes('dashboard')) || (tokens.includes('show') && tokens.includes('dashboard'))) {
    return { action: 'showDashboard' };
  } else if (tokens.includes('create') && tokens.includes('apiary')) {
    return { action: 'createApiary' };
  } else {
    return { action: 'unknown' };
  }
};

// Route to handle voice commands
router.post('/command', (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Voice command is required' });
  }

  const result = processVoiceCommand(command);

  switch (result.action) {
    case 'addHive':
      mockDatabase.hives.push({ id: Date.now(), name: 'New Hive' });
      res.json({ message: 'New hive added successfully', action: result.action });
      break;
    case 'showApiaries':
      res.json({ message: 'Showing apiaries', action: result.action, apiaries: mockDatabase.apiaries });
      break;
    case 'startInspection':
      mockDatabase.inspections.push({ id: Date.now(), date: new Date() });
      res.json({ message: 'New inspection started', action: result.action });
      break;
    case 'showDashboard':
      res.json({ message: 'Navigating to dashboard', action: result.action });
      break;
    case 'createApiary':
      mockDatabase.apiaries.push({ id: Date.now(), name: 'New Apiary' });
      res.json({ message: 'New apiary created', action: result.action });
      break;
    default:
      res.status(400).json({ error: 'Unknown command', action: result.action });
  }
});

module.exports = router;