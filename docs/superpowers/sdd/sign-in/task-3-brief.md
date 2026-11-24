# Task 3 brief — Gate the planner and bind real identity

**Plan:** `docs/superpowers/plans/2026-11-22-sign-in.md`

**Files**
- Create `src/auth/ClerkAuthRoot.jsx`
- Modify `src/App.jsx`
- Modify `src/auth/AuthEntry.jsx` and `src/styles.css` only if integration needs it

**Exact interfaces from the plan**
- `ClerkAuthRoot({ publishableKey, members, onEnterDemo, renderPlanner })` mounts Clerk only when configured and exposes signed-out, loading, mapped-user, and unmapped-user states. `members` comes from the planner's canonical member list. `renderPlanner` may be used to avoid an import cycle while passing the resolved identity into PlannerApp.
- `PlannerApp({ currentMemberId, identityMode, onExitDemo, onSignOut })` owns existing planner/sample state.
- `identityMode` is `'demo'` or `'authenticated'`; only demo mode may change `currentMemberId`.
- Authenticated `currentMemberId` comes only from provider-controlled `user.publicMetadata.memberId` and must match one of `bao`, `hang`, `diem`, `quynh`, `quoc-anh`, `thu`, `thien`.
- Preserve these behavior contracts while avoiding an import cycle between App.jsx and ClerkAuthRoot.jsx.

**Current official Clerk React API**
Use `@clerk/react` v6+ hooks and SDK, not legacy APIs. Official documentation consulted:
- React setup: `https://clerk.com/docs/react/getting-started/quickstart`
- `useSignIn` object and methods: `https://clerk.com/docs/react/reference/objects/sign-in-future`
- Forgot-password custom flow: `https://clerk.com/docs/guides/development/custom-flows/authentication/forgot-password`
- User metadata trust boundary: `https://clerk.com/docs/guides/users/extending`
- Invite-only access mode: `https://clerk.com/docs/guides/secure/restricting-access`
Use password sign-in with `signIn.password({ identifier: username, password })`; when complete, call `signIn.finalize()`. Recovery uses `signIn.create({ identifier: email })`, `signIn.resetPasswordEmailCode.sendCode()`, then `verifyCode({ code })`, `submitPassword({ password })`, and finalize on completion. Use current `useUser`/`useAuth`/`useClerk` APIs as appropriate. Do not expose raw provider errors that reveal account existence.

**Requirements**
- Wrap the app with `ClerkProvider` only when `publishableKey` is present. Do not run Clerk CLI init, create accounts, invite people, inspect existing environment files, or ask for keys as part of implementation.
- Wire the existing `AuthEntry` callbacks to Clerk username/password sign-in and the verified email reset flow. Use provider-generated verification, not a frontend-only password check.
- Missing key: show the sign-in screen with an explicit not-configured notice and working demo path; no fake auth success.
- On sign-in complete, render the existing planner Home screen. It already contains a “My tasks” section, so do not add a new task feature.
- Resolve only `user.publicMetadata.memberId`. Do not use unsafe metadata, local storage, form-chosen identity, or fallback to Bảo. Unknown/missing ID shows an account setup state and a sign-out action; do not render PlannerApp for an unmapped account.
- A demo selection must not create/use a Clerk session; leave the Clerk provider path and mount PlannerApp in demo mode. Preserve demo identity switching and show “Demo · sample data” plus an exit path.
- In authenticated mode, remove “Playing as”, calendar “Editing as”, and member “Preview as” identity selectors. Keep current member ID fixed to the account mapping while allowing group-wide profile edits.
- Add accessible sign-out for authenticated mode. It returns to the sign-in experience.
- Use the user's `Logo/Logo.svg` in the planner sidebar brand mark as well as the sign-in screen. Do not use the two reference images as artwork, and do not modify `Logo/Logo.af`.
- Do not add backend data persistence. The app's planner data is still local sample data; do not claim that this auth gate secures or syncs it server-side.
- Run `npm run build`; do focused manual checks for missing key, demo selection/exit, and accessible sign-out path. There is no configured Clerk instance, so do not claim real mapped/unmapped account sessions were exercised. Do not add or run automated tests.

**Global constraints**
- Do not add public account creation, social login, or shared persistence.
- Never put Clerk secret keys, passwords, reset codes, or credentials in client code or storage.
- Do not change the selected citrus/sky/cream tokens or font roles.

**Workspace condition**
No `.git` repository exists. Do not initialize Git or commit. Controller will snapshot `App.jsx`, the post-Task-2 styles, and `AuthEntry.jsx` immediately before dispatch, then prepare the diff package. Work only in `C:\Users\Admin\Downloads\Fish`.

**Report**
Write the full report to `docs/superpowers/sdd/sign-in/task-3-report.md`, including implementation, files, build/manual checks, self-review, and concerns. Return only status, commit line as `not applicable (workspace has no Git repository)`, one-line validation summary, concerns, and report path.
