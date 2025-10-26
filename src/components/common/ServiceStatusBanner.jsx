/**
 * ServiceStatusBanner Component
 * 
 * Displays information about available AI services and guides users
 * to configure additional services if desired.
 */

import React from 'react';
import { useServiceStatus } from '../../hooks/useServiceStatus';

export default function ServiceStatusBanner() {
  const { data, isLoading } = useServiceStatus();

  // Don't show anything while loading
  if (isLoading) return null;

  // Don't show if all services are available
  if (data?.hasAnyAI && data?.services?.openai?.available && data?.services?.aws?.available) {
    return null;
  }

  // Show informational banner if some services are missing
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400 dark:text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {data?.hasAnyAI ? 'Enhanced Features Available' : 'AI Features Not Configured'}
          </h3>
          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
            <p className="mb-2">{data?.message}</p>
            
            {!data?.hasAnyAI && (
              <div className="mt-3 space-y-2">
                <p className="font-medium">To enable AI-powered features, you can:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>Recommended:</strong> Connect your own LLM via MCP Server
                    <span className="text-xs block ml-5 mt-1">
                      Use Claude Desktop, GPT-4, or local models - you control the costs
                    </span>
                  </li>
                  <li>
                    Configure OpenAI API for AI analysis
                  </li>
                  <li>
                    Configure AWS services for voice features
                  </li>
                </ul>
                <p className="text-xs mt-2">
                  See the documentation for setup instructions. The app works fully without AI services.
                </p>
              </div>
            )}

            {data?.hasAnyAI && (
              <div className="mt-2">
                <p className="text-xs">Available services:</p>
                <ul className="list-disc list-inside text-xs ml-2 mt-1">
                  {data?.services?.openai?.available && <li>OpenAI AI Analysis</li>}
                  {data?.services?.aws?.available && <li>AWS Voice Features</li>}
                  {data?.services?.mcp?.available && <li>MCP Server Connected</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}