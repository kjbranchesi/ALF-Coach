// Chat Debug Panel - UI component for running and viewing debug tests

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertCircle, CheckCircle, PlayCircle, Download, XCircle } from 'lucide-react';
import { debugChatSystem, type TestReport } from '../../utils/chat-debugger';

interface ChatDebugPanelProps {
  wizardData: any;
  blueprintId: string;
}

export function ChatDebugPanel({ wizardData, blueprintId }: ChatDebugPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<TestReport[]>([]);
  const [currentScenario, setCurrentScenario] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setReports([]);
    setLogs([]);
    
    // Capture console output
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev, message]);
      originalLog(...args);
    };

    try {
      const testReports = await debugChatSystem(wizardData, blueprintId);
      setReports(testReports);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
      setCurrentScenario('');
    }
  };

  const downloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      wizardData,
      blueprintId,
      reports,
      logs
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-debug-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PARTIAL':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'PASSED' ? 'default' : 
                   status === 'FAILED' ? 'destructive' : 
                   'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>ALF Coach Chat System Debugger</span>
          <div className="flex gap-2">
            <Button
              onClick={runTests}
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <>Running...</>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Run Tests
                </>
              )}
            </Button>
            {reports.length > 0 && (
              <Button
                onClick={downloadReport}
                size="sm"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Test all 10 SOP steps with various scenarios including happy path, refinements, and error handling
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isRunning && (
          <div className="mb-4 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700">
              Running scenario: <strong>{currentScenario || 'Initializing...'}</strong>
            </p>
          </div>
        )}

        {reports.length > 0 && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="findings">Key Findings</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{reports.length}</div>
                      <p className="text-xs text-muted-foreground">Total Scenarios</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">
                        {reports.filter(r => r.overallStatus === 'PASSED').length}
                      </div>
                      <p className="text-xs text-muted-foreground">Passed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600">
                        {reports.filter(r => r.overallStatus === 'FAILED').length}
                      </div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-yellow-600">
                        {reports.filter(r => r.overallStatus === 'PARTIAL').length}
                      </div>
                      <p className="text-xs text-muted-foreground">Partial</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scenarios">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {reports.map((report, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            {getStatusIcon(report.overallStatus)}
                            {report.scenario}
                          </span>
                          {getStatusBadge(report.overallStatus)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-mono">{report.duration}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Steps:</span>
                            <span>{report.summary.passedSteps}/{report.summary.totalSteps}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Context Preserved:</span>
                            <span>{report.contextPreservation.preserved ? 'Yes' : 'No'}</span>
                          </div>
                          {report.summary.errors.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 rounded">
                              <p className="font-semibold text-red-700 mb-1">Errors:</p>
                              {report.summary.errors.map((error, i) => (
                                <p key={i} className="text-xs text-red-600">{error}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="logs">
              <ScrollArea className="h-[400px]">
                <pre className="text-xs font-mono bg-gray-50 p-4 rounded">
                  {logs.join('\n')}
                </pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="findings">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Context Preservation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Context preservation between Step 1 and Step 9: {' '}
                      {reports.some(r => r.contextPreservation.preserved) ? (
                        <span className="text-green-600 font-semibold">Working</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Not Working</span>
                      )}
                    </p>
                    {reports[0]?.contextPreservation.step1Data && (
                      <div className="mt-2 text-sm">
                        <p>Step 1 Data: <code>{reports[0].contextPreservation.step1Data}</code></p>
                        <p>Step 9 Reference: <code>{reports[0].contextPreservation.step9Reference}</code></p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Common Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {[...new Set(reports.flatMap(r => r.summary.errors))].slice(0, 5).map((error, i) => (
                        <li key={i} className="text-red-600">{error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>State Transitions:</span>
                        <span className="font-semibold">
                          {reports.every(r => r.summary.passedSteps > 0) ? 'Working' : 'Issues'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Button States:</span>
                        <span className="font-semibold">Tracked</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Recovery:</span>
                        <span className="font-semibold">
                          {reports.some(r => r.scenario.includes('Recovery')) ? 'Tested' : 'Not Tested'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Integration:</span>
                        <span className="font-semibold">
                          {logs.some(log => log.includes('AI')) ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!isRunning && reports.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Click "Run Tests" to debug the ALF Coach chat system</p>
            <p className="text-sm mt-2">Tests will validate all 10 SOP steps across multiple scenarios</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
