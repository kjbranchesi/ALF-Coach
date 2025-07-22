// ButtonFramework.js - Codified button system for conversational UI

export const ButtonTypes = {
  // Primary Actions - Blue (move forward, confirm)
  PRIMARY: {
    id: 'primary',
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
    purpose: 'Main progressive actions that move the conversation forward'
  },
  
  // Suggestions - Light Blue (AI suggestions, ideas)
  SUGGESTION: {
    id: 'suggestion',
    className: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200',
    purpose: 'AI-generated suggestions for user consideration'
  },
  
  // Help/Info - Gray (get help, see examples)
  HELP: {
    id: 'help',
    className: 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200',
    purpose: 'Request assistance, examples, or additional information'
  },
  
  // Edit/Modify - Amber (revise, change)
  EDIT: {
    id: 'edit',
    className: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200',
    purpose: 'Modify or revise existing content'
  },
  
  // Success/Confirm - Green (accept, complete)
  SUCCESS: {
    id: 'success',
    className: 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200',
    purpose: 'Confirm completion or accept suggestions'
  },
  
  // Warning/Caution - Orange (consistency checks)
  WARNING: {
    id: 'warning',
    className: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200',
    purpose: 'Actions that may affect other parts of the project'
  },
  
  // Neutral/Secondary - Slate (skip, continue)
  NEUTRAL: {
    id: 'neutral',
    className: 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200',
    purpose: 'Secondary actions that don\'t change data'
  }
};

export const ButtonCommands = {
  // Navigation Commands
  CONTINUE: { type: 'navigation', action: 'continue', buttonType: ButtonTypes.NEUTRAL },
  SKIP: { type: 'navigation', action: 'skip', buttonType: ButtonTypes.NEUTRAL },
  BACK: { type: 'navigation', action: 'back', buttonType: ButtonTypes.NEUTRAL },
  
  // Content Commands
  GET_IDEAS: { type: 'content', action: 'get-ideas', buttonType: ButtonTypes.HELP },
  SEE_EXAMPLES: { type: 'content', action: 'see-examples', buttonType: ButtonTypes.HELP },
  SHOW_TIPS: { type: 'content', action: 'help-tips', buttonType: ButtonTypes.HELP },
  
  // Edit Commands
  EDIT_VALUE: { type: 'edit', action: 'edit', buttonType: ButtonTypes.EDIT },
  RETRY: { type: 'edit', action: 'retry', buttonType: ButtonTypes.EDIT },
  REVISE: { type: 'edit', action: 'revise', buttonType: ButtonTypes.EDIT },
  
  // Confirmation Commands
  ACCEPT: { type: 'confirm', action: 'accept', buttonType: ButtonTypes.SUCCESS },
  CONFIRM_CHANGES: { type: 'confirm', action: 'accept-changes', buttonType: ButtonTypes.SUCCESS },
  COMPLETE: { type: 'confirm', action: 'complete', buttonType: ButtonTypes.SUCCESS },
  
  // Warning Commands
  SHOW_IMPACT: { type: 'warning', action: 'show-changes', buttonType: ButtonTypes.WARNING },
  KEEP_ORIGINAL: { type: 'warning', action: 'keep-original', buttonType: ButtonTypes.WARNING },
  
  // Suggestion Commands
  SELECT_SUGGESTION: { type: 'suggestion', action: 'select', buttonType: ButtonTypes.SUGGESTION },
  MORE_SUGGESTIONS: { type: 'suggestion', action: 'more-suggestions', buttonType: ButtonTypes.SUGGESTION }
};

// Icon mappings (using Lucide React icons)
export const ButtonIcons = {
  // Navigation
  ArrowRight: 'arrow-right',
  ArrowLeft: 'arrow-left',
  SkipForward: 'skip-forward',
  
  // Content
  Lightbulb: 'lightbulb',
  FileText: 'file-text',
  HelpCircle: 'help-circle',
  Info: 'info',
  
  // Edit
  Edit: 'edit',
  RefreshCw: 'refresh-cw',
  Edit3: 'edit-3',
  
  // Confirmation
  Check: 'check',
  CheckCircle: 'check-circle',
  ThumbsUp: 'thumbs-up',
  
  // Warning
  AlertTriangle: 'alert-triangle',
  Eye: 'eye',
  Shield: 'shield',
  
  // General
  Plus: 'plus',
  X: 'x',
  ChevronRight: 'chevron-right',
  Send: 'send',
  Sparkles: 'sparkles'
};

// Button text should be clear and action-oriented
export const ButtonTextGuidelines = {
  maxLength: 25, // Characters
  structure: '[Action] [Object]', // e.g., "Get Ideas", "See Examples"
  tone: 'professional', // No emojis, clear language
  voice: 'active' // Use active voice
};

// Validate button configuration
export const validateButton = (text, command, icon) => {
  const errors = [];
  
  // Check text length
  if (text.length > ButtonTextGuidelines.maxLength) {
    errors.push(`Button text too long: ${text.length} chars (max: ${ButtonTextGuidelines.maxLength})`);
  }
  
  // Check for emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
  if (emojiRegex.test(text)) {
    errors.push('Button text contains emojis - use icons instead');
  }
  
  // Check command validity
  const validCommands = Object.values(ButtonCommands).map(cmd => cmd.action);
  if (!validCommands.includes(command)) {
    errors.push(`Invalid command: ${command}`);
  }
  
  // Check icon validity
  const validIcons = Object.values(ButtonIcons);
  if (icon && !validIcons.includes(icon)) {
    errors.push(`Invalid icon: ${icon}`);
  }
  
  return errors;
};

// Get appropriate button style for a command
export const getButtonStyle = (command) => {
  const cmdConfig = Object.values(ButtonCommands).find(cmd => cmd.action === command);
  return cmdConfig ? cmdConfig.buttonType.className : ButtonTypes.NEUTRAL.className;
};

// Example button configurations
export const ExampleButtons = {
  // Help buttons
  getIdeas: {
    text: "Get Ideas",
    command: "get-ideas",
    icon: ButtonIcons.Lightbulb,
    style: ButtonTypes.HELP
  },
  seeExamples: {
    text: "See Examples",
    command: "see-examples",
    icon: ButtonIcons.FileText,
    style: ButtonTypes.HELP
  },
  
  // Edit buttons
  tryAgain: {
    text: "Try Again",
    command: "retry",
    icon: ButtonIcons.RefreshCw,
    style: ButtonTypes.EDIT
  },
  editValue: {
    text: "Edit",
    command: "edit",
    icon: ButtonIcons.Edit,
    style: ButtonTypes.EDIT
  },
  
  // Confirmation buttons
  accept: {
    text: "Accept",
    command: "accept",
    icon: ButtonIcons.Check,
    style: ButtonTypes.SUCCESS
  },
  continue: {
    text: "Continue",
    command: "continue",
    icon: ButtonIcons.ArrowRight,
    style: ButtonTypes.PRIMARY
  },
  
  // Warning buttons
  showChanges: {
    text: "Show What Changes",
    command: "show-changes",
    icon: ButtonIcons.Eye,
    style: ButtonTypes.WARNING
  },
  keepOriginal: {
    text: "Keep Original",
    command: "keep-original",
    icon: ButtonIcons.Shield,
    style: ButtonTypes.WARNING
  }
};