# Fish Upon The Sky Sign-in — Design

**Status:** Proposed for approval  
**Scope:** Add a real, invite-only sign-in entry to the existing group-planning app, while keeping a clearly separated sample-data demo.

## Intent

Fish Upon The Sky is an internal planning space for seven group members. The user wants real access control using a custom username and password, with a verified email address for password recovery. A separate demo path should let someone choose one of the seven names and explore sample data without authenticating.

## Current state

- The app is React + Vite with CSS and Framer Motion. It has no router, auth provider, backend, or server-side data store.
- `src/App.jsx` keeps the selected member and planning data in React state. The current member selector is a demo identity switch, not authentication.
- The current page uses the established citrus/sky palette, CharSen2 display face reference, Poffly Rounded UI reference, 8px spacing grid, and reduced-motion handling.
- There are no Clerk keys, member usernames, or verified recovery emails in the workspace.

## Goals

- Make the root page a branded sign-in screen with username and password fields, an email-based password-recovery flow, and a separate “Enter demo” action.
- Support real sign-in with a managed auth service and invite-only access for Bảo, Hằng, Diễm, Quỳnh, Quốc Anh, Thư, and Thiên.
- Bind each real account to one group member so one person cannot cast votes as another. Preserve the group's existing rule that all signed-in members may edit shared group details.
- Keep the demo path explicit, labeled, and isolated from real sessions and data.
- After successful sign-in, open **My Tasks** and provide a clear sign-out action.
- Re-theme the supplied Floo sign-in reference using Fish Upon The Sky tokens. Keep the orbital composition and restrained motion where they fit; remove Floo branding, neon cyan, social sign-in, and open account creation.

## Non-goals

- This change does not add shared persistence or sync for polls, outings, profiles, calendar availability, or expense-sheet links. Those remain sample/local state until a separate data-backend feature is designed.
- This change does not create a public sign-up form, social login, an admin panel, or production accounts on the user's behalf.
- This change does not publish or deploy the app.

## Approaches considered

1. **Managed authentication (selected):** use Clerk's supported React integration, configure username + password and email recovery, and set the app to invite-only. This minimizes custom credential handling and supports the requested private group.
2. **Custom authentication backend:** build and operate credential storage, email verification, recovery, sessions, and access controls. This gives more control but is disproportionate for a seven-person group and adds security and maintenance work.
3. **Front-end-only sign-in mock:** fast to style, but anyone could choose a name and it would not provide real access control. Rejected because the user chose real authentication.

Clerk is the implementation default because its current documentation describes username/password sign-in, invite-only access, verified-email invitations, and email-based password recovery. See [sign-in options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options), [access restrictions](https://clerk.com/docs/guides/secure/restricting-access), [invitations](https://clerk.com/docs/guides/users/inviting), and [password recovery](https://clerk.com/docs/guides/development/custom-flows/authentication/legacy/forgot-password).

## Authentication and access behavior

### Real accounts

- Use Clerk as the identity provider. Use its currently supported React SDK and flow; do not copy legacy API examples without checking current guidance during implementation.
- Configure **invite-only** access. There is no public “Create account” route. The owner invites the seven members using their verified email addresses; the invite flow collects each person's custom username and password.
- Sign-in identifies a user by custom username + password. The verified email is the recovery address, not the sign-in username.
- “Forgot password?” opens a recovery screen that asks for the verified email address, sends the provider's recovery code/link, then accepts a replacement password. Use a generic confirmation message to avoid disclosing whether an address is registered.
- Each invited account must be linked to exactly one existing member ID through provider-controlled metadata or equivalent trusted configuration. Do not accept a member ID chosen by the browser as proof of identity.
- In real mode, remove the demo identity switchers. Voting and other member-specific actions use the authenticated account's fixed member ID. Shared group editing remains available to all seven accounts.
- If an account lacks a trusted member mapping, show an account-setup message and deny member-specific actions rather than falling back to Bảo or another member.

### Demo

- Keep “Enter demo” separate from the sign-in form. It opens a member picker containing the seven provided names and then loads the existing sample-data experience.
- Demo mode must not create a provider session, access production records, or be presented as secure sign-in.
- Keep a visible “Demo · sample data” indicator and a way to return to sign-in.

### Configuration and data boundary

- Inspect official Clerk React setup guidance before implementation. Add only the required client SDK dependency.
- Read the public publishable key from a Vite environment variable. Never put a Clerk secret key, password, or recovery token in client code, committed files, or local storage.
- If provider configuration is absent, keep the sign-in screen visible and make demo available. Do not silently treat demo selection as real authentication.
- Real sign-in can be integrated without the member email list or production accounts, but actual provider login cannot be exercised until the owner creates/configures a Clerk app, adds environment configuration, and invites/maps the seven accounts.
- Because this app has no backend data store, the new session only gates the current sample app UI; it does not make the planning data shared or private at the data layer. Treat existing data as sample-only.

## Visual direction

- Use the supplied `Logo/Logo.af` identity through the user's matching web export at `Logo/Logo.svg`; keep the editable `.af` source untouched.
- Treat the two attached palette and font images as design references only; do not use them as page artwork.
- Use CSS tokens already present in `src/styles.css`: citrus `#FFA62B`, sky `#86C5FF`, Amalfi `#2E5AA7`, cream `#F8E6A0`, white `#FFFFFF`, and dark text `#202A35`.
- Give the citrus token a prominent primary-action role with dark text. Use cream/white surfaces and sky/Amalfi for the orbital art, links, and focus treatment.
- Use CharSen2 for the short headline and Poffly Rounded for the form and controls when available locally. Keep the existing 1.25 typography scale and 8px spacing rhythm; do not fetch fonts.
- Preserve the rounded, soft button and input shapes. Include visible hover, pressed, disabled, loading, error, and keyboard-focus states.
- Recolor the orbit rings with the Fish palette. Keep cursor parallax subtle and disable nonessential movement under `prefers-reduced-motion`.
- Keep the page responsive and accessible. Do not add decorative gradients, unrelated imagery, social buttons, or dead Terms/Privacy links.

## Acceptance criteria

1. Signed-out visitors see branded username/password fields, “Forgot password?”, and a distinct demo entry.
2. The real sign-in flow delegates credential checks and recovery to Clerk; the client never stores passwords or secrets.
3. Only invited accounts can create real accounts; a real user resolves to one fixed group member.
4. Demo users can select any of the seven sample members without creating an authenticated session.
5. Authentication errors, reset progress, loading, focus, and reduced-motion behavior are clear and keyboard-accessible.
6. Successful authentication opens My Tasks; sign-out returns to the sign-in page.
7. Existing group data remains clearly sample/local; no shared-data persistence is claimed.

## Open setup requirements

- The project owner must create/configure the Clerk app and provide its public publishable key through local environment configuration.
- The owner must supply verified email addresses and assign each invited account to one of the seven existing member IDs. No credentials or addresses are to be invented or committed.
- The owner must decide separately when to add shared persistence for actual group use.
