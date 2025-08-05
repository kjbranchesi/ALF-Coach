# ALF Coach - New Architecture

This is a complete rebuild of ALF Coach following the SOP (Standard Operating Procedure) document exactly.

## Architecture Overview

### Core Principles
- **Single State Machine**: One SOPFlowManager controls all flow
- **3-Layer Architecture**: Types → Services → Components
- **No Competing Systems**: One chat, one flow, one source of truth
- **SOP Compliance**: Exact implementation of the 10-step flow

### Key Components

#### 1. Core Layer (`/src/core/`)
- `SOPTypes.ts` - All type definitions in one place
- `SOPFlowManager.ts` - Single state machine for entire flow

#### 2. Services Layer (`/src/services/`)
- `GeminiService.ts` - Direct Gemini API integration (no abstractions)
- Future: `FirebaseService.ts` for persistence

#### 3. Components Layer (`/src/components/`)
- `ChatInterface.tsx` - Main orchestrator
- `stages/` - Stage-specific components
  - `WizardFlow.tsx` - Initial setup wizard
  - `StageInitiator.tsx` - 3-step process for each stage
  - `StageClarifier.tsx` - Stage summary and progression
- UI components for chat interaction

## SOP Flow Implementation

### 1. Wizard (Setup)
- Grade level selection
- Subject area
- Project duration
- ALF focus preference

### 2. Three Main Stages (each with 3 steps)
- **IDEATION**: Big Idea → Essential Question → Challenge
- **JOURNEY**: Hook → Activities → Reflection
- **DELIVERABLES**: Products → Assessment → Timeline

### 3. Interaction Pattern
- Stage Initiator: 3-step guided process
- Quick Replies: Ideas/What-If/Help during steps
- Stage Clarifier: Continue/Refine/Help at stage end

## Getting Started

1. Copy `.env.example` to `.env` and add your Gemini API key
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

## Key Improvements from Old System

1. **Single Chat Implementation** (was 13 different ones)
2. **Proper State Management** (no more competing state systems)
3. **Clear UI States** (no more infinite scroll or disabled inputs)
4. **Accurate Progress Tracking** (no more "step 10 of 9")
5. **Working Quick Replies** (buttons appear when appropriate)
6. **Clean AI Responses** (no more repetitive academic language)
7. **Proper Branding** (ALF, not ProjectCraft)

## Development Status

✅ Core architecture complete
✅ Type system defined
✅ State management implemented
✅ UI components built
✅ Stage components created
🔄 AI integration (basic implementation)
⏳ Firebase integration (not started)
⏳ Advanced features (thinking mode, etc.)

## Next Steps

1. Test the basic flow end-to-end
2. Refine AI prompts for better responses
3. Add Firebase for data persistence
4. Implement export functionality
5. Add advanced features once foundation is solid