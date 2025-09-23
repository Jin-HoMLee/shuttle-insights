export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/chrome-extension/test'],
  transform: {
    '^.+\\.[jt]s$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  setupFilesAfterEnv: [],
};
