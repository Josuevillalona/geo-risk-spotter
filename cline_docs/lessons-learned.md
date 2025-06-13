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

## 2025-06-12 - Handling Large GeoJSON File

### Description
Encountered significant issues with pushing and serving a large (1.3 GB) GeoJSON file (`shapes.geojson`) from the `public` directory on Vercel and even when attempting to fetch from the GitHub LFS media URL.

### Root Cause
GitHub's file size limit prevented direct pushing. While Git LFS was configured, serving the large file via Vercel from either the `public` directory or the GitHub LFS media URL resulted in errors (404 or JSON parsing errors due to incomplete data).

### Solution
Utilize a pre-processed and minified GeoJSON file (`ny_new_york_zip_codes_geo.min.json`) which is significantly smaller and can be reliably served from the `public` directory on Vercel.

### Lessons Learned
For web applications, especially when deploying to platforms with potential limitations on serving large static files, it is highly recommended to use optimized and minified data files. Relying on standard static file serving for smaller assets is generally more reliable than complex solutions for very large files unless specifically supported by the hosting platform. Git LFS is useful for version control of large files but doesn't guarantee seamless serving by all platforms.
