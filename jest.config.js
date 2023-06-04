/** @type {import('ts-jest').JestConfigWithTsJest} */

import { pathsToModuleNameMapper } from 'ts-jest';
import tsconfig from './tsconfig.json' assert { type: 'json' };

const preset = {
    preset: 'ts-jest',
    testEnvironmentOptions: {
        url: 'http://localhost/',
    },
    testEnvironment: 'jsdom',
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
        prefix: '<rootDir>/',
    }),
};

export default preset;
