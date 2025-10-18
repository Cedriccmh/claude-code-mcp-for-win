# MCP Server Implementation Analysis - claude-code-mcp

## Code Sections

### Main Server Implementation

- `C:\AgentProjects\claude-code-mcp\src\server.ts:1~447` (MCP Server Entry Point): Complete MCP server implementation with version 1.10.12
  - Shebang line for executable via Node.js (line 1)
  - Server initialization and class definition

### Core Components

- `C:\AgentProjects\claude-code-mcp\src\server.ts:19~29` (Server Configuration): Server version constant and debug mode setup
  - SERVER_VERSION = "1.10.12"
  - debugMode flag from MCP_CLAUDE_DEBUG environment variable
  - Server startup time tracking

- `C:\AgentProjects\claude-code-mcp\src\server.ts:31~36` (Debug Logging): debugLog() function for conditional console output based on debug mode

- `C:\AgentProjects\claude-code-mcp\src\server.ts:47~135` (Claude CLI Discovery): findClaudeCli() function
  - Checks CLAUDE_CLI_NAME environment variable (absolute path or simple name)
  - Fallback to ~/.claude/local/claude user installation path
  - Windows-specific npm shim detection (%APPDATA%\npm)
  - Validates against relative paths with error handling

- `C:\AgentProjects\claude-code-mcp\src\server.ts:146~202` (Process Spawning): spawnAsync() function for command execution
  - Promise-based async wrapper around Node.js spawn
  - Windows CMD.exe wrapper for .cmd/.bat executables
  - Timeout support (30 minute default)
  - stdout/stderr capture with error handling

- `C:\AgentProjects\claude-code-mcp\src\server.ts:208~238` (Server Class Constructor): ClaudeCodeServer class initialization
  - Creates MCP Server instance with name "claude_code" and version "1.0.0"
  - Registers tool handlers via setupToolHandlers()
  - Sets up error handler (onerror callback)
  - SIGINT signal handling for graceful shutdown

- `C:\AgentProjects\claude-code-mcp\src\server.ts:243~421` (Tool Handler Setup): setupToolHandlers() method
  - Implements ListToolsRequestSchema handler (lines 245~299)
  - Implements CallToolRequestSchema handler (lines 304~420)

### MCP Tool Definition

- `C:\AgentProjects\claude-code-mcp\src\server.ts:245~299` (ListToolsRequest Handler): Tool registration
  - Single tool: "claude_code"
  - Input schema with "prompt" (required) and "workFolder" (optional) parameters
  - Comprehensive description with usage examples and tips

- `C:\AgentProjects\claude-code-mcp\src\server.ts:140~143` (Tool Arguments Interface): ClaudeCodeArgs interface for type safety
  - prompt: string (required, the natural language instruction)
  - workFolder?: string (optional, execution directory)

### Tool Execution Handler

- `C:\AgentProjects\claude-code-mcp\src\server.ts:304~420` (CallToolRequestSchema Handler): Tool invocation logic
  - Request parameter validation (toolName, arguments)
  - Working directory determination (default to homedir())
  - Working directory existence verification
  - Prompt validation (non-empty check)
  - Version info printing on first tool use (lines 363~367)
  - Large prompt handling on Windows (temp file write for prompts >2000 chars)
  - Claude CLI invocation with args: ['--dangerously-skip-permissions', '-p', prompt]
  - Error handling with specific messages for timeouts and CLI errors
  - 30-minute execution timeout (1800000ms)

- `C:\AgentProjects\claude-code-mcp\src\server.ts:426~431` (Server Startup): run() method
  - Creates StdioServerTransport for stdio-based communication
  - Connects server to transport
  - Logs startup message to stderr

### Server Lifecycle

- `C:\AgentProjects\claude-code-mcp\src\server.ts:435~447` (Module Execution): Direct run detection and startup
  - Checks if module is executed directly (not imported)
  - Creates ClaudeCodeServer instance
  - Starts server with error handling

## Report

### Conclusions

1. **Single Tool Architecture**: The MCP server exposes exactly one tool named "claude_code" that provides a unified interface for Claude Code operations including file editing, Git operations, terminal commands, code generation, and web search.

2. **CLI Wrapper Pattern**: The server acts as a wrapper around the Claude CLI, invoking it with `--dangerously-skip-permissions` flag to bypass permission dialogs, making it suitable for LLM-driven automation.

