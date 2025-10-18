# Test System Organization Report

## Code Sections

### Test Files (Main)

- `src/__tests__/e2e.test.ts:1~189` (E2E Tests): End-to-end testing for Claude Code MCP, testing tool registration, basic operations, working directory handling, timeout handling, and debug mode.

- `src/__tests__/validation.test.ts:1~225` (Validation Tests): Tests for argument validation using Zod schemas and mock-based testing with mocked Server instance.

- `src/__tests__/server.test.ts:1~596` (Unit Tests): Comprehensive unit tests for ClaudeCodeServer class, debugLog, findClaudeCli, spawnAsync functions, and tool handlers.

- `src/__tests__/edge-cases.test.ts:1~202` (Edge Case Tests): Tests for input validation, special characters, error recovery, concurrent requests, large prompts, and path traversal.

- `src/__tests__/error-cases.test.ts:1~391` (Error Handling Tests): Tests for error scenarios including CallToolRequest errors, process spawn errors, and server initialization errors.

- `src/__tests__/version-print.test.ts:1~86` (Version Print Tests): Tests for version printing and startup time logging on first tool use.

### Test Utilities & Setup

- `src/__tests__/setup.ts:1~13` (Global Setup): Global test setup file that initializes shared mock for all tests using beforeAll/afterAll hooks.

- `src/__tests__/mocks.ts:1~35` (Mock Utilities): Helper functions for creating mock Claude responses, MCP requests, and test environments.

- `src/__tests__/utils/mcp-client.ts:1~129` (MCP Test Client): Mock MCP client class (MCPTestClient) that spawns and communicates with the test server using JSON-RPC protocol.

- `src/__tests__/utils/persistent-mock.ts:1~29` (Persistent Mock Management): Functions for managing a shared, persistent mock Claude CLI instance used across all tests.

- `src/__tests__/utils/test-helpers.ts:1~13` (Test Helper Functions): Utility functions for verifying mock existence and ensuring mock setup.

- `src/__tests__/utils/claude-mock.ts:1~106` (Claude Mock Implementation): ClaudeMock class that creates a fake Claude CLI executable with shell script and Windows CMD shim support.

### Test Configuration

- `vitest.config.ts:1~26` (Base Config): Default Vitest configuration with global test setup, node environment, coverage settings.

- `vitest.config.unit.ts:1~26` (Unit Test Config): Configuration for unit tests (same as base config).

- `vitest.config.e2e.ts:1~27` (E2E Test Config): Configuration for E2E tests with longer timeouts (30s), setup files, and specific test file inclusion.

### Package Configuration

- `package.json:11~21` (Test Scripts): NPM scripts for running different test types:
  - `test`: Full test suite with build
  - `test:unit`: Unit tests only
  - `test:e2e`: E2E tests with build
  - `test:coverage`: Coverage report generation
  - `test:watch`: Watch mode for development

---

## Report

### Conclusions

1. **Test File Organization**: All test files are co-located in a single `__tests__` directory under `src/`, following a centralized pattern rather than distributed co-location with source files.

2. **Test Type Categorization**:
   - **Unit Tests**: `validation.test.ts`, `server.test.ts`, `error-cases.test.ts` - testing individual functions and classes with mocks
   - **E2E Tests**: `e2e.test.ts`, `edge-cases.test.ts`, `version-print.test.ts` - testing full server integration with a mock CLI
   - **Special Tests**: `version-print.test.ts` focuses on specific feature behavior

3. **Test Framework**: All tests use Vitest v2.1.8 with these patterns:
   - Vitest's `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `afterAll` hooks
   - `vi.mock()` for dependency mocking
   - `vi.spyOn()` for spy creation
   - `vi.mocked()` for mock type casting

4. **Mock Infrastructure**:
   - Central mock management via `persistent-mock.ts` providing shared mock instances
   - ClaudeMock class creates fake CLI executables (bash script + Windows CMD shim)
   - MCPTestClient simulates MCP protocol communication via JSON-RPC
   - Mock responses defined in `claude-mock.ts` with bash script pattern matching

5. **Test Utilities Structure**:
   - `/utils/` subdirectory contains reusable test infrastructure
   - `mcp-client.ts`: Process spawning and JSON-RPC communication
   - `claude-mock.ts`: Mock executable creation with cross-platform support
   - `persistent-mock.ts`: Lifecycle management
   - `test-helpers.ts`: File system verification utilities

