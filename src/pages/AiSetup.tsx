/**
 * AI Setup Page
 *
 * Provides diagnostic information and setup instructions for AI configuration.
 * Accessed via /app/setup/ai from AI gates.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Heading, Text } from '../design-system';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export function AiSetup() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  // Environment status
  const featureEnabled = import.meta.env.VITE_FEATURE_STAGE_ASSISTANT === 'true';
  const geminiEnabled = import.meta.env.VITE_GEMINI_ENABLED === 'true';
  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;
  const apiKeyMasked = hasApiKey
    ? `${import.meta.env.VITE_GEMINI_API_KEY.slice(0, 8)}...${import.meta.env.VITE_GEMINI_API_KEY.slice(-4)}`
    : 'Not set';

  const isProduction = import.meta.env.PROD;
  const isFullyConfigured = featureEnabled && geminiEnabled && hasApiKey;

  const handleRecheck = async () => {
    setChecking(true);
    // Simulate check (in real implementation, would test AI connectivity)
    await new Promise(resolve => setTimeout(resolve, 1000));
    setChecking(false);
    setLastCheckTime(new Date());
  };

  const copyEnvTemplate = () => {
    const template = `# AI Configuration
VITE_FEATURE_STAGE_ASSISTANT=true
VITE_GEMINI_ENABLED=true
VITE_GEMINI_API_KEY=your_api_key_here`;

    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status indicator component
  const StatusIndicator = ({
    status,
    label
  }: {
    status: 'success' | 'error' | 'warning';
    label: string;
  }) => {
    const icons = {
      success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      error: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      warning: <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    };

    const bgColors = {
      success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/60',
      error: 'bg-red-50 dark:bg-red-950/30 border-red-200/60 dark:border-red-800/60',
      warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/60'
    };

    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColors[status]}`}>
        {icons[status]}
        <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
      {/* Background gradient overlay */}
      <div className="hidden dark:block pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(147,51,234,0.15),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_45%)] opacity-80" />

      <div className="relative">
        <Container className="pt-24 pb-20">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <header className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <Heading level={1} className="text-slate-900 dark:text-slate-50">
                AI Configuration
              </Heading>
              <Text color="secondary" className="max-w-xl mx-auto">
                Configure your AI settings to enable intelligent assistance throughout the app.
              </Text>
            </header>

            {/* Overall Status Card */}
            <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-6">
              {isFullyConfigured ? (
                <StatusIndicator status="success" label="✓ AI is fully configured and ready" />
              ) : (
                <StatusIndicator status="error" label="✗ AI configuration incomplete" />
              )}

              {lastCheckTime && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                  Last checked: {lastCheckTime.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Configuration Status */}
            <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-6 space-y-4">
              <Heading level={3} className="text-slate-900 dark:text-slate-50">
                Configuration Status
              </Heading>

              <div className="space-y-3">
                <StatusIndicator
                  status={featureEnabled ? 'success' : 'error'}
                  label={`Stage Assistant Feature: ${featureEnabled ? 'Enabled' : 'Disabled'}`}
                />
                <StatusIndicator
                  status={geminiEnabled ? 'success' : 'error'}
                  label={`Gemini AI: ${geminiEnabled ? 'Enabled' : 'Disabled'}`}
                />
                <StatusIndicator
                  status={hasApiKey ? 'success' : 'error'}
                  label={`API Key: ${apiKeyMasked}`}
                />
              </div>

              <button
                onClick={handleRecheck}
                disabled={checking}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-b from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Recheck Configuration'
                )}
              </button>
            </div>

            {/* Setup Instructions */}
            {!isFullyConfigured && (
              <div className="squircle-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-6 space-y-4">
                <Heading level={3} className="text-slate-900 dark:text-slate-50">
                  Setup Instructions
                </Heading>

                {isProduction ? (
                  // Production instructions
                  <div className="space-y-4">
                    <div className="squircle-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 p-4">
                      <Text size="sm" className="text-amber-900 dark:text-amber-100">
                        <strong>Note:</strong> You're running in production mode. Environment variables
                        are set at build time and cannot be changed without rebuilding.
                      </Text>
                    </div>

                    <div className="space-y-2">
                      <Text size="sm" className="font-medium text-slate-900 dark:text-slate-50">
                        To configure AI in production:
                      </Text>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <li>Set environment variables in your hosting platform (Netlify, Vercel, etc.)</li>
                        <li>Rebuild and redeploy your application</li>
                        <li>Ensure all three variables are set correctly</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  // Development instructions
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Text size="sm" className="font-medium text-slate-900 dark:text-slate-50">
                        1. Create or update your .env file:
                      </Text>
                      <div className="relative">
                        <pre className="squircle-lg bg-slate-900 dark:bg-slate-950 p-4 overflow-x-auto text-xs text-slate-50 font-mono">
{`# AI Configuration
VITE_FEATURE_STAGE_ASSISTANT=true
VITE_GEMINI_ENABLED=true
VITE_GEMINI_API_KEY=your_api_key_here`}
                        </pre>
                        <button
                          onClick={copyEnvTemplate}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Copy to clipboard"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Text size="sm" className="font-medium text-slate-900 dark:text-slate-50">
                        2. Get your Gemini API key:
                      </Text>
                      <a
                        href="https://ai.google.dev/gemini-api/docs/api-key"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-900 dark:text-slate-50 font-medium transition-colors"
                      >
                        <span>Get API Key from Google AI Studio</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="space-y-2">
                      <Text size="sm" className="font-medium text-slate-900 dark:text-slate-50">
                        3. Restart your development server:
                      </Text>
                      <pre className="squircle-lg bg-slate-900 dark:bg-slate-950 p-4 text-xs text-slate-50 font-mono">
{`npm run dev`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate('/app/dashboard')}
                className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
