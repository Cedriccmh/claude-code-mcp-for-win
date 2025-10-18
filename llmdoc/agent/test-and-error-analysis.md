# Test Infrastructure & Error Handling Analysis
## Claude Code MCP Project

### Code Sections

#### Test Files
- `src/__tests__/e2e.test.ts:1~130` (E2E Integration Tests): Comprehensive end-to-end tests for tool registration, basic operations, working directory handling
- `src/__tests__/error-cases.test.ts:1~391` (Error Case Tests): Detailed error handling tests covering callTool errors, process spawn errors, server initialization errors
- `src/__tests__/validation.test.ts:1~225` (Validation Tests): Input validation tests using Zod schema validation, runtime argument validation
- `src/__tests__/edge-cases.test.ts:1~150+` (Edge Case Tests): Input validation edge cases, special character handling, empty prompt rejection
- `src/__tests__/server.test.ts:1~100+` (Unit Tests): Server initialization, debugLog functionality, findClaudeCli path resolution
- `src/__tests__/version-print.test.ts:1~86` (Version Print Tests): Version printing behavior on first tool use
- `src/__tests__/setup.ts:1~13` (Global Setup): Before/after hooks for shared mock lifecycle management

#### Test Utilities
- `src/__tests__/utils/mcp-client.ts:1~129` (MCP Test Client): JSON-RPC communication client for testing MCP server interaction
- `src/__tests__/utils/persistent-mock.ts:1~29` (Persistent Mock Manager): Singleton mock management for test suite
- `src/__tests__/utils/claude-mock.ts:1~106` (Mock Claude CLI): Bash/CMD script generator for testing CLI interaction
- `src/__tests__/utils/test-helpers.ts:1~13` (Test Helpers): Mock verification and existence checking utilities

#### Test Configuration
- `vitest.config.ts:1~26` (Main Config): Global Vitest configuration with v8 coverage, mock auto-reset
- `vitest.config.unit.ts:1~26` (Unit Test Config): Focused unit test configuration with coverage
- `vitest.config.e2e.ts:1~27` (E2E Test Config): Extended timeout configuration for end-to-end tests (30s)

#### Error Handling in Main Code
- `src/server.ts:47~135` (findClaudeCli function): Custom CLI path resolution with error handling for invalid relative paths
- `src/server.ts:146~202` (spawnAsync function): Process spawning with comprehensive error event handling (ENOENT, ETIMEDOUT)
- `src/server.ts:213~238` (Constructor): Server initialization with signal handling for graceful shutdown
- `src/server.ts:304~420` (CallToolRequestSchema handler): Main tool execution with McpError throws for validation and execution failures
- `src/server.ts:359~419` (Tool execution try-catch): Error handling for CLI execution with timeout and stderr detection

#### Error Types & Constants
- `src/server.ts:6~10` (Imports): Uses McpError and ErrorCode from @modelcontextprotocol/sdk/types.js
- `src/server.ts:311~326` (McpError usage): ErrorCode.MethodNotFound, ErrorCode.InvalidParams, ErrorCode.InternalError

<!-- end list -->

---

### Report

#### Conclusions

1. **Testing Framework: Vitest 2.1.8**
   - Project uses modern Vitest framework with global test utilities enabled
   - Configuration supports both unit tests and e2e tests with separate config files
   - Coverage provider is v8 with HTML and JSON reporting
   - Auto-reset of mocks between tests (mockReset: true, clearMocks: true, restoreMocks: true)

2. **Test File Organization: 6 Main Test Files**
   - E2E tests: `e2e.test.ts` (integration testing against real mock binary)
   - Error tests: `error-cases.test.ts` (comprehensive error scenarios - 7 describe blocks)
   - Validation tests: `validation.test.ts` (Zod schema validation + runtime validation)
   - Edge case tests: `edge-cases.test.ts` (input boundaries, special characters)
   - Unit tests: `server.test.ts` (findClaudeCli, debugLog, server initialization)
   - Version tests: `version-print.test.ts` (version printing on first use)

3. **Error Handling Patterns: 3 Primary Categories**
   - **Custom CLI Path Errors**: Relative path validation with explicit Error throws in findClaudeCli (line 85)
   - **Process Spawn Errors**: ENOENT (command not found), ETIMEDOUT (timeout), generic spawn errors caught in spawnAsync (lines 178-189)
   - **MCP Protocol Errors**: McpError throws with ErrorCode enum values (MethodNotFound, InvalidParams, InternalError)