3. **MCP Protocol Implementation**: Uses @modelcontextprotocol/sdk v1.11.2 with standard request/response handlers (ListToolsRequestSchema and CallToolRequestSchema) over stdio transport.

4. **Environment-Based Configuration**: Supports CLAUDE_CLI_NAME (custom CLI path) and MCP_CLAUDE_DEBUG (debug logging) environment variables, enabling flexible deployment scenarios.

5. **Platform-Specific Path Resolution**: Implements sophisticated Claude CLI discovery:
   - Checks CLAUDE_CLI_NAME environment variable first
   - Falls back to ~/.claude/local/claude user installation
   - On Windows, checks %APPDATA%\npm for npm-installed shims
   - Finally relies on system PATH

6. **Windows Compatibility**: Special handling for Windows paths including POSIX-to-Windows conversion, .cmd shim detection, and cmd.exe wrapper for batch/cmd files.

7. **Input Validation**: Validates tool arguments with error codes (InvalidParams for missing/empty prompt, MethodNotFound for unknown tools).

8. **Timeout Management**: 30-minute execution timeout with specific error handling for ETIMEDOUT and SIGTERM signals.

9. **First-Use Version Tracking**: Prints tool version and startup time on first tool use for debugging and audit purposes.

10. **Error Handling Strategy**: Wraps all errors in McpError with appropriate ErrorCode values (InternalError, MethodNotFound), providing detailed stderr context.

### Relations

#### File Dependencies
- `src/server.ts` → @modelcontextprotocol/sdk (main dependency)
  - Imports from /sdk/server/index.js (Server class)
  - Imports from /sdk/server/stdio.js (StdioServerTransport)
  - Imports from /sdk/types.js (schemas, error codes)
- `src/server.ts` → Node.js built-ins (child_process, fs, os, path)

#### Function Call Chain
1. Module Load → findClaudeCli() → Determine CLI path
2. Constructor → new Server() → setupToolHandlers()
3. setupToolHandlers() → setRequestHandler(ListToolsRequestSchema, handler1)
4. setupToolHandlers() → setRequestHandler(CallToolRequestSchema, handler2)
5. Handler1 (ListTools) → Returns tool definitions
6. Handler2 (CallTools) → Calls spawnAsync(claudeCliPath, args, options)
7. spawnAsync() → spawn() → Event handling → Promise resolution

#### Tool Parameter Flow
- CallToolRequestSchema → args.params.name (tool name)
- args.params.arguments → { prompt, workFolder? }
- prompt → Validated for non-empty
- workFolder → Resolved and existence checked
- Final args to Claude CLI: ['--dangerously-skip-permissions', '-p', prompt]

#### Error Code Mapping
- Invalid tool name → ErrorCode.MethodNotFound
- Missing/empty prompt → ErrorCode.InvalidParams
- Invalid workFolder parameter → ErrorCode.InvalidParams
- CLI execution failure → ErrorCode.InternalError
- Timeout → ErrorCode.InternalError

### Result

The claude-code-mcp project implements a clean, well-structured MCP server that:

1. **Exposes Single Tool**: One "claude_code" tool provides comprehensive code and file operations by delegating to Claude CLI
2. **Maintains Security**: Uses secure process spawning (no shell=true) with explicit argument passing
3. **Provides Flexibility**: Environment-based configuration enables custom CLI paths and debug logging
4. **Handles Errors Robustly**: Comprehensive error handling with specific error codes and messages
5. **Cross-Platform Compatibility**: Special handling for Windows paths, shims, and environment differences
6. **Production Ready**: Includes timeout management, version tracking, and debug logging capabilities

**Architecture Pattern**: Thin MCP adapter over existing Claude CLI, enabling LLM agents to use Claude Code functionality through the Model Context Protocol standard interface.

### Attention

- Large prompt handling on Windows (>2000 chars) writes to temporary file; ensure cleanup works reliably
- CLAUDE_CLI_NAME validation rejects relative paths with "./" but should verify all relative path patterns
- Debug mode uses console.error for output; consider redirecting in production if stderr has different handling
- 30-minute timeout is hardcoded; no configuration option exists for timeout customization
- Server expects Claude CLI to be already authenticated and permissions accepted before first use
- Platform detection uses process.platform === 'win32'; other platforms not explicitly handled for cmd shims
- No retry logic for failed Claude CLI invocations; single attempt only
