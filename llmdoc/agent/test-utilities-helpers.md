# Test Utilities & Helpers Investigation Report

**Date:** 2025-10-19
**Scout Focus:** Test helper functions, mock implementations, shared test setup utilities

---

## Code Sections

### Dedicated Test Utility Files

- `src/__tests__/utils/test-helpers.ts:1~13` (Test Helper Functions): Mock verification and setup functions
  - `verifyMockExists()`: Checks if mock binary exists at `/tmp/claude-code-test-mock/{binaryName}`
  - `ensureMockExists()`: Ensures mock is initialized before tests run

- `src/__tests__/utils/claude-mock.ts:1~106` (ClaudeMock Class): Mock Claude CLI implementation
  - Constructor: Takes binary name, stores mock path in `/tmp/claude-code-test-mock/`
  - `setup()`: Creates executable bash script and Windows CMD shim for cross-platform support
  - `cleanup()`: Removes mock files after tests
  - `addResponse()`: Stores mock responses in Map (for future pattern-based responses)

- `src/__tests__/utils/persistent-mock.ts:1~29` (Shared Mock Manager): Singleton pattern for mock lifecycle
  - `getSharedMock()`: Returns or creates shared ClaudeMock instance
  - `cleanupSharedMock()`: Cleanup function for teardown
  - Ensures single mock instance across all test suites

- `src/__tests__/utils/mcp-client.ts:1~129` (MCPTestClient Class): MCP server test interface
  - Constructor: Takes server path and environment variables
  - `connect()`: Spawns server process with stdio pipes
  - `disconnect()`: Kills server process gracefully
  - `sendRequest()`: Sends JSON-RPC 2.0 requests with 30s timeout
  - `callTool()`: Helper for calling MCP tools
  - `listTools()`: Helper for listing available tools

- `src/__tests__/mocks.ts:1~35` (Mock Response Builders): Vitest mock utilities
  - `mockClaudeResponse()`: Creates mock stdout/stderr/exit event emitters
  - `createMCPRequest()`: Builds JSON-RPC tool call request
  - `setupTestEnvironment()`: In-memory file system mock (writeFile, readFile, exists, cleanup)

### Global Test Setup

- `src/__tests__/setup.ts:1~13` (Global Test Configuration): Vitest beforeAll/afterAll hooks
  - Imports: `getSharedMock` from persistent-mock, Vitest hooks
  - `beforeAll`: Creates shared mock for all tests
  - `afterAll`: Cleans up shared mock after all tests complete

- `vitest.config.ts:1~26` (Vitest Configuration): Framework configuration
  - Environment: `node`
  - Globals: `true` (describe, it, expect available without imports)
  - Coverage: V8 provider with text/json/html reporters
  - Mock behavior: `mockReset`, `clearMocks`, `restoreMocks` enabled
  - Exclusions: `node_modules/**`, `dist/**`

### Test File Patterns (Shared Infrastructure Usage)

- `src/__tests__/error-cases.test.ts:1~70` (Error Testing Pattern):
  - Module mocks: `node:child_process`, `node:fs`, `node:os`, MCP SDK packages
  - Mock helper: `setupServerMock()` function creates Server mock with setRequestHandler
  - Environment management: Saves/restores `process.env` in beforeEach/afterEach
  - Console spying: `vi.spyOn(console, 'error')` for assertion

- `src/__tests__/server.test.ts:1~70` (Unit Testing Pattern):
  - Mock implementations: Similar MCP SDK mocks
  - Mocked package.json: Version testing support
  - Debug spies: `consoleErrorSpy` and `consoleWarnSpy`
  - Environment cleanup: Full env snapshot and restoration

- `src/__tests__/edge-cases.test.ts:1~50` (E2E Testing Pattern):
  - Shared mock integration: Calls `getSharedMock()` in beforeEach
  - Real client usage: Creates MCPTestClient with server path
  - Temp directory: Uses `mkdtempSync` and cleanup with retries
  - Platform-specific: Windows file locking workaround (200ms delay)

- `src/__tests__/e2e.test.ts:1~80` (Integration Testing Pattern):
  - Shared lifecycle: Uses `getSharedMock()` in beforeEach, `cleanupSharedMock()` in afterAll
  - Custom environment: Passes env vars to MCPTestClient (MCP_CLAUDE_DEBUG, CLAUDE_CLI_NAME)
  - Temp directory cleanup: Recursive force removal

