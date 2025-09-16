// ButtonStateTest - Component to test the centralized button state system
import React, { useState } from 'react';
import { useButtonState } from '../../hooks/useButtonState';
import { buttonStateManager } from '../../services/button-state-manager';
import { AnimatedButton } from '../../components/RiveInteractions';
import { Lightbulb, RefreshCw, HelpCircle, Check, Edit, Rocket, Info } from 'lucide-react';

const icons: Record<string, React.ElementType> = {
  Lightbulb,
  RefreshCw,
  HelpCircle,
  Check,
  Edit,
  Rocket,
  Info
};

export function ButtonStateTest() {
  const [stage, setStage] = useState('IDEATION_INITIATOR');
  const [context, setContext] = useState<'default' | 'confirmation' | 'card_confirmation'>('default');
  const [log, setLog] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  const { buttons } = useButtonState({
    stage,
    context,
    onButtonClick: async (action) => {
      addLog(`Button clicked: ${action}`);
      
      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle different actions
      switch (action) {
        case 'start':
          addLog('Starting journey...');
          setStage('IDEATION_BIG_IDEA');
          setContext('default');
          break;
          
        case 'ideas':
          addLog('Showing ideas...');
          break;
          
        case 'confirm':
          addLog('Confirmed! Moving to next stage.');
          setContext('default');
          break;
          
        case 'refine':
          addLog('Refining answer...');
          setContext('default');
          break;
      }
    }
  });
  
  const simulateCardSelection = () => {
    addLog('Card selected - switching to confirmation');
    setContext('card_confirmation');
  };
  
  const simulateTextInput = () => {
    addLog('Text input - switching to confirmation');
    setContext('confirmation');
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Button State Test</h1>
      
      {/* Current State Display */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <p className="font-semibold">Current State:</p>
        <p>Stage: {stage}</p>
        <p>Context: {context}</p>
        <p>Active Buttons: {buttons.length}</p>
      </div>
      
      {/* Control Panel */}
      <div className="mb-6 space-y-2">
        <h2 className="font-semibold mb-2">Test Controls:</h2>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => { setStage('IDEATION_INITIATOR'); }}
            className="px-3 py-1 bg-primary-100 rounded"
          >
            Set Initiator Stage
          </button>
          <button 
            onClick={() => { setStage('IDEATION_BIG_IDEA'); }}
            className="px-3 py-1 bg-primary-100 rounded"
          >
            Set Big Idea Stage
          </button>
          <button 
            onClick={() => { setStage('IDEATION_EQ'); }}
            className="px-3 py-1 bg-primary-100 rounded"
          >
            Set EQ Stage
          </button>
          <button 
            onClick={simulateCardSelection}
            className="px-3 py-1 bg-green-100 rounded"
          >
            Simulate Card Selection
          </button>
          <button 
            onClick={simulateTextInput}
            className="px-3 py-1 bg-green-100 rounded"
          >
            Simulate Text Input
          </button>
          <button 
            onClick={() => buttonStateManager.clearAll()}
            className="px-3 py-1 bg-red-100 rounded"
          >
            Clear All States
          </button>
        </div>
      </div>
      
      {/* Button Display */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Active Buttons:</h2>
        <div className="flex gap-2 flex-wrap">
          {buttons.map((button) => {
            const Icon = icons[button.icon];
            return (
              <AnimatedButton
                key={button.id}
                onClick={() => buttonStateManager.updateButtonState(
                  `${stage}_${context}`,
                  button.id,
                  'loading'
                )}
                variant={button.variant || 'secondary'}
                icon={Icon}
                disabled={button.state === 'disabled' || button.state === 'loading'}
              >
                {button.label}
              </AnimatedButton>
            );
          })}
        </div>
      </div>
      
      {/* Event Log */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Event Log:</h2>
        <div className="h-48 overflow-y-auto font-mono text-sm space-y-1">
          {log.map((entry, i) => (
            <div key={i} className="text-gray-700">{entry}</div>
          ))}
        </div>
      </div>
      
      {/* State History */}
      <div className="mt-6">
        <h2 className="font-semibold mb-2">State Transitions:</h2>
        <div className="space-y-1 text-sm">
          {buttonStateManager.getStateHistory().slice(-5).map((transition, i) => (
            <div key={i} className="text-gray-600">
              {transition.from} → {transition.to} ({transition.trigger})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}