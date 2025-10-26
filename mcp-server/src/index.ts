#!/usr/bin/env node

/**
 * Mellifera MCP Server
 * 
 * Provides beekeeping tools and context to AI assistants via Model Context Protocol.
 * Enables users to leverage their own LLM service for AI-powered beekeeping insights.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const API_URL = process.env.MELLIFERA_API_URL || 'http://localhost:5050';
const API_KEY = process.env.MELLIFERA_API_KEY;

if (!API_KEY) {
  console.error('Error: MELLIFERA_API_KEY environment variable is required');
  process.exit(1);
}

// API client
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Define tools
const tools: Tool[] = [
  {
    name: 'analyze_hive_health',
    description: 'Analyze the health of a specific hive based on latest inspection data. Returns health score, recommendations, and alerts.',
    inputSchema: {
      type: 'object',
      properties: {
        hiveId: {
          type: 'string',
          description: 'The ID of the hive to analyze',
        },
      },
      required: ['hiveId'],
    },
  },
  {
    name: 'get_hive_details',
    description: 'Get detailed information about a specific hive including boxes, frames, queen, and recent activity.',
    inputSchema: {
      type: 'object',
      properties: {
        hiveId: {
          type: 'string',
          description: 'The ID of the hive',
        },
      },
      required: ['hiveId'],
    },
  },
  {
    name: 'list_all_hives',
    description: 'List all hives with their current status, location, and basic metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        apiaryId: {
          type: 'string',
          description: 'Optional: Filter by apiary ID',
        },
      },
    },
  },
  {
    name: 'recommend_treatment',
    description: 'Get treatment recommendations based on symptoms, hive history, and current conditions.',
    inputSchema: {
      type: 'object',
      properties: {
        hiveId: {
          type: 'string',
          description: 'The ID of the hive',
        },
        symptoms: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of observed symptoms',
        },
      },
      required: ['hiveId', 'symptoms'],
    },
  },
  {
    name: 'get_inspection_history',
    description: 'Get inspection history for a hive, showing trends and patterns over time.',
    inputSchema: {
      type: 'object',
      properties: {
        hiveId: {
          type: 'string',
          description: 'The ID of the hive',
        },
        limit: {
          type: 'number',
          description: 'Number of inspections to retrieve (default: 10)',
        },
      },
      required: ['hiveId'],
    },
  },
  {
    name: 'predict_honey_yield',
    description: 'Predict honey yield based on hive strength, season, and historical data.',
    inputSchema: {
      type: 'object',
      properties: {
        hiveId: {
          type: 'string',
          description: 'The ID of the hive',
        },
      },
      required: ['hiveId'],
    },
  },
  {
    name: 'get_seasonal_advice',
    description: 'Get season-specific beekeeping advice based on location and time of year.',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'Location (city, state, or coordinates)',
        },
        month: {
          type: 'number',
          description: 'Month (1-12)',
        },
      },
      required: ['location', 'month'],
    },
  },
];

// Tool handlers
async function handleAnalyzeHiveHealth(args: any) {
  try {
    const { hiveId } = args;
    const response = await api.get(`/api/hives/${hiveId}`);
    const hive = response.data;

    // Calculate health score based on various factors
    const healthScore = calculateHealthScore(hive);
    const recommendations = generateRecommendations(hive);
    const alerts = checkForAlerts(hive);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          hiveId,
          hiveName: hive.name,
          healthScore,
          status: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Attention',
          recommendations,
          alerts,
          lastInspection: hive.inspections?.[0]?.date || 'No recent inspections',
        }, null, 2),
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error analyzing hive: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleGetHiveDetails(args: any) {
  try {
    const { hiveId } = args;
    const response = await api.get(`/api/hives/${hiveId}`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error fetching hive details: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleListAllHives(args: any) {
  try {
    const { apiaryId } = args;
    const url = apiaryId ? `/api/hives?apiaryId=${apiaryId}` : '/api/hives/all';
    const response = await api.get(url);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error listing hives: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleRecommendTreatment(args: any) {
  try {
    const { hiveId, symptoms } = args;
    const response = await api.get(`/api/hives/${hiveId}`);
    const hive = response.data;

    const recommendations = analyzeSymptomsAndRecommend(symptoms, hive);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          hiveId,
          symptoms,
          recommendations,
          urgency: determineUrgency(symptoms),
          estimatedCost: estimateTreatmentCost(recommendations),
        }, null, 2),
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error recommending treatment: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleGetInspectionHistory(args: any) {
  try {
    const { hiveId, limit = 10 } = args;
    const response = await api.get(`/api/inspections?hiveId=${hiveId}&limit=${limit}`);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error fetching inspection history: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handlePredictHoneyYield(args: any) {
  try {
    const { hiveId } = args;
    const response = await api.get(`/api/hives/${hiveId}`);
    const hive = response.data;

    const prediction = predictYield(hive);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(prediction, null, 2),
      }],
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error predicting yield: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleGetSeasonalAdvice(args: any) {
  const { location, month } = args;
  const advice = getSeasonalAdvice(location, month);
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(advice, null, 2),
    }],
  };
}

// Helper functions
function calculateHealthScore(hive: any): number {
  let score = 100;
  
  // Deduct points for issues
  if (!hive.queen || !hive.queen.present) score -= 30;
  if (hive.population < 5) score -= 20;
  if (hive.honeyStores < 3) score -= 15;
  if (hive.diseasePresent) score -= 25;
  
  return Math.max(0, score);
}

function generateRecommendations(hive: any): string[] {
  const recommendations = [];
  
  if (!hive.queen?.present) {
    recommendations.push('URGENT: No queen detected. Consider requeening immediately.');
  }
  if (hive.population < 5) {
    recommendations.push('Low population. Check for disease and consider combining with stronger hive.');
  }
  if (hive.honeyStores < 3) {
    recommendations.push('Low honey stores. Begin supplemental feeding.');
  }
  if (hive.children?.length > 8) {
    recommendations.push('Consider adding super - hive is strong and may need more space.');
  }
  
  return recommendations.length > 0 ? recommendations : ['Hive appears healthy. Continue regular monitoring.'];
}

function checkForAlerts(hive: any): string[] {
  const alerts = [];
  
  if (hive.diseasePresent) alerts.push('Disease detected - immediate action required');
  if (!hive.queen?.present) alerts.push('Queen missing - critical situation');
  if (hive.honeyStores < 2) alerts.push('Critically low food stores');
  
  return alerts;
}

function analyzeSymptomsAndRecommend(symptoms: string[], hive: any): any[] {
  const recommendations = [];
  
  // Simple symptom matching (in production, this would be more sophisticated)
  if (symptoms.some(s => s.toLowerCase().includes('mite'))) {
    recommendations.push({
      treatment: 'Varroa Mite Treatment',
      options: ['Formic Acid', 'Oxalic Acid', 'Apivar'],
      timing: 'Immediate',
      notes: 'Monitor mite levels weekly during treatment',
    });
  }
  
  if (symptoms.some(s => s.toLowerCase().includes('foulbrood'))) {
    recommendations.push({
      treatment: 'American Foulbrood Protocol',
      options: ['Burn infected equipment', 'Antibiotic treatment (if legal)', 'Report to authorities'],
      timing: 'URGENT - Quarantine immediately',
      notes: 'This is a notifiable disease in many jurisdictions',
    });
  }
  
  return recommendations;
}

function determineUrgency(symptoms: string[]): string {
  const urgent = ['foulbrood', 'nosema', 'queen', 'dead'];
  if (symptoms.some(s => urgent.some(u => s.toLowerCase().includes(u)))) {
    return 'URGENT';
  }
  return 'Normal';
}

function estimateTreatmentCost(recommendations: any[]): string {
  // Simplified cost estimation
  return '$20-$100 depending on treatment chosen';
}

function predictYield(hive: any): any {
  const boxCount = hive.children?.length || 0;
  const population = hive.population || 5;
  const baseYield = 30; // lbs per super
  
  const estimatedYield = Math.max(0, (boxCount - 2) * baseYield * (population / 10));
  
  return {
    estimatedYield: `${Math.round(estimatedYield)} lbs`,
    confidence: boxCount > 2 && population > 7 ? 'High' : 'Medium',
    factors: {
      boxCount,
      population,
      season: 'Adjust based on local nectar flow',
    },
    notes: 'Actual yield depends on weather, nectar flow, and hive management',
  };
}

function getSeasonalAdvice(location: string, month: number): any {
  const seasons = {
    spring: [3, 4, 5],
    summer: [6, 7, 8],
    fall: [9, 10, 11],
    winter: [12, 1, 2],
  };
  
  let season = 'spring';
  for (const [s, months] of Object.entries(seasons)) {
    if (months.includes(month)) {
      season = s;
      break;
    }
  }
  
  const advice: any = {
    spring: {
      tasks: ['Check for queen', 'Add supers', 'Monitor for swarms', 'Begin feeding if needed'],
      focus: 'Growth and expansion',
      warnings: ['Swarm season', 'Varroa mites increasing'],
    },
    summer: {
      tasks: ['Harvest honey', 'Ensure water source', 'Monitor for pests', 'Provide ventilation'],
      focus: 'Honey production and hive health',
      warnings: ['Heat stress', 'Robbing behavior', 'Wasp attacks'],
    },
    fall: {
      tasks: ['Reduce entrances', 'Treat for mites', 'Ensure food stores', 'Combine weak hives'],
      focus: 'Winter preparation',
      warnings: ['Varroa mites peak', 'Robbing', 'Yellow jackets'],
    },
    winter: {
      tasks: ['Minimal inspections', 'Check food stores', 'Ensure ventilation', 'Protect from wind'],
      focus: 'Survival and minimal disturbance',
      warnings: ['Starvation', 'Moisture buildup', 'Mouse intrusion'],
    },
  };
  
  return {
    location,
    month,
    season,
    ...advice[season],
  };
}

// Create and start server
const server = new Server(
  {
    name: 'mellifera-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'analyze_hive_health':
      return await handleAnalyzeHiveHealth(args);
    case 'get_hive_details':
      return await handleGetHiveDetails(args);
    case 'list_all_hives':
      return await handleListAllHives(args);
    case 'recommend_treatment':
      return await handleRecommendTreatment(args);
    case 'get_inspection_history':
      return await handleGetInspectionHistory(args);
    case 'predict_honey_yield':
      return await handlePredictHoneyYield(args);
    case 'get_seasonal_advice':
      return await handleGetSeasonalAdvice(args);
    default:
      return {
        content: [{
          type: 'text',
          text: `Unknown tool: ${name}`,
        }],
        isError: true,
      };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Mellifera MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});