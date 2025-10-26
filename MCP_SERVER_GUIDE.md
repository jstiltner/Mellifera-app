# Mellifera MCP Server Integration Guide

## What is MCP (Model Context Protocol)?

MCP is an open protocol that enables AI applications to securely connect to data sources and tools. For Mellifera, this means users can:

1. **Use Their Own LLM** - Connect Claude, GPT-4, local models, or any MCP-compatible AI
2. **Control Costs** - No charges to your API keys
3. **Privacy** - Data stays with the user's chosen provider
4. **Flexibility** - Switch between different AI providers easily

## Architecture Overview

```
┌─────────────────┐
│  Mellifera App  │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Mellifera API  │
│   (Backend)     │
└────────┬────────┘
         │
         │ MCP Protocol
         │
┌────────▼────────┐
│   MCP Server    │
│  (User's LLM)   │
└─────────────────┘
```

## Benefits of MCP Integration

### For Users
- ✅ Use their preferred AI service
- ✅ No API costs charged to app owner
- ✅ Better privacy and data control
- ✅ Can use local/offline models
- ✅ Consistent interface across providers

### For Developers
- ✅ No API key management
- ✅ No usage costs
- ✅ Easier scaling
- ✅ Provider-agnostic
- ✅ Future-proof architecture

## Implementation Strategy

### Phase 1: MCP Server Setup (Current)
1. Create MCP server package
2. Define beekeeping-specific tools
3. Implement context providers
4. Add authentication

### Phase 2: Backend Integration
1. MCP client in backend
2. Fallback to direct API if no MCP
3. Service availability detection
4. Graceful degradation

### Phase 3: Frontend Integration
1. MCP configuration UI
2. Service status display
3. Feature availability indicators
4. User guidance

## MCP Server for Mellifera

### Tools Provided

The Mellifera MCP server exposes these tools to any connected LLM:

#### 1. Hive Analysis
```typescript
{
  name: "analyze_hive_health",
  description: "Analyze hive health based on inspection data",
  inputSchema: {
    hiveId: string,
    inspectionData: object
  }
}
```

#### 2. Treatment Recommendations
```typescript
{
  name: "recommend_treatment",
  description: "Recommend treatments based on hive conditions",
  inputSchema: {
    symptoms: string[],
    hiveHistory: object
  }
}
```

#### 3. Seasonal Advice
```typescript
{
  name: "get_seasonal_advice",
  description: "Get season-specific beekeeping advice",
  inputSchema: {
    location: string,
    month: number,
    hiveCount: number
  }
}
```

#### 4. Disease Detection
```typescript
{
  name: "detect_disease",
  description: "Identify potential diseases from symptoms",
  inputSchema: {
    symptoms: string[],
    images?: string[]
  }
}
```

#### 5. Yield Prediction
```typescript
{
  name: "predict_honey_yield",
  description: "Predict honey yield based on historical data",
  inputSchema: {
    hiveData: object,
    weatherData: object
  }
}
```

### Context Providers

The MCP server provides context about:

1. **Hive Data** - Current state of all hives
2. **Historical Inspections** - Past inspection records
3. **Treatment History** - Applied treatments and results
4. **Weather Patterns** - Local weather data
5. **Best Practices** - Beekeeping knowledge base

## Setup Instructions

### Option 1: Use Existing MCP Server (Recommended)

If you already have an MCP-compatible AI assistant (like Claude Desktop):

1. **Install Mellifera MCP Server**
```bash
cd mcp-server
npm install
npm run build
```

2. **Configure Your AI Assistant**

For Claude Desktop, add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "mellifera": {
      "command": "node",
      "args": ["/path/to/mellifera-app/mcp-server/dist/index.js"],
      "env": {
        "MELLIFERA_API_URL": "http://localhost:5050",
        "MELLIFERA_API_KEY": "your-api-key"
      }
    }
  }
}
```

3. **Restart Your AI Assistant**

The Mellifera tools will now be available!

### Option 2: Direct API Integration (Fallback)

If MCP is not available, the app falls back to direct API calls:

```env
# .env file
OPENAI_API_KEY=your-key  # Optional
AWS_ACCESS_KEY_ID=your-key  # Optional
```

## Using MCP Features

### In Claude Desktop

```
User: "Analyze the health of hive #3"

Claude: [Uses analyze_hive_health tool]
Based on the latest inspection data, Hive #3 shows:
- Strong population (8/10 frames covered)
- Good brood pattern
- Adequate honey stores
- No signs of disease