6. **Configuration Strategy**:
   - Separate Vitest configs for unit vs E2E tests
   - Unit tests use default environment (mocked dependencies)
   - E2E tests use real server spawning with longer timeouts (30s)
   - Global setup file runs before E2E tests

7. **File Naming Conventions**:
   - `.test.ts` suffix for all test files
   - No `.spec.ts` files found in project
   - Follows standard TypeScript/Vitest conventions

8. **Test Count Summary**:
   - **Total test files**: 6 files (excluding utilities)
   - **Test utilities**: 6 files in utils/ directory
   - **Configuration files**: 3 Vitest configs + 1 setup file

---

## Relations

### File Dependencies

- **E2E Test Suite** (`e2e.test.ts`, `edge-cases.test.ts`, `version-print.test.ts`):
  - ↓ imports `MCPTestClient` from `utils/mcp-client.ts`
  - ↓ imports mock management from `utils/persistent-mock.ts`
  - ↓ configured by `vitest.config.e2e.ts`
  - ↓ setup via `setup.ts`

- **Unit Test Suite** (`validation.test.ts`, `server.test.ts`, `error-cases.test.ts`):
  - ↓ imports `vi` from vitest
  - ↓ mocks `node:child_process`, `node:fs`, `node:os`
  - ↓ mocks `@modelcontextprotocol/sdk/*`
  - ↓ configured by `vitest.config.unit.ts`

- **Mock Infrastructure Chain**:
  - `persistent-mock.ts` → `claude-mock.ts` (ClaudeMock creation)
  - `mcp-client.ts` → `node:child_process` (server spawning)
  - `test-helpers.ts` → `persistent-mock.ts` (verification)

- **Server Under Test** (`../server.ts`):
  - E2E tests: spawn real compiled server at `dist/server.js`
  - Unit tests: dynamically import using `await import('../server.js')`
  - Tests mock MCP SDK and system APIs (fs, child_process, os)

### Test Interdependencies

- **Global Setup Flow**: `vitest.config.e2e.ts` → `setup.ts` → `getSharedMock()` → `claude-mock.ts`
- **E2E Test Flow**: Mock setup → `MCPTestClient` spawns server → communicates via JSON-RPC
- **Unit Test Flow**: Mock dependencies → Direct module import → Test handler functions

### Timeout Hierarchy

- Unit tests: Default timeout (5000ms)
- E2E tests: Extended timeout (30000ms with 20000ms hook timeout)
- Individual requests: 30s timeout in `MCPTestClient.sendRequest()`

---

## Result

**Task Completion Summary**: Successfully mapped the complete test system organization for the claude-code-mcp project.

### Key Findings:

1. **6 Primary Test Files** organized in single `src/__tests__/` directory
   - E2E suite: 3 files (`e2e.test.ts`, `edge-cases.test.ts`, `version-print.test.ts`)
   - Unit suite: 3 files (`validation.test.ts`, `server.test.ts`, `error-cases.test.ts`)

2. **Dedicated Test Utilities**: 6 helper files in `src/__tests__/utils/` providing:
   - MCP client simulation (`mcp-client.ts`)
   - Mock CLI creation (`claude-mock.ts`)
   - Mock lifecycle management (`persistent-mock.ts`)
   - Helper utilities (`test-helpers.ts`, `mocks.ts`)

3. **Three-Tier Configuration System**:
   - Base config: `vitest.config.ts`
   - Unit config: `vitest.config.unit.ts` (identical to base)
   - E2E config: `vitest.config.e2e.ts` (with setup files and longer timeouts)

4. **Test Organization Pattern**: Centralized `__tests__` directory model
   - Not co-located with source files
   - All tests and utilities grouped together
   - Clear separation between test types via config files

5. **Mock Strategy**: Persistent shared mock across all tests
   - Single ClaudeMock instance reused across test runs
   - Cross-platform mock implementation (bash + CMD shim)
   - JSON-RPC protocol communication simulation

---

## Attention

- Windows compatibility concerns addressed with CMD shim in mock setup, but may require Git Bash or manual testing
- E2E tests have longer timeouts (30s) suggesting potential latency issues with mock spawning
- Global mock creation in setup may cause test isolation issues if not properly cleaned up
- Some tests marked as `.skip()` on Windows platform indicating platform-specific test limitations
- Mock path hardcoded to `/tmp` directory (Unix-style) - may cause issues on Windows systems without proper translation

