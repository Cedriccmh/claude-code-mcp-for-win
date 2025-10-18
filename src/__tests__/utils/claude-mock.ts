import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

/**
 * Mock Claude CLI for testing
 * This creates a fake Claude CLI that can be used during testing
 */
export class ClaudeMock {
  private mockPath: string;
  private responses = new Map<string, string>();

  constructor(binaryName: string = 'claude') {
    // Always use /tmp directory for mocks in tests
    this.mockPath = join('/tmp', 'claude-code-test-mock', binaryName);
  }

  /**
   * Setup the mock Claude CLI
   */
  async setup(): Promise<void> {
    const dir = dirname(this.mockPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Create a simple bash script that echoes responses
    const mockScript = `#!/bin/bash
# Mock Claude CLI for testing

# Extract the prompt from arguments
prompt=""
verbose=false
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--prompt)
      prompt="$2"
      shift 2
      ;;
    --verbose)
      verbose=true
      shift
      ;;
    --yes|-y|--dangerously-skip-permissions)
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Support large prompt passed via file reference
if [[ "$prompt" == PROMPT_FILE:* ]]; then
  prompt_file="\${prompt#PROMPT_FILE:}"
  if [[ -f "$prompt_file" ]]; then
    prompt="$(cat "$prompt_file")"
  fi
fi

# Mock responses based on prompt
if [[ "$prompt" == *"create"* ]]; then
  echo "Created file successfully"
elif [[ "$prompt" == *"Create"* ]]; then
  echo "Created file successfully"  
elif [[ "$prompt" == *"git"* ]] && [[ "$prompt" == *"commit"* ]]; then
  echo "Committed changes successfully"
elif [[ "$prompt" == *"error"* ]]; then
  echo "Error: Mock error response" >&2
  exit 1
else
  echo "Command executed successfully"
fi
`;

    writeFileSync(this.mockPath, mockScript);
    // Make executable
    const { chmod } = await import('node:fs/promises');
    await chmod(this.mockPath, 0o755);

    // On Windows, also create a .cmd shim to allow spawn
    if (process.platform === 'win32') {
      const cmdShimPath = this.mockPath + '.cmd';
      // Windows CMD shim: try Git Bash (bash.exe) if available, else emulate responses
      const scriptName = this.mockPath.split('\\').pop() || 'claudeMocked';
      const cmdContent = `@echo off\r\nsetlocal ENABLEDELAYEDEXPANSION\r\nif exist "%ProgramFiles%\\Git\\bin\\bash.exe" (\r\n  "%ProgramFiles%\\Git\\bin\\bash.exe" "%~dp0${scriptName}" %*\r\n  exit /b %errorlevel%\r\n) else if exist "%ProgramFiles(x86)%\\Git\\bin\\bash.exe" (\r\n  "%ProgramFiles(x86)%\\Git\\bin\\bash.exe" "%~dp0${scriptName}" %*\r\n  exit /b %errorlevel%\r\n) else (\r\n  set "PROMPT_ARG="\r\n  :parse\r\n  if "%~1"=="" goto afterparse\r\n  if /I "%~1"=="-p" (\r\n    set "PROMPT_ARG=%~2"\r\n    shift & shift\r\n    goto parse\r\n  )\r\n  shift\r\n  goto parse\r\n  :afterparse\r\n  echo !PROMPT_ARG! | findstr /I /C:"error" >nul 2>&1 && ( >&2 echo Error: Mock error response & exit /b 1 )\r\n  echo Command executed successfully\r\n  exit /b 0\r\n)`;
      try {
        writeFileSync(cmdShimPath, cmdContent);
      } catch {}
    }
  }

  /**
   * Cleanup the mock Claude CLI
   */
  async cleanup(): Promise<void> {
    const { rm } = await import('node:fs/promises');
    await rm(this.mockPath, { force: true });
  }

  /**
   * Add a mock response for a specific prompt pattern
   */
  addResponse(pattern: string, response: string): void {
    this.responses.set(pattern, response);
  }
}