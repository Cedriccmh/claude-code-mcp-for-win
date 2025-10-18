# Claude CLI Context Collection System

**Version:** 1.0  
**Purpose:** Standardized, agent-friendly system for efficient codebase context collection using Claude CLI

---

## 🎯 Overview

This system provides a standardized approach for AI agents to collect codebase context efficiently using Claude CLI with the `/tr:withScout` directive. It eliminates redundant explanations and provides consistent, high-quality results.

### Key Benefits
- **Efficient**: Parallel scout agents collect context simultaneously
- **Standardized**: Consistent file structure and naming conventions
- **Self-documenting**: Tasks and results are organized and traceable
- **Agent-friendly**: Clear patterns that AI assistants can follow automatically
- **Context-optimized**: Generates precise reports with line numbers

---

## 📁 Directory Structure

```
project-root/
├── .claude-tasks/              # Claude CLI task system
│   ├── tasks/                  # Task definitions (input)
│   │   ├── pending/            # Tasks ready to execute
│   │   ├── templates/          # Reusable task templates
│   │   └── completed/          # Executed tasks (archived)
│   ├── reports/                # Generated reports (output)
│   │   ├── latest/             # Most recent reports
│   │   └── archive/            # Historical reports
│   └── config/                 # System configuration
│       └── directives.md       # Available directives reference
└── llmdoc/                     # Project documentation
    └── agent/                  # Scout-generated detailed reports
```

---

## 🚀 Quick Start for Agents

### Step 1: Choose or Create a Task

**Option A: Use a template**
```bash
# Copy a template and customize it
cp .claude-tasks/tasks/templates/search-analysis.md .claude-tasks/tasks/pending/my-task.md
# Edit the file with your specific requirements
```

**Option B: Create from scratch**
```markdown
/tr:withScout

# Task Title

[Describe what you want Claude to search/analyze]

## Deliverables:
- Create report in `.claude-tasks/reports/latest/[task-name]-report.md`
```

### Step 2: Execute the Task

```bash
claude --dangerously-skip-permissions "prompt path .claude-tasks/tasks/pending/my-task.md"
```

### Step 3: Review Results

- Main report: `.claude-tasks/reports/latest/[task-name]-report.md`
- Scout details: `llmdoc/agent/[scout-reports].md`

---

## 📝 Task Templates

### Available Templates

#### 1. **search-analysis.md** - Comprehensive codebase search
**Use when:** Need to find patterns, implementations, or analyze code structure  
**Output:** Detailed report with file paths and line numbers

#### 2. **documentation-audit.md** - Documentation review
**Use when:** Need to assess documentation quality or find gaps  
**Output:** Documentation map with recommendations

#### 3. **dependency-analysis.md** - Dependency and import analysis
**Use when:** Understanding module relationships or finding unused dependencies  
**Output:** Dependency graph and analysis

#### 4. **refactoring-research.md** - Pre-refactoring investigation
**Use when:** Planning a refactoring or understanding impact  
**Output:** Change impact analysis and recommendations

#### 5. **bug-investigation.md** - Bug pattern search
**Use when:** Looking for bug causes or similar issues  
**Output:** Bug pattern report with potential fixes

#### 6. **security-audit.md** - Security pattern review
**Use when:** Looking for security issues or vulnerabilities  
**Output:** Security findings with severity levels

---

## 🎨 Task Template Format

Every task should follow this structure:

```markdown
/tr:withScout

# [Task Title]

[Brief description of what needs to be done]

## Context:
[Provide relevant background information]

## Search/Analysis Tasks:
1. **[Task Name]** - [Description]
2. **[Task Name]** - [Description]
3. ...

## Deliverables:
Create a report at `.claude-tasks/reports/latest/[task-name]-report.md` including:
- [Specific requirement 1]
- [Specific requirement 2]
- File paths with line numbers for all findings
- Actionable recommendations

## Constraints:
- [Any specific constraints or requirements]
```

---

## ⚙️ Directives Reference

### `/tr:withScout` (Primary Directive)

**Purpose:** Enables parallel scout-based research for complex tasks

**When to use:**
- Codebase searches across multiple areas
- Complex analysis requiring parallel investigation
- Tasks with 3+ distinct research areas

