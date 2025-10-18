# Test Framework & Configuration Report

## Executive Summary
The claude-code-mcp project uses **Vitest 2.1.8** as its primary test framework with a comprehensive testing setup including unit tests, end-to-end tests, edge case tests, validation tests, error handling tests, and version print tests. The project implements a multi-configuration approach with separate vitest configs for unit and e2e testing.

---

## 1. Test Framework Identification

### Framework: Vitest 2.1.8
- **Package:** `vitest@^2.1.8`
- **Location in Dependencies:** `devDependencies` in package.json (line 33)
- **Version:** ^2.1.8 (allows minor/patch updates)
- **Rationale:** Lightweight, fast test framework optimized for TypeScript and ES modules

### Supporting Tools
- **Coverage Provider:** `@vitest/coverage-v8@^2.1.8` (line 30)
- **TypeScript Support:** `typescript@^5.8.3` (line 32)
- **Language Runtime:** `tsx@^4.19.4` (line 31) - for direct TypeScript execution

---

## 2. Test Configuration Files

### 2.1 Primary Configuration: vitest.config.ts
**Location:** `C:\AgentProjects\claude-code-mcp\vitest.config.ts` (lines 1-26)

**Key Settings:**
```typescript
{
  test: {
    globals: true,                    // Global test functions (describe, it, etc.)
    environment: 'node',               // Node.js environment
    exclude: [
      'node_modules/**',
      'dist/**',
    ],
    coverage: {
      provider: 'v8',                 // V8 code coverage
      reporter: ['text', 'json', 'html'],  // Multiple report formats
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
    mockReset: true,                  // Reset mocks between tests
    clearMocks: true,                 // Clear mock call history
    restoreMocks: true,               // Restore original implementations
  },
}
```

### 2.2 Unit Test Configuration: vitest.config.unit.ts
**Location:** `C:\AgentProjects\claude-code-mcp\vitest.config.unit.ts` (lines 1-26)

**Settings:** Identical to base config - inherits all settings for unit testing

### 2.3 E2E Test Configuration: vitest.config.e2e.ts
**Location:** `C:\AgentProjects\claude-code-mcp\vitest.config.e2e.ts` (lines 1-27)

**Key Differences:**
```typescript
{
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,               // 30 second timeout for e2e tests
    hookTimeout: 20000,               // 20 second hook timeout
    setupFiles: ['./src/__tests__/setup.ts'],  // Global setup file
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/__tests__/utils/**',      // Exclude test utilities
      ],
    },
    include: [
      'src/__tests__/e2e.test.ts',    // Only run e2e specific tests
      'src/__tests__/edge-cases.test.ts',
    ],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
}
```

---

## 3. Test Scripts in package.json

**Location:** `package.json` lines 11-20

| Script | Command | Purpose |
|--------|---------|---------|
| `test` | `npm run build && vitest` | Build and run all unit tests (default config) |
| `test:unit` | `vitest run --config vitest.config.unit.ts` | Run only unit tests explicitly |
| `test:e2e` | `npm run build && vitest run --config vitest.config.e2e.ts` | Build and run e2e tests |
| `test:e2e:local` | `npm run build && vitest run --config vitest.config.e2e.ts` | Identical to test:e2e |
| `test:coverage` | `npm run build && vitest --coverage --config vitest.config.unit.ts` | Generate coverage reports for unit tests |
| `test:watch` | `vitest --watch` | Watch mode for development |

**Flags Explained:**
- `run` - Single run mode (not watch)
- `--config` - Specify specific config file
- `--coverage` - Enable coverage collection
- `--watch` - Watch source files for changes

---

## 4. Coverage Configuration

### Provider: V8
- **Tool:** Chromium's V8 engine built-in coverage
- **Package:** `@vitest/coverage-v8@^2.1.8`

### Report Formats
1. **text** - Console output (human-readable)
2. **json** - Machine-readable JSON format
3. **html** - Interactive HTML dashboard (default output: `coverage/` directory)

