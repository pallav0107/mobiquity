// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js'],
    // Specify the path to your tsconfig.json
    globals: {
      'ts-jest': {
        tsConfig: 'tsconfig.json',
      },
    },
  };

  