# Archived Code - Old ALF Coach System

This directory contains the archived code from the original ALF Coach implementation.

## Why Archived?

The original system had become unmaintainable due to:
- 13 different chat implementations
- 9-layer architecture making debugging impossible
- Competing state management systems
- Not following the SOP specification

## What's Here?

- `/chat/` - All the old ChatV* implementations
- `/services/` - Complex service layers (ai-conversation-manager, etc.)
- `/context/` - Old context providers (FSMContext, BlueprintContext)
- `/features/` - Old conversational components

## New System

The new system is being built in `/src/core/` with:
- Single SOPFlowManager for state
- Single ChatInterface component
- Direct Gemini integration
- Exact SOP compliance

## Accessing Old Code

If you need to reference old implementations:
1. Look in the appropriate subdirectory
2. DO NOT import or use in new system
3. Only use as reference for features to re-implement

## Archive Date

Archived on: [Current Date]
Reason: Complete system rebuild for maintainability