### Coverage Exclusions
```
- node_modules/**
- dist/**
- **/*.d.ts (TypeScript type definitions)
- **/*.test.ts (Test files themselves)
- **/*.spec.ts (Spec files)
- src/__tests__/utils/** (Test utilities, only for e2e config)
```

---

## 5. Test File Structure

### Test Files Location
All tests located in: `src/__tests__/` directory

### Test Files Identified (6 total)
1. **e2e.test.ts** - End-to-end integration tests
2. **server.test.ts** - Server unit tests
3. **validation.test.ts** - Argument/input validation tests
4. **error-cases.test.ts** - Error handling scenarios
5. **edge-cases.test.ts** - Edge case handling
6. **version-print.test.ts** - Version output tests

### Test File Matching Pattern
- **Pattern:** `**/*.test.ts`
- **Framework Applies:** Vitest discovers all files matching this pattern
- **Count:** 6 main test files + compiled versions in `dist/__tests__/`

---

## 6. Global Test Setup

### Setup File: src/__tests__/setup.ts
**Location:** `src/__tests__/setup.ts` (lines 1-13)

**Contents:**
```typescript
import { beforeAll, afterAll } from 'vitest';
import { getSharedMock, cleanupSharedMock } from './utils/persistent-mock.js';

beforeAll(async () => {
  console.error('[TEST SETUP] Creating shared mock for all tests...');
  await getSharedMock();
});

afterAll(async () => {
  console.error('[TEST SETUP] Cleaning up shared mock...');
  await cleanupSharedMock();
});
```

**Purpose:**
- Initializes mock Claude CLI binary before all tests run
- Cleans up after all tests complete
- Ensures consistent mock state across e2e tests

---

## 7. Test Utilities & Infrastructure

### Test Utilities Directory
**Location:** `src/__tests__/utils/`

#### 7.1 mcp-client.ts
- **Purpose:** Mock MCP (Model Context Protocol) client for server testing
- **Class:** `MCPTestClient`
- **Features:**
  - Spawn process communication via stdin/stdout
  - JSON-RPC message handling
  - Promise-based request/response handling
  - Support for custom environment variables

#### 7.2 claude-mock.ts
- **Purpose:** Mock Claude CLI executable
- **Class:** `ClaudeMock`
- **Features:**
  - Creates temporary mock binary
  - Simulates Claude CLI behavior for testing
  - Setup and cleanup methods

#### 7.3 persistent-mock.ts
- **Purpose:** Singleton pattern for shared mock across tests
- **Functions:**
  - `getSharedMock()` - Get or create shared mock
  - `cleanupSharedMock()` - Clean up after tests
- **Benefit:** Prevents repeated mock setup/teardown overhead

#### 7.4 test-helpers.ts
- **Purpose:** Utility functions for test validation
- **Functions:**
  - `verifyMockExists()` - Check if mock binary exists
  - `ensureMockExists()` - Create mock if missing

---

## 8. Mock & Spy Strategy

### Vitest Mock Configuration
**Settings (all configs):**
```typescript
mockReset: true      // Reset all mocks after each test
clearMocks: true     // Clear call history after each test
restoreMocks: true   // Restore original after mocking
```

### Common Mocked Modules (from server.test.ts)
1. `node:child_process` - Process spawning
2. `node:fs` - File system operations
3. `node:os` - OS utilities (homedir)
4. `@modelcontextprotocol/sdk/server/stdio.js` - MCP stdio transport
5. `@modelcontextprotocol/sdk/server/index.js` - MCP Server class
6. `@modelcontextprotocol/sdk/types.js` - MCP types and errors

### Test Spy Examples
- `vi.spyOn(console, 'error')` - Monitor console output
- `vi.mocked(spawn)` - Mock child_process.spawn
- `vi.mocked(existsSync)` - Mock file existence checks

---

## 9. Test Environment Settings