- `src/__tests__/validation.test.ts:1~70` (Schema Testing Pattern):
  - Module isolation: `vi.resetModules()` in beforeEach
  - Mock setup pattern: `setupServerMock()` call per test
  - Environment mocking: Sets CLAUDE_CLI_NAME via process.env
  - Console mocking: Spies on console.error

- `src/__tests__/version-print.test.ts:1~85` (Console Testing Pattern):
  - Spy management: `vi.spyOn(console, 'error')` and `.mockRestore()`
  - Spy state management: `.mockClear()` between test phases
  - Pattern matching: Searches console calls for specific strings

---

## Report

### Conclusions

1. **Unified Test Infrastructure**: A centralized mock system exists at `src/__tests__/utils/` with:
   - `ClaudeMock` class for CLI simulation
   - `MCPTestClient` for MCP server communication
   - Shared mock manager using singleton pattern
   - Helper functions for verification and setup

2. **Global Setup Pattern**: Tests use Vitest's global setup file at `src/__tests__/setup.ts` that:
   - Runs beforeAll to initialize shared mock
   - Runs afterAll to cleanup shared mock
   - Ensures mock exists before test execution

3. **Cross-Platform Support**: Test infrastructure handles both Unix and Windows:
   - Bash scripts for mock CLI on Unix
   - `.cmd` shim for Windows with Git Bash fallback
   - Platform-specific delays (200ms on Windows for file locking)

4. **Mock Categories Identified**:
   - **System mocks**: `node:child_process`, `node:fs`, `node:os` (vitest vi.mock)
   - **Module mocks**: MCP SDK packages (`@modelcontextprotocol/sdk/*`)
   - **In-memory mocks**: File system simulation in `setupTestEnvironment()`
   - **Process mocks**: Spawned process EventEmitters with data/error/exit events

5. **Environment Variable Testing**: Patterns for testing environment-dependent code:
   - `MCP_CLAUDE_DEBUG`: Debug mode toggle
   - `CLAUDE_CLI_NAME`: Custom CLI path override
   - `APPDATA`: Windows npm path (mocked conditionally)

6. **Lifecycle Management Pattern**:
   - **beforeEach**: Creates temp dir, connects client, gets shared mock
   - **afterEach**: Disconnects client, cleans temp dir
   - **afterAll**: Single cleanup call for shared resources

7. **Common Assertion Patterns**:
   - Response validation: `.toEqual()` with shape matching
   - Tool availability: `.toHaveLength()` and property checks
   - Error handling: `.rejects.toThrow()` with pattern matching
   - Console tracking: Mock spy call inspection

### Relations

#### File-to-File Dependencies

- `src/__tests__/setup.ts` → `src/__tests__/utils/persistent-mock.ts` (initialization)
- `src/__tests__/setup.ts` → `src/__tests__/utils/claude-mock.ts` (via persistent-mock)
- `src/__tests__/e2e.test.ts` → `src/__tests__/utils/mcp-client.ts` (real server testing)
- `src/__tests__/e2e.test.ts` → `src/__tests__/utils/persistent-mock.ts` (mock initialization)
- `src/__tests__/edge-cases.test.ts` → `src/__tests__/utils/mcp-client.ts` (edge case testing)
- `src/__tests__/edge-cases.test.ts` → `src/__tests__/utils/persistent-mock.ts` (mock setup)
- `src/__tests__/version-print.test.ts` → `src/__tests__/utils/mcp-client.ts` (client communication)
- `src/__tests__/error-cases.test.ts` → no direct utils imports (unit test with mocks only)

#### Function-to-Function Relations

- `ClaudeMock.setup()` calls:
  - `mkdirSync()` (node:fs/promises)
  - `writeFileSync()` (node:fs)
  - `chmod()` (node:fs/promises)
  - Platform-specific: `process.platform === 'win32'` check

- `MCPTestClient.connect()` calls:
  - `spawn('node', [serverPath])` (node:child_process)
  - `handleData()` for processing responses
  - Timeout management via setTimeout