**Behavior:**
1. Automatically breaks down task into research areas
2. Deploys 2-3 parallel scout agents
3. Each scout investigates independently
4. Results are synthesized into comprehensive report
5. Scout details saved to `llmdoc/agent/`

**Example:**
```markdown
/tr:withScout

# Find all authentication-related code

Search for:
1. Authentication middleware
2. Token validation logic
3. Session management
4. Password hashing implementations
```

---

## 📊 Naming Conventions

### Task Files
- Format: `[category]-[description].md`
- Examples:
  - `search-authentication-patterns.md`
  - `analyze-error-handling.md`
  - `audit-test-coverage.md`

### Report Files
- Format: `[task-name]-report.md`
- Timestamp included in content
- Examples:
  - `authentication-patterns-report.md`
  - `error-handling-report.md`

### Scout Reports (auto-generated)
- Format: `[scout-topic]-analysis.md`
- Saved to `llmdoc/agent/`
- Examples:
  - `auth-middleware-analysis.md`
  - `token-validation-analysis.md`

---

## 🔄 Workflow Examples

### Example 1: Understanding a New Codebase

```bash
# 1. Create task
cat > .claude-tasks/tasks/pending/initial-exploration.md << 'EOF'
/tr:withScout

# Initial Codebase Exploration

Search and document:
1. Project structure and main entry points
2. Key architectural patterns used
3. Test framework and coverage
4. Build and deployment configuration
5. External dependencies and integrations

Deliverables:
Create `.claude-tasks/reports/latest/initial-exploration-report.md`
EOF

# 2. Execute
claude --dangerously-skip-permissions "prompt path .claude-tasks/tasks/pending/initial-exploration.md"

# 3. Review
cat .claude-tasks/reports/latest/initial-exploration-report.md
```

### Example 2: Pre-Refactoring Research

```bash
# 1. Use template and customize
cp .claude-tasks/tasks/templates/refactoring-research.md \
   .claude-tasks/tasks/pending/refactor-auth-module.md

# Edit to specify auth module details

# 2. Execute
claude --dangerously-skip-permissions "prompt path .claude-tasks/tasks/pending/refactor-auth-module.md"

# 3. Review results
ls -l .claude-tasks/reports/latest/
ls -l llmdoc/agent/
```

### Example 3: Bug Investigation

```bash
# 1. Create specific bug search task
cat > .claude-tasks/tasks/pending/investigate-memory-leak.md << 'EOF'
/tr:withScout

# Memory Leak Investigation

Search for:
1. Event listener registrations without cleanup
2. Interval/timeout usage without clearing
3. Closure patterns holding references
4. Large object allocations
5. Cache implementations without size limits

Deliverables:
Report at `.claude-tasks/reports/latest/memory-leak-investigation-report.md`
EOF

# 2. Execute and review
claude --dangerously-skip-permissions "prompt path .claude-tasks/tasks/pending/investigate-memory-leak.md"
```

---

## 🤖 Agent Integration Patterns

### Pattern 1: Automated Context Collection

When an AI agent needs codebase context:

```python
# Pseudocode for agent integration
def collect_context(topic: str) -> str:
    # 1. Generate task file
    task_content = f"""
/tr:withScout

# {topic} Analysis

Search and analyze all {topic}-related code.

Deliverables:
- Report at `.claude-tasks/reports/latest/{topic}-report.md`
"""
    
    # 2. Write task file
    task_path = f".claude-tasks/tasks/pending/{topic}.md"
    write_file(task_path, task_content)
    
    # 3. Execute
    run_command(f'claude --dangerously-skip-permissions "prompt path {task_path}"')
    
    # 4. Read report
    report_path = f".claude-tasks/reports/latest/{topic}-report.md"
    return read_file(report_path)
```

### Pattern 2: Progressive Context Building

For large codebases, build context progressively:

```bash
# Phase 1: High-level overview
claude --dangerously-skip-permissions "prompt path .claude-tasks/tasks/templates/overview.md"

# Phase 2: Deep dive into specific areas (based on Phase 1 findings)
# Create focused tasks for each area of interest

# Phase 3: Detailed investigation
# Use findings from Phase 2 to guide detailed searches
```

### Pattern 3: Continuous Context Updates

For ongoing projects:

