export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.[jt]s$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  setupFilesAfterEnv: [],
  moduleNameMapper: {
    '^@material/web/.*$': '<rootDir>/test/__mocks__/material-web.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!@material/web)'
  ]
};
