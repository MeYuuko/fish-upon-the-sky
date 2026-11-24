# Task 2 implementation report

**Status** — Complete. Ready for the Clerk parent integration in Task 3.

**Commit** — not applicable (workspace has no Git repository)

## Implementation and files

- `src/auth/AuthEntry.jsx` exports the default `AuthEntry` component with the six props specified in the brief. Sign-in takes a username and password. Recovery requests a code using the verified email address and submits the email, code, and replacement password together. Successful recovery returns to sign-in when the parent leaves the entry screen mounted.
- The password fields have visibility toggles and browser autocomplete hints. Each local validation message is linked to its field. The first invalid field receives focus. A rejected action displays a generic, announced error associated with the form fields. In-flight actions disable repeat submissions and show a text status.
- Missing configuration disables the member form, explains its availability, and keeps the demo picker active. The picker uses the supplied members and sends the selected ID through `onEnterDemo`.
- `src/styles.css` adds scoped entry-screen styles using the existing colors, font roles, spacing, and typography scale. The orbital panel uses CSS rings and the supplied SVG. A short entrance transition and a mouse-only movement of up to four pixels per axis honor reduced motion. On narrow screens the illustration and brand share a compact header above the form.
- `Logo/Logo.svg` is imported directly for the brand and orbital illustration. Both logo source files, the app root, auth configuration, and package manifests were left untouched.

## Build and manual checks

- The final `npm run build` exited successfully with 444 modules transformed. The installed Framer Motion package produced module-directive warnings. The app root will import the new component in Task 3, so a separate temporary Vite preview compiled and rendered the new component directly.
- In the desktop preview, Tab focused Username with a visible outline. Submitting empty fields displayed errors at both labels and focused Username. Toggling password visibility changed its accessible label. A pending sign-in disabled controls and displayed “Signing in…”. Rejecting the preview action displayed an inline error and enabled retry.
- Opening recovery moved focus to its heading. The email step showed its pending state, then the generic account-independent confirmation and the code/password inputs. A resolved completion returned to sign-in with confirmation and empty credential fields.
- With configuration missing, the notice and disabled authentication controls were visible. Keyboard activation of Enter demo opened all seven names. Selecting Quốc Anh supplied `quoc-anh` to the preview callback.
- At 320 CSS pixels a classic vertical scrollbar initially exposed horizontal overflow from the app-wide body minimum width. Scoping a body minimum-width override to the entry screen removed the horizontal scrollbar. The rechecked sign-in and seven-member picker both fit horizontally and their controls were reachable.
- The manual preview used in-memory callbacks. It ran locally and was stopped after review. No automated tests were added or run.

## Self-review and integration concerns

The component delegates every credential and recovery submission to the injected actions. Its browser inputs and temporary recovery-email state do not persist credentials. The demo picker sends only a member ID. No real session, email delivery, or provider reset was exercised.

Task 3 should supply the planner’s canonical seven-member list. Its recovery adapter must resolve account-specific non-delivery outcomes through the same path as accepted requests, so both reach the generic code screen. It can reject operational failures and invalid reset attempts for inline error feedback. Real-key and account-backed validation depends on the configured Clerk instance.

## Accessibility review fixes, round 1

- Updated `src/auth/AuthEntry.jsx` to move focus after React commits the field errors and the inputs’ accessible descriptions. If the first invalid field already has focus, a persistent alert region receives its message. Repeated submissions replace the announcement’s text node so identical errors can be announced again.
- Rejected sign-in and recovery actions now return focus to their submit button once the form becomes interactive. The inline error remains visible, and pressing Enter can retry the same action.
- **Manual browser check for keyboard and accessibility** — In a local Zen Browser preview, Enter on an empty Username field placed “Enter your username.” in the accessibility tree’s alert region. Pressing Enter again produced a fresh alert text node. After filling Username and pressing Enter, the visible focus outline moved to Password next to “Enter your password.” A deliberately delayed, rejected local callback showed the pending state followed by the inline error and a visible focus outline on the enabled Sign in button.
- This check covered browser accessibility semantics and keyboard behavior. Audible output from individual screen readers was not measured. The minor reset-success announcement question remains deferred to final review. No automated tests were added or run.

The production build exited successfully. Its summary was:

```text
✓ 444 modules transformed.
dist/index.html                   0.57 kB │ gzip:   0.34 kB
dist/assets/index-B7vS5yTE.css   45.61 kB │ gzip:   9.53 kB
dist/assets/index-GkLqqsSM.js   399.59 kB │ gzip: 126.18 kB
✓ built in 155ms
```

Command: npm run build — exit 0