4. **Error Detection Patterns**
   - **Spawn Process Events**: Error event handler on child process (line 178), close event with exit code checking (line 191)
   - **Stderr Inspection**: Both stderr accumulation during process runtime and post-execution stderr validation (line 395-396)
   - **Timeout Detection**: Signal SIGTERM, error code ETIMEDOUT, or message matching (line 413)
   - **Validation**: Try-catch around user arguments and McpError throws for missing/invalid parameters (lines 326, 332-335)

5. **Mock Infrastructure for Testing**
   - **ClaudeMock class**: Generates executable mock scripts (bash on Unix, .cmd on Windows)
   - **Persistent singleton**: getSharedMock() ensures single mock instance across tests
   - **Platform-specific handling**: Separate bash script and Windows CMD shim generation (claude-mock.ts lines 27-89)
   - **MCPTestClient**: JSONRPC communication layer simulating MCP protocol over stdio

6. **Test Coverage Strategy**
   - Unit tests with extensive mocking of node modules (fs, os, child_process, @modelcontextprotocol/sdk)
   - E2E tests with real mock binary and actual process spawning
   - Separate test configurations: unit (default), e2e (extended timeout), coverage
   - Global setup/teardown for mock lifecycle

7. **Error Message Consistency**
   - Debug logging via debugLog() function (enabled when MCP_CLAUDE_DEBUG='true')
   - Error messages include context: paths, syscalls, stderr content
   - McpError messages include error code and detailed description
   - Timeout messages include duration: "after ${executionTimeoutMs / 1000}s"

#### Relations

**Test File Dependencies:**
- All E2E tests depend on: MCPTestClient -> persistent-mock.ts -> claude-mock.ts
- unit/e2e tests both depend on: vitest mocking of SDK modules
- setup.ts runs before all tests and manages mock lifecycle

**Error Flow in Main Code:**
1. findClaudeCli (line 47) → validates custom CLI names → throws Error or returns path
2. spawnAsync (line 146) → spawns process → catches error event → rejects Promise
3. ClaudeCodeServer.run (line 426) → calls server.connect() → catches and logs with console.error
4. callTool handler (line 304) → validates arguments → throws McpError for validation failures or execution errors

**Mock Integration Testing:**
- E2E tests use real process spawning to test actual server behavior
- Unit tests use vi.mock to isolate component logic
- Error-cases.test.ts tests both spawn errors (Process events) and tool handler errors (McpError)

**Error Type Mapping:**
- Spawn ENOENT error → McpError InternalError
- Missing prompt → McpError InvalidParams
- Unknown tool → McpError MethodNotFound
- Timeout → McpError InternalError (with timeout-specific message)
- Invalid CLI path → Standard Error (thrown in findClaudeCli)

#### Result

**Test Infrastructure Summary:**
The project has comprehensive test coverage using Vitest with 6 main test suites totaling 200+ test cases. The testing strategy combines unit tests with extensive mocking (for isolated testing) and e2e tests with real mock binaries (for integration verification). Test infrastructure includes a custom MCPTestClient implementing JSONRPC protocol and ClaudeMock providing platform-specific binary simulation.

**Error Handling Summary:**
The codebase implements structured error handling with clear separation of concerns:
1. **Validation Errors**: McpError with InvalidParams for argument validation failures
2. **Tool Not Found**: McpError with MethodNotFound for unknown tool names
3. **Execution Errors**: McpError with InternalError for CLI execution failures, timeout, or stderr output
4. **Configuration Errors**: Standard Error for invalid CLAUDE_CLI_NAME environment variable
5. **Process Errors**: Caught via child process 'error' and 'close' events with detailed context preservation

**Best Practices Identified:**
- Comprehensive error context in messages (paths, exit codes, stderr)
- Debug mode support via environment variable for troubleshooting
- Timeout configuration with clear duration reporting
- Platform-specific error handling (Windows cmd.exe, Unix bash)
- Graceful degradation for missing CLI (warning logged, falls back to PATH)
- Stderr inspection for silent failures in CLI execution

#### Attention

- **Test Mocking Complexity**: error-cases.test.ts and validation.test.ts manually setup Server mock before importing modules (lines 78, 167) due to vi.mock timing issues; some tests skipped (validation.test.ts:193-223) due to mock interaction problems
- **Timeout Configuration**: E2E tests use 30s timeout which may be insufficient for slower CI environments
- **Windows File Locking**: edge-cases.test.ts includes special Windows cleanup handling with retry logic (lines 33-43)
- **Mock Script Compatibility**: claude-mock.ts generates bash script but Windows fallback relies on Git Bash availability (line 83)
- **No Custom Error Classes**: Project doesn't extend Error class, relies entirely on McpError from SDK and standard Error
