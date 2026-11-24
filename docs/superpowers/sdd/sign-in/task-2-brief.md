# Task 2 brief — Build sign-in, recovery, and demo entry screens

**Plan:** `docs/superpowers/plans/2026-11-22-sign-in.md`

**Files**
- Create `src/auth/AuthEntry.jsx`
- Modify `src/styles.css`
- Use `Logo/Logo.svg`, the user's web export from `Logo/Logo.af`; keep the `.af` file unchanged.

**Exact interface**
`AuthEntry({ authConfigured, members, onEnterDemo, onSignIn, onStartRecovery, onCompleteRecovery })`
- `onSignIn({ username, password })`, `onStartRecovery({ email })`, and `onCompleteRecovery({ email, code, newPassword })` return promises. Surface rejected actions as visible inline errors.
- `onEnterDemo(memberId)` receives one of: `bao`, `hang`, `diem`, `quynh`, `quoc-anh`, `thu`, `thien`.
- Provider actions are injected by the future Clerk-aware parent. Do not invent or store credentials, or bypass provider checks.

**Requirements**
- Build a responsive, keyboard-accessible sign-in experience with visible Username and Password labels, password visibility toggle, “Forgot password?” link/action, and a distinct “Enter demo” path.
- If `authConfigured` is false, keep the sign-in screen visible, clearly explain that real sign-in is not configured, and keep demo available. Do not simulate success.
- Add an email recovery state, then a provider code step and replacement password state. Confirm generically so the UI does not disclose account existence. Pass email, code, and new password through the defined callbacks.
- Add a seven-name member picker and a clear way back to sign-in.
- Use the user's Logo.svg as the brand icon with readable “Fish Upon The Sky” text beside it. Use no attached palette/font reference images as artwork; Logo.svg is the only supplied artwork for this screen.
- Use the existing CSS tokens: citrus `#FFA62B`, sky `#86C5FF`, Amalfi `#2E5AA7`, cream `#F8E6A0`, white `#FFFFFF`, text `#202A35`. Give citrus prominent primary-action role with dark text.
- Preserve CharSen2/Poffly Rounded role tokens, 1.25 typography scale, 8px spacing rhythm, rounded controls/cards, visible hover/pressed/disabled/loading/error/focus states, and at least 44px controls.
- Match the orbital composition and restrained entrance motion specified in the approved design. Framer Motion is installed. Honor reduced motion; state changes must remain understandable.
- Do not render public Create account, Google/Facebook social buttons, dead Terms/Privacy links, unrelated imagery, generic gradients/glass panels, or generic SaaS visuals.
- Keep labels above inputs, associate errors with their fields, preserve narrow viewport usability without horizontal scrolling, and use existing font fallbacks (do not fetch fonts).
- Run `npm run build`; do a focused manual review of keyboard-visible focus, loading/error states, and narrow layout. Do not add or run automated tests.

**Global constraints**
- Do not change package dependencies or provider configuration; Task 1 already added the Clerk SDK and key config.
- Do not modify `src/App.jsx`; Task 3 integrates the component.
- Do not add shared data persistence or any secret/credential storage.

**Workspace condition**
The project has no `.git`; do not initialize Git or commit. The controller saved a `styles.css` baseline at `docs/superpowers/sdd/sign-in/baseline/task-2/styles.css` and will create the diff package for review. Work only in `C:\Users\Admin\Downloads\Fish`.

**Report**
Write your detailed report to `docs/superpowers/sdd/sign-in/task-2-report.md`, with implementation, files, build/manual checks, self-review, concerns. Return only status, commit line as `not applicable (workspace has no Git repository)`, one-line validation summary, concerns, and report path.
