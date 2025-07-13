// jest.config.cjs
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.jest.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
    },
  },

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|lucide-react)/)'
  ],

  moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],

  moduleNameMapper: {
    // your @/… alias
    '^@/(.*)$': '<rootDir>/src/$1',
    // if you import `src/...` anywhere
    '^src/(.*)$': '<rootDir>/src/$1',

    // other TS path aliases from your tsconfig.jest.json
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, {
      prefix: '<rootDir>/',
    }),

    // CSS & assets
    '\\.(css|sass|scss|less)$': 'identity-obj-proxy',
    '\\.(png|jpe?g|gif|svg|eot|ttf|woff2?)$': '<rootDir>/__mocks__/fileMock.js',

    // stub out lucide-react
    '^lucide-react$': '<rootDir>/__mocks__/lucide-react.js',
  },

  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.tsx'],

  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/*.spec.[jt]s?(x)',
    '<rootDir>/src/**/*.test.[jt]s?(x)',
    '<rootDir>/src/tests/stubs/**/*.test.tsx',
  ],

  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/**/stories.*',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: { branches: 10, functions: 10, lines: 15, statements: 15 }
  },

  snapshotSerializers: ['@emotion/jest/serializer'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports/junit',
      outputName: 'jest-junit.xml'
    }]
  ],

  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/.next/',
    '<rootDir>/dist/',
  ],

  verbose: true,
};
