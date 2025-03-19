module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['../test/jest-setup.ts'],
    testTimeout: 30000,
    maxWorkers: 1,
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/$1',
    },
  };