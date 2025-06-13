## Lessons Learned

## 2025-06-11 - Command Separator Issue

### Description
Attempted to use `&&` to chain commands in the user's shell, which resulted in a "Invalid statement separator" error.

### Root Cause
The user's shell (Windows Command Prompt or PowerShell) does not support `&&` for command chaining in the same way as Unix-like shells.

### Solution
Execute commands separately instead of chaining them with `&&`.

### Lessons Learned
Always consider the user's operating system and default shell when executing commands. Avoid using shell-specific features like `&&` for chaining commands unless the shell is explicitly known to support it.
