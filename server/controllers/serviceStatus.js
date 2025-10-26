/**
 * Service Status Controller
 * 
 * Provides API endpoints for checking service availability.
 * Allows frontend to adapt UI based on available features.
 */

const { getServiceStatus, getUnavailableMessage } = require('../services/serviceAvailability');

/**
 * GET /api/services/status
 * Returns the current availability status of all services
 */
function getStatus(req, res) {
  const status = getServiceStatus();
  
  res.json({
    services: {
      openai: {
        available: status.openai,
        message: status.openai ? 'OpenAI integration active' : getUnavailableMessage('openai'),
      },
      aws: {
        available: status.aws,
        message: status.aws ? 'AWS services active' : getUnavailableMessage('aws'),
      },
      mcp: {
        available: status.mcp,
        message: status.mcp ? 'MCP server connected' : getUnavailableMessage('mcp'),
      },
    },
    hasAnyAI: status.hasAnyAI,
    message: status.hasAnyAI 
      ? 'AI features are available' 
      : getUnavailableMessage('ai'),
  });
}

/**
 * GET /api/services/features
 * Returns which features are available based on service configuration
 */
function getAvailableFeatures(req, res) {
  const status = getServiceStatus();
  
  const features = {
    // Core features (always available)
    hiveManagement: true,
    inspectionTracking: true,
    treatmentLogging: true,
    feedingTracking: true,
    apiaryManagement: true,
    
    // AI-powered features (require at least one AI service)
    aiAnalysis: status.hasAnyAI,
    diseaseDetection: status.hasAnyAI,
    treatmentRecommendations: status.hasAnyAI,
    yieldPrediction: status.hasAnyAI,
    
    // Voice features (require AWS)
    voiceCommands: status.aws,
    voiceInspections: status.aws,
    textToSpeech: status.aws,
    
    // Advanced AI (require OpenAI or MCP)
    naturalLanguageQuery: status.openai || status.mcp,
    conversationalAssistant: status.openai || status.mcp,
  };
  
  res.json({
    features,
    serviceStatus: status,
  });
}

module.exports = {
  getStatus,
  getAvailableFeatures,
};