```bash
# Daily/weekly context refresh
for template in .claude-tasks/tasks/templates/*.md; do
    name=$(basename "$template" .md)
    claude --dangerously-skip-permissions "prompt path $template" > ".claude-tasks/reports/latest/${name}-$(date +%Y%m%d).md"
done
```

---

## 📋 Best Practices

### For Task Creation

1. **Be Specific**: Clearly define what you're looking for
2. **Use Numbers**: List search tasks numerically for easy tracking
3. **Request Line Numbers**: Always ask for file paths with line numbers
4. **Define Output Path**: Specify exactly where the report should be saved
5. **Include Context**: Provide background information when relevant

### For Report Organization

1. **Use Latest Directory**: Always write fresh reports to `reports/latest/`
2. **Archive Periodically**: Move old reports to `reports/archive/` 
3. **Consistent Naming**: Follow the naming conventions
4. **Include Timestamps**: Reports should include generation date
5. **Cross-Reference**: Link related reports together

### For Agents

1. **Check Before Creating**: See if a similar task already exists
2. **Reuse Templates**: Don't reinvent common patterns
3. **Clean Up**: Archive completed tasks
4. **Read Scout Reports**: Don't ignore the detailed `llmdoc/agent/` files
5. **Iterate**: Use results to create follow-up tasks if needed

---

## 🎯 Common Use Cases

### 1. Onboarding to New Codebase
**Template:** `overview.md`  
**Focus:** Architecture, patterns, entry points

### 2. Planning a Feature
**Template:** `search-analysis.md`  
**Focus:** Related existing features, integration points

### 3. Debugging
**Template:** `bug-investigation.md`  
**Focus:** Similar patterns, error flows

### 4. Security Review
**Template:** `security-audit.md`  
**Focus:** Auth, input validation, data handling

### 5. Performance Optimization
**Custom task**  
**Focus:** Loops, recursion, large data operations

### 6. Dependency Upgrade
**Template:** `dependency-analysis.md`  
**Focus:** Usage patterns, breaking changes

### 7. Documentation
**Template:** `documentation-audit.md`  
**Focus:** Coverage, accuracy, examples

### 8. Testing Strategy
**Custom task**  
**Focus:** Test patterns, coverage gaps, fixtures

---

## 🛠️ Troubleshooting

### Issue: Report not generated

**Check:**
- Task file has correct `/tr:withScout` directive
- Output path is specified in task
- Claude CLI has write permissions
- No syntax errors in task file

### Issue: Incomplete results

**Solution:**
- Break task into smaller, focused tasks
- Be more specific in requirements
- Check scout reports in `llmdoc/agent/` for details

### Issue: Task takes too long

**Solution:**
- Reduce scope of search
- Focus on specific directories
- Use multiple smaller tasks instead of one large task

---

## 📚 Advanced Features

### Custom Directives

While `/tr:withScout` is the primary directive, you can combine with:

- File paths: `Search in src/components/ directory`
- Exclusions: `Exclude node_modules and test files`
- Priorities: `Focus on TypeScript files first`

### Batch Processing

Process multiple tasks sequentially:

```bash
for task in .claude-tasks/tasks/pending/*.md; do
    echo "Processing: $task"
    claude --dangerously-skip-permissions "prompt path $task"
    mv "$task" .claude-tasks/tasks/completed/
done
```

### Report Aggregation

Combine multiple reports for comprehensive view:

```bash
cat .claude-tasks/reports/latest/*-report.md > combined-analysis.md
```

---

## 🔐 Security Considerations

1. **--dangerously-skip-permissions**: Use only in trusted environments
2. **Task Content**: Don't include sensitive data in task files
3. **Report Access**: Be mindful of what gets committed to git
4. **Add to .gitignore** if needed:
   ```
   .claude-tasks/tasks/pending/
   .claude-tasks/reports/latest/
   ```

---

## 📖 Examples Repository

See `.claude-tasks/tasks/templates/` for ready-to-use templates for common scenarios.

---

## 🤝 Contributing Task Templates

When creating reusable templates:

1. Use clear, descriptive names
2. Include comprehensive comments
3. Specify expected outputs
4. Document any assumptions
5. Test with multiple codebases

---

**Last Updated:** 2025-10-19  
**Maintained by:** Development Team  
**Questions?** See project documentation or create an issue