### Node Environment
- **Selected:** `environment: 'node'` in all configs
- **Why:** Project runs on Node.js server, not browser
- **Implications:** No DOM, browser APIs, or jsdom setup needed

### TypeScript Support
- **Compiler:** TypeScript 5.8.3
- **Target:** ES2022
- **Module:** NodeNext (ESM)
- **Strict Mode:** Enabled
- **Implications:** Full type checking in test files

---

## 10. Timeouts & Performance

### Standard Tests
- **Default Timeout:** 5000ms (Vitest default)
- **Applied to:** Unit tests, validation, version tests

### E2E Tests Only
- **Test Timeout:** 30000ms (30 seconds)
- **Hook Timeout:** 20000ms (20 seconds)
- **Reason:** E2E requires spawning actual processes

---

## 11. Test Statistics

### Coverage Summary
- **Total Test Files:** 6
- **Total Test Cases & Describe Blocks:** ~100 lines of test structure detected
- **Framework:** 100% Vitest-based (no mixed frameworks)

### Test Organization
```
Unit Tests (vitest.config.unit.ts):
  - server.test.ts
  - validation.test.ts
  - error-cases.test.ts
  - version-print.test.ts

E2E Tests (vitest.config.e2e.ts):
  - e2e.test.ts
  - edge-cases.test.ts
```

---

## 12. Build Integration

### Pre-Test Compilation
**Commands that compile first:**
```bash
npm run build && vitest          # Main test command
npm run build && vitest run --config vitest.config.e2e.ts
npm run build && vitest --coverage --config vitest.config.unit.ts
```

**Build Command:**
```bash
tsc  # TypeScript compiler (from package.json line 12)
```

**Output:** Compiled to `dist/` directory

**Rationale:** Tests run against compiled JavaScript, not raw TypeScript

---

## 13. ESM Module Support

### Configuration
- **package.json:** `"type": "module"` (line 26)
- **tsconfig.json:** `"module": "NodeNext"` (line 4)

### Implications
- All tests use ES modules (import/export)
- CommonJS require() not supported
- `.js` extensions required in imports

### Vitest Support
- Native ESM support in Vitest 2.1.8
- No additional configuration needed

---

## 14. Plugins & Extensions

### No Custom Reporters
- Uses Vitest default reporters
- Coverage reporter via @vitest/coverage-v8

### No Test Matchers Extensions
- Uses standard Vitest matchers
- No custom jest-extended plugins

### Dependencies Used
- Zod (validation library in main code, used in tests)
- @modelcontextprotocol/sdk (MCP protocol implementation)

---

## Summary Table

| Category | Value |
|----------|-------|
| **Framework** | Vitest 2.1.8 |
| **Coverage Tool** | V8 (via @vitest/coverage-v8) |
| **Configuration Files** | 3 (base, unit, e2e) |
| **Test Scripts** | 6 npm scripts |
| **Test Files** | 6 .test.ts files |
| **Environment** | Node.js |
| **Module System** | ESM |
| **TypeScript** | 5.8.3 (strict mode) |
| **Default Timeout** | 5000ms (unit), 30000ms (e2e) |
| **Mock Strategy** | Full auto-cleanup after each test |
| **Coverage Reporters** | text, json, html |

---

## Key Findings

1. **Multi-config Approach:** Separate configs for unit vs e2e with different timeouts and includes
2. **Aggressive Mock Cleanup:** All mocks reset/cleared/restored after every test
3. **Global Setup:** Persistent mock setup/teardown via setup.ts
4. **No External Test Dependencies:** Only Vitest (no additional test runners)
5. **Build Required:** Tests run against compiled dist/, not source TypeScript
6. **E2E Process Spawning:** Real process spawning for integration tests with mock CLI
7. **Comprehensive Mocking:** Heavy use of vi.mock() for SDK and system modules
8. **No Coverage Thresholds:** Coverage configured but no fail-on-coverage rules defined