- `getSharedMock()` calls:
  - `ClaudeMock.setup()` if mock doesn't exist
  - `existsSync()` check at mock path

- Test files call:
  - `getSharedMock()` in beforeEach
  - `cleanupSharedMock()` in afterAll
  - `MCPTestClient.connect()` for real tests
  - `vi.spyOn()`, `vi.mock()`, `vi.fn()` for unit tests

#### Mock Dependency Chain

```
Global Test Setup (setup.ts)
    ├── beforeAll: getSharedMock()
    │   └── ClaudeMock.setup()
    │       ├── Creates /tmp/claude-code-test-mock/claudeMocked
    │       ├── Writes bash script
    │       └── Writes .cmd shim (Windows)
    └── afterAll: cleanupSharedMock()
        └── rm /tmp/claude-code-test-mock/claudeMocked

Test Suite Execution
    ├── E2E Tests (edge-cases.test.ts, e2e.test.ts)
    │   ├── beforeEach: getSharedMock() + MCPTestClient.connect()
    │   └── afterEach: MCPTestClient.disconnect() + cleanup temp dir
    │
    ├── Unit Tests (error-cases.test.ts, validation.test.ts, server.test.ts)
    │   ├── beforeEach: vi.clearAllMocks() + setupServerMock()
    │   └── afterEach: restore console spies
    │
    └── Integration Tests (version-print.test.ts)
        ├── beforeEach: getSharedMock() + MCPTestClient.connect()
        └── afterEach: MCPTestClient.disconnect() + spy restore
```

### Result

**Answer to Research Questions:**

1. **Dedicated test utility files**: YES - Located in `src/__tests__/utils/`:
   - `test-helpers.ts` (verification/setup)
   - `claude-mock.ts` (CLI mock)
   - `persistent-mock.ts` (singleton manager)
   - `mcp-client.ts` (MCP communication)

2. **Types of test helpers**:
   - Factory: `ClaudeMock` class with `setup()` method
   - Mock builders: `mockClaudeResponse()`, `createMCPRequest()`
   - Environment setup: `setupTestEnvironment()`
   - Verification: `verifyMockExists()`, `ensureMockExists()`
   - Lifecycle managers: `getSharedMock()`, `cleanupSharedMock()`

3. **Mock implementations**: Located in:
   - Dedicated files: `claude-mock.ts` (CLI mock), `mcp-client.ts` (server mock)
   - Inline vitest: `vi.mock()` in test files for system modules
   - In-memory: `setupTestEnvironment()` for file system

4. **Global test setup file**: YES - `src/__tests__/setup.ts`
   - Initializes shared mock in beforeAll
   - Cleans up in afterAll
   - Configured via vitest.config.ts setupFiles option

5. **Custom test fixtures/builders**:
   - `MCPTestClient` for MCP server interaction
   - `ClaudeMock` for CLI simulation
   - Mock response builders in `mocks.ts`

6. **Environment configuration utilities**:
   - Environment variable management: `MCP_CLAUDE_DEBUG`, `CLAUDE_CLI_NAME`, `APPDATA`
   - Mock path configuration: `/tmp/claude-code-test-mock`
   - Temp directory creation: `mkdtempSync()` pattern

7. **Reusable test patterns**:
   - CLI mocking: `ClaudeMock` with bash/cmd shim support
   - Process mocking: EventEmitter-based stdout/stderr/exit
   - MCP server testing: `MCPTestClient` with JSON-RPC communication
   - Error simulation: Controlled error injection in mock
   - Environment isolation: Process.env snapshot/restore

### Attention

- **Mock Lifecycle Risk**: Shared mock in `/tmp` may persist between test runs if cleanup fails - file locking on Windows (200ms delay implemented)
- **Module Mocking Conflicts**: `vi.mock()` at module scope can interfere with tests - some tests skip due to "McpError interaction" issues (see validation.test.ts line 193)
- **Test Isolation**: E2E tests require mock to exist but unit tests mock it away - needs careful ordering
- **Platform Dependencies**: Windows-specific CLI path handling adds complexity; test assumes Git Bash availability
- **Hardcoded Paths**: Mock path `/tmp/claude-code-test-mock` assumes Unix/WSL availability on Windows