Recommendation: Continue current management. 
Consider adding super in 2 weeks if nectar flow continues.
```

### In the Mellifera App

The app automatically detects MCP availability:

```javascript
// Frontend shows:
✅ AI Features: Connected via MCP
   Using: Claude Desktop
   
// Or if not available:
⚠️  AI Features: Limited
   Connect MCP server for full AI capabilities
```

## Development

### Creating the MCP Server

```bash
# In project root
mkdir mcp-server
cd mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
```

### Server Structure

```
mcp-server/
├── src/
│   ├── index.ts          # Main server
│   ├── tools/            # Tool implementations
│   │   ├── hiveAnalysis.ts
│   │   ├── treatments.ts
│   │   └── predictions.ts
│   ├── context/          # Context providers
│   │   ├── hiveData.ts
│   │   └── knowledge.ts
│   └── utils/            # Utilities
├── package.json
└── tsconfig.json
```

### Tool Implementation Example

```typescript
// src/tools/hiveAnalysis.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const analyzeHiveHealth: Tool = {
  name: 'analyze_hive_health',
  description: 'Analyze hive health based on inspection data',
  inputSchema: {
    type: 'object',
    properties: {
      hiveId: {
        type: 'string',
        description: 'The ID of the hive to analyze'
      },
      inspectionData: {
        type: 'object',
        description: 'Latest inspection data'
      }
    },
    required: ['hiveId', 'inspectionData']
  }
};

export async function handleHiveAnalysis(args: any) {
  const { hiveId, inspectionData } = args;
  
  // Fetch hive data from Mellifera API
  const response = await fetch(
    `${process.env.MELLIFERA_API_URL}/api/hives/${hiveId}`
  );
  const hive = await response.json();
  
  // Analyze and return insights
  return {
    health_score: calculateHealthScore(inspectionData),
    recommendations: generateRecommendations(hive, inspectionData),
    alerts: checkForIssues(inspectionData)
  };
}
```

## Security Considerations

### Authentication

```typescript
// MCP server validates API key
const apiKey = process.env.MELLIFERA_API_KEY;
if (!apiKey) {
  throw new Error('MELLIFERA_API_KEY required');
}

// Include in all API requests
headers: {
  'Authorization': `Bearer ${apiKey}`
}
```

### Rate Limiting

```typescript
// Implement rate limiting per user
const rateLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'hour'
});
```

### Data Privacy

- MCP server runs locally on user's machine
- No data sent to third parties
- User controls all AI interactions
- Audit logs available

## Testing

### Test MCP Server

```bash
# Start Mellifera API
npm run dev:server

# In another terminal, test MCP server
cd mcp-server
npm test

# Or manually test tools
node dist/index.js --test analyze_hive_health
```

### Integration Testing

```bash
# Test with Claude Desktop
# 1. Configure claude_desktop_config.json
# 2. Restart Claude
# 3. Try: "Analyze my hives"
```

## Troubleshooting

### MCP Server Not Connecting

1. Check server is running: `ps aux | grep mellifera`
2. Verify API URL in config
3. Check API key is valid
4. Review logs: `tail -f mcp-server/logs/server.log`

### Tools Not Available

1. Restart AI assistant
2. Check MCP server logs
3. Verify tool registration
4. Test tool directly: `npm run test:tools`

### Performance Issues

1. Enable caching: `ENABLE_CACHE=true`
2. Reduce context size
3. Use streaming responses
4. Implement request batching

## Roadmap

### v1.0 (Current)
- ✅ Basic MCP server structure
- ✅ Core beekeeping tools
- ✅ Hive data context
- ✅ Authentication

### v1.1 (Next)
- [ ] Image analysis tools
- [ ] Weather integration
- [ ] Advanced predictions
- [ ] Multi-language support

### v2.0 (Future)
- [ ] Real-time notifications
- [ ] Collaborative features
- [ ] Custom tool creation
- [ ] Plugin system

## Resources

- **MCP Specification**: https://modelcontextprotocol.io
- **SDK Documentation**: https://github.com/modelcontextprotocol/sdk
- **Example Servers**: https://github.com/modelcontextprotocol/servers
- **Mellifera API Docs**: http://localhost:5050/api-docs

## Support

For MCP-related questions:
- GitHub Issues: https://github.com/jstiltner/Mellifera-app/issues
- Email: mr@jasonstiltner.com
- MCP Discord: https://discord.gg/modelcontextprotocol

---

**Note**: MCP integration is optional. The app works fully without it, but MCP provides enhanced AI capabilities when available.