/**
 * Service Availability Checker
 * 
 * Checks which AI services are available based on environment configuration.
 * Provides graceful fallbacks when services are not configured.
 */

const serviceAvailability = {
  openai: false,
  aws: false,
  mcp: false,
};

/**
 * Check if OpenAI service is available
 */
function checkOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  serviceAvailability.openai = !!apiKey;
  return serviceAvailability.openai;
}

/**
 * Check if AWS services are available
 */
function checkAWS() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  
  serviceAvailability.aws = !!(accessKeyId && secretAccessKey && region);
  return serviceAvailability.aws;
}

/**
 * Check if MCP server is configured
 */
function checkMCP() {
  const mcpUrl = process.env.MCP_SERVER_URL;
  serviceAvailability.mcp = !!mcpUrl;
  return serviceAvailability.mcp;
}

/**
 * Initialize all service checks
 */
function initializeServiceChecks() {
  checkOpenAI();
  checkAWS();
  checkMCP();
  
  console.log('\n=== Service Availability ===');
  console.log(`OpenAI: ${serviceAvailability.openai ? '✓ Available' : '✗ Not configured'}`);
  console.log(`AWS: ${serviceAvailability.aws ? '✓ Available' : '✗ Not configured'}`);
  console.log(`MCP Server: ${serviceAvailability.mcp ? '✓ Available' : '✗ Not configured'}`);
  
  if (!serviceAvailability.openai && !serviceAvailability.aws && !serviceAvailability.mcp) {
    console.log('\n⚠️  No AI services configured. AI features will be unavailable.');
    console.log('   To enable AI features, configure one of the following:');
    console.log('   1. Set OPENAI_API_KEY for OpenAI integration');
    console.log('   2. Set AWS credentials for AWS services');
    console.log('   3. Set MCP_SERVER_URL to connect your own LLM via MCP');
    console.log('   See .env.example for configuration details.\n');
  } else {
    console.log('\n✓ AI services available\n');
  }
}

/**
 * Get current service availability status
 */
function getServiceStatus() {
  return {
    ...serviceAvailability,
    hasAnyAI: serviceAvailability.openai || serviceAvailability.aws || serviceAvailability.mcp,
  };
}

/**
 * Get user-friendly message for unavailable service
 */
function getUnavailableMessage(service) {
  const messages = {
    openai: 'OpenAI integration is not configured. To enable AI-powered analysis, set OPENAI_API_KEY in your environment or connect your own LLM via MCP.',
    aws: 'AWS services are not configured. To enable voice features and advanced AI, set AWS credentials in your environment.',
    mcp: 'MCP server is not configured. To use your own LLM service, set MCP_SERVER_URL in your environment. See MCP_SERVER_GUIDE.md for setup instructions.',
    ai: 'No AI services are configured. The app will function normally for hive management, but AI-powered features will be unavailable. To enable AI features, configure OpenAI, AWS, or connect your own LLM via MCP.',
  };
  
  return messages[service] || 'Service not available';
}

/**
 * Middleware to check service availability for protected routes
 */
function requireService(service) {
  return (req, res, next) => {
    if (!serviceAvailability[service]) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: getUnavailableMessage(service),
        service,
      });
    }
    next();
  };
}

/**
 * Middleware to check if any AI service is available
 */
function requireAnyAI(req, res, next) {
  const hasAnyAI = serviceAvailability.openai || serviceAvailability.aws || serviceAvailability.mcp;
  
  if (!hasAnyAI) {
    return res.status(503).json({
      error: 'AI Services Unavailable',
      message: getUnavailableMessage('ai'),
      availableServices: serviceAvailability,
    });
  }
  next();
}

module.exports = {
  initializeServiceChecks,
  getServiceStatus,
  getUnavailableMessage,
  requireService,
  requireAnyAI,
  serviceAvailability,
};