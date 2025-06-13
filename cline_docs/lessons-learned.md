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

## 2025-06-12 - Serving Large Static Files on Vercel

### Description
Encountered issues with serving a large static GeoJSON file (1.3 GB, then a smaller minified version) from the `public` directory of a Vite application deployed on Vercel. This resulted in 404 errors and `SyntaxError: Unexpected end of JSON input` in the browser, indicating the file was not being served correctly or completely.

### Root Cause
Vercel appears to have limitations or specific behaviors when serving large static files directly from the `public` directory in a Vite build, potentially related to size limits, timeouts, or caching of error responses. GitHub's raw content service also served LFS pointer files instead of the actual content.

### Solution
Host the large static GeoJSON file externally on GitHub Pages and update the frontend application to fetch the file from the GitHub Pages URL. This bypasses Vercel's static file serving for this specific large file.

### Lessons Learned
For large static assets in Vite projects deployed on Vercel, consider hosting them externally on a service like GitHub Pages to ensure reliable serving and avoid potential issues with Vercel's static file handling limitations. Verify that services serving Git LFS files provide access to the actual content, not just the pointer files.
