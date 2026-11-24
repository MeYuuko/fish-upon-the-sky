# Task 1 brief — Add Clerk configuration safely

**Plan:** `docs/superpowers/plans/2026-11-22-sign-in.md`

**Files**
- Modify `package.json`
- Modify `package-lock.json`
- Modify `.gitignore`
- Create `.env.example`
- Create `src/auth/auth-config.js`

**Requirements**
- Check current official Clerk React setup and install only its required client package. Current official Clerk React quickstart was verified by the controller and calls for `@clerk/react` with `ClerkProvider`.
- Add `.env.local` to `.gitignore` and add a blank `VITE_CLERK_PUBLISHABLE_KEY=` line to `.env.example`.
- Implement exports `clerkPublishableKey` and `hasClerkConfiguration` from `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY`.
- Missing key must be an explicit unconfigured state and must allow the app to compile.
- Run `npm run build`; confirm current app compiles without a key.
- Manually confirm `.env.local` is ignored and no secret key appears in tracked files. There is no Git repository here, so verify the ignore rule text and review only files created/changed by this task. Do not inspect or print any existing environment files.

**Global constraints**
- Never expose Clerk secret keys or credentials in client code, committed files, or local storage. Only the public publishable key may be exposed to Vite.
- Do not add shared group-data persistence.
- Do not add or run automated tests unless the user asks; an existing build is allowed.

**Workspace condition**
This workspace is not a Git checkout. Do not initialize Git or commit. Controller has made an immutable file snapshot and will prepare the review diff after your work. Work only in `C:\Users\Admin\Downloads\Fish`.

**Report**
Write a detailed report to `docs/superpowers/sdd/sign-in/task-1-report.md`, including implementation, files, build command/result, self-review, and concerns. Return only status, commit line as `not applicable (workspace has no Git repository)`, one-line build summary, concerns, and report path.
