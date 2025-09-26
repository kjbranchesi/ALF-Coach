export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library|remark|remark-.*|micromark|micromark-.*|mdast-.*|unist-.*|bail|is-plain-obj|trough|vfile|vfile-message|unified|estree-util-.*|zwitch|longest-streak|markdown-table|escape-string-regexp|character-entities-html4|character-entities-legacy|property-information|hast-util-.*|space-separated-tokens|comma-separated-tokens|ccount|trim-lines|web-namespaces|html-void-elements|devlop)/)',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/__tests__/**/*.(js|jsx|ts|tsx)', '**/*.(test|spec).(js|jsx|ts|tsx)', '!**/tests/e2e/**'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/main.jsx',
    '!src/firebase/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
