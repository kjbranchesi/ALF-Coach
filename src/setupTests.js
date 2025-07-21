import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Firebase
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Mock fetch for Firebase
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock Response for Firebase
globalThis.Response = class Response {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new Map(Object.entries(options.headers || {}));
  }
  
  async json() {
    return JSON.parse(this.body);
  }
  
  async text() {
    return this.body;
  }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock import.meta for Jest
jest.mock('../src/config/featureFlags.js', () => ({
  FEATURE_FLAGS: {
    CONVERSATION_RECOVERY: true,
    ENHANCED_ERROR_HANDLING: true,
    CONVERSATION_DEBUG: true,
    STATE_PERSISTENCE: true
  },
  isFeatureEnabled: (flag) => true
}));