# Task 3 implementation report

**Status** — Implementation complete and production build verified. Manual browser verification was interrupted.

**Commit** — not applicable (workspace has no Git repository)

## Implementation and files

- `src/auth/ClerkAuthRoot.jsx` mounts `ClerkProvider` when a publishable key is configured. The no-key branch opens the entry screen with member sign-in disabled, an explanation, and the demo action. With Clerk configured, the gate shows a loading state while it resolves the session and opens the entry screen when signed out.
- The authenticated gate reads `user.publicMetadata.memberId` after the Clerk user matches the active session's user ID. It resolves the value against the canonical planner member list (`bao`, `hang`, `diem`, `quynh`, `quoc-anh`, `thu`, `thien`). An absent or unrecognized value opens the account-setup screen with a Sign out button. A valid value mounts the planner with the fixed identity. A session or mapped member change remounts the planner, recreating its local sample state.
- The sign-in adapter uses `signIn.password({ identifier: username, password })` and calls `signIn.finalize()` when Clerk reports completion. Recovery creates an attempt for the submitted email, asks Clerk to send and verify a recovery code, submits the replacement password, and finalizes the completed sign-in. The recovery form displays the same conditional code instructions when delivery succeeds or Clerk returns an error, including an unknown address. Reset submission is tied to the provider attempt that issued the code. The form uses generic feedback for rejected actions. [Clerk React sign-in API](https://clerk.com/docs/react/reference/objects/sign-in-future) · [Clerk recovery guide](https://clerk.com/docs/guides/development/custom-flows/authentication/forgot-password) · [Clerk user metadata](https://clerk.com/docs/guides/users/extending)
- `src/App.jsx` renders the demo planner outside the Clerk tree when a user picks one of the seven names. The planner opens on Home with its existing My tasks section. Its sidebar, Calendar, and Members identity selectors are available only in demo mode. Authenticated voting and availability use the mapped ID. Members can still edit every profile. The session strip shows the applicable sample-data disclosure and Exit demo or Sign out. Exit demo remounts the entry screen. Sign out calls Clerk and returns to the app entry URL. [Clerk sign-out guide](https://clerk.com/docs/guides/development/custom-flows/authentication/sign-out)
- `src/auth/AuthEntry.jsx` shares the branded layout with the provider loading and account-setup states. Both the sign-in experience and the planner sidebar import `Logo/Logo.svg` directly.
- `src/styles.css` styles the SVG sidebar mark and the session strip. The strip lives outside the sidebar, which is hidden at mobile widths. Exit and sign-out have a minimum 44 by 44 CSS pixel target. A pending sign-out retains keyboard focus and blocks repeated activation, and a rejected sign-out shows an alert and allows retry. Dark mode uses existing sky and alert colors to keep the button and error readable.

## Build and manual checks

`npm run build` exited 0 with the publishable-key variable blanked for the build process. The generated output was:

```text
vite v8.3.8 building client environment for production...
✓ 516 modules transformed.
dist/index.html                   0.57 kB │ gzip:   0.34 kB
dist/assets/index-Cc_xpIJ2.css   45.82 kB │ gzip:   9.59 kB
dist/assets/index-CsfrrlHq.js   542.43 kB │ gzip: 163.77 kB
✓ built in 275ms
```

The build emitted Framer Motion `use client` bundling warnings and a Vite notice for the JavaScript chunk exceeding 500 kB after minification.

The local preview server reported it was listening, but the in-app browser timed out. The desktop browser was still connecting when the computer-use tool reported that the user stopped it with Escape. Browser verification of missing-key entry, demo selection and exit, mobile layout, and keyboard interaction remains pending. I traced those paths in the React and CSS source and verified the relevant Clerk method signatures against the installed `@clerk/react` 6.19.4 package and official documentation. No automated tests were added or run.

## Self-review and concerns

- Traced the only authenticated planner entry to the canonical `publicMetadata.memberId` lookup and checked every `MemberSelect` call site. The provider branch supplies the fixed member ID, while demo switching stays in the demo planner's state. Profile edits change display fields and never change member IDs.
- Traced the blank-key branch to disabled credential controls and the working demo callback path in the source. The checked-in auth configuration matches its pre-task snapshot. No environment files were inspected, no Clerk setup or accounts were created, and both logo source files were left untouched.
- Provider-backed sign-in, email delivery and reset, mapped and unmapped sessions, and live sign-out still need a configured Clerk instance for manual verification. The custom flow currently handles the approved password and verified-email recovery paths. Provider settings that require extra factors or session tasks need separate support before those paths can complete. [Clerk sign-in states](https://clerk.com/docs/react/reference/objects/sign-in-future#properties)
- The planner uses local, in-memory sample data in both identity modes. The sign-in gate does not add server storage, syncing, or server-side planner authorization.

## Review fixes, round 1

- A successful password check that returns `needs_client_trust` opens a device-verification screen. The adapter checks Clerk’s advertised email-code factor, sends and resends the code with `signIn.mfa.sendEmailCode()`, and verifies it with `signIn.mfa.verifyEmailCode({ code })`. The form shows separate messages for credential rejection, email delivery, code verification, and session finalization. Clerk finalization requires `status === 'complete'`. Device Trust settings were left alone. [Clerk Device Trust custom flow](https://clerk.com/docs/guides/development/custom-flows/authentication/device-trust)
- Password recovery now has distinct screens for verifying the recovery code, entering a new password, and finishing sign-in after Clerk accepts the password. If finalization fails, the password field stays closed and Continue to planner retries only session finalization. The reset confirmation can appear only after finalization resolves successfully. The recovery request still opens the same generic code screen for known and unknown email addresses. [Clerk password reset custom flow](https://clerk.com/docs/guides/development/custom-flows/authentication/forgot-password)
- Compared `src/auth/ClerkAuthRoot.jsx` and `src/auth/AuthEntry.jsx` with the round snapshot. The source review followed each screen to its callback and error branch, including code delivery and resend, invalid codes, a rejected password submission, and a failed finalization after a successful save. Browser interaction, real Clerk sessions, and automated tests were not used in this round. Live delivery and authentication still depend on the configured instance, including availability of the Device Trust email-code factor.

`npm run build` exited 0 with the publishable-key variable blanked for the build process.

```text
vite v8.3.8 building client environment for production...
✓ 516 modules transformed.
dist/index.html                   0.57 kB │ gzip:   0.34 kB
dist/assets/index-Cc_xpIJ2.css   45.82 kB │ gzip:   9.59 kB
dist/assets/index-isId24Af.js   545.13 kB │ gzip: 164.42 kB
✓ built in 276ms
```

The build emitted 68 Framer Motion module-directive warnings and Vite’s warning for a JavaScript chunk exceeding 500 kB after minification.

## Final review fixes

- Recovery keeps the email field available and shows a connection-specific retry message when the browser reports it is offline or Clerk reports a recognized network failure. Both account-dependent and unclassified responses still lead to the same conditional code screen as an accepted request. [Clerk custom-flow network errors](https://clerk.com/guides/development/offline-support#how-to-handle-network-errors)
- After successful recovery finalization, the session gate keeps a confirmation for the matching Clerk session in memory. The planner and account-setup screen each display it when applicable. A persistent status region announces the confirmation as the session view changes.
- Exiting the demo returns focus to Enter demo when the sign-in screen mounts. This works through both the direct entry path and the Clerk loading path. Money now explains that links added to the planner last until the member leaves or reloads it.
- Reviewed the final changes against `baseline/final-fix1` and traced the recovery branches, matching-session confirmation, and focus callback in source. No browser interaction, accounts, credentials, or automated tests were used.
- **Remaining owner setup check** — After configuring Clerk, compare recovery for an eligible address and an unknown address. Verify that the provider's observable responses do not reveal whether an account exists, that the app shows the same conditional response in both cases, and that only the eligible address receives a code. The local source review confirms the app's conditional response. Provider behavior remains unverified without an instance.

`npm run build` exited 0 with the publishable-key variable blanked for the build process.

```text
vite v8.3.8 building client environment for production...
✓ 517 modules transformed.
dist/index.html                   0.57 kB │ gzip:   0.34 kB
dist/assets/index-DnVp332N.css   45.98 kB │ gzip:   9.62 kB
dist/assets/index-CqkC4-k8.js   546.54 kB │ gzip: 164.89 kB
✓ built in 274ms
```

The build emitted 68 Framer Motion module-directive warnings and Vite’s warning for a JavaScript chunk exceeding 500 kB after minification.
