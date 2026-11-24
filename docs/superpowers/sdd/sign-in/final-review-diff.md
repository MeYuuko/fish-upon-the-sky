Whole feature snapshot diff: original workspace files to completed sign-in implementation. No Git repository exists.

===== .gitignore =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\.gitignore" .gitignore
index 3ff38cc..cb08a66 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\.gitignore"
+++ .gitignore
@@ -1,3 +1,4 @@
 node_modules/
 dist/
 .vite/
+.env.local

===== package.json =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\package.json" package.json
index cfd87b5..dc59251 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\package.json"
+++ package.json
@@ -9,6 +9,7 @@
     "preview": "vite preview"
   },
   "dependencies": {
+    "@clerk/react": "^6.19.4",
     "framer-motion": "^14.14.0",
     "react": "^19.3.1",
     "react-dom": "^19.3.1"

===== package-lock.json =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\package-lock.json" package-lock.json
index bc3b4d4..ccf05e9 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\package-lock.json"
+++ package-lock.json
@@ -8,6 +8,7 @@
       "name": "fish-upon-the-sky-prototype",
       "version": "0.1.0",
       "dependencies": {
+        "@clerk/react": "^6.19.4",
         "framer-motion": "^14.14.0",
         "react": "^19.3.1",
         "react-dom": "^19.3.1"
@@ -17,6 +18,49 @@
         "vite": "^8.3.8"
       }
     },
+    "node_modules/@clerk/react": {
+      "version": "6.19.4",
+      "resolved": "https://registry.npmjs.org/@clerk/react/-/react-6.19.4.tgz",
+      "integrity": "sha512-UEnupKc+bama7L49tu7J1SlP0XmAClDs9sfYwCohYabNeJS1aIur/AZ7TMw1ukwAZVug2spt87/22F0JYQ2n0w==",
+      "license": "MIT",
+      "dependencies": {
+        "@clerk/shared": "^4.48.3"
+      },
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "peerDependencies": {
+        "react": "^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0",
+        "react-dom": "^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0"
+      }
+    },
+    "node_modules/@clerk/shared": {
+      "version": "4.48.3",
+      "resolved": "https://registry.npmjs.org/@clerk/shared/-/shared-4.48.3.tgz",
+      "integrity": "sha512-lcwTiQkmmmcN3KjAwEfycFv0+fNyLJQJjhC4T+zr405QyypkTZmvaNkoBQW7QpRdX8UlNW63IoTrIX/vT37EhQ==",
+      "license": "MIT",
+      "dependencies": {
+        "@tanstack/query-core": "^5.101.4",
+        "dequal": "2.0.3",
+        "glob-to-regexp": "0.4.1",
+        "js-cookie": "3.0.8"
+      },
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "peerDependencies": {
+        "react": "^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0",
+        "react-dom": "^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0"
+      },
+      "peerDependenciesMeta": {
+        "react": {
+          "optional": true
+        },
+        "react-dom": {
+          "optional": true
+        }
+      }
+    },
     "node_modules/@emnapi/core": {
       "version": "2.0.0-beta.2",
       "resolved": "https://registry.npmjs.org/@emnapi/core/-/core-2.0.0-beta.2.tgz",
@@ -382,6 +426,16 @@
       "dev": true,
       "license": "MIT"
     },
+    "node_modules/@tanstack/query-core": {
+      "version": "5.108.2",
+      "resolved": "https://registry.npmjs.org/@tanstack/query-core/-/query-core-5.108.2.tgz",
+      "integrity": "sha512-0l+0xDKqn71hfJBKaAvFP/X7WYM0TbscEk6nK1pHaWQUWUEA+WJD0VlT8wF+HIJANMV9B/DouPWwDnX3w/l9BA==",
+      "license": "MIT",
+      "funding": {
+        "type": "github",
+        "url": "https://github.com/sponsors/tannerlinsley"
+      }
+    },
     "node_modules/@tybys/wasm-util": {
       "version": "0.10.5",
       "resolved": "https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.5.tgz",
@@ -423,6 +477,15 @@
         }
       }
     },
+    "node_modules/dequal": {
+      "version": "2.0.3",
+      "resolved": "https://registry.npmjs.org/dequal/-/dequal-2.0.3.tgz",
+      "integrity": "sha512-0je+qPKHEMohvfRTCEo3CrPG6cAzAYgmzKyxRiYSSDkS6eGJdyVJm7WaYA5ECaAD9wLB2T4EEeymA5aFVcYXCA==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
     "node_modules/detect-libc": {
       "version": "2.1.2",
       "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
@@ -493,6 +556,18 @@
         "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
       }
     },
+    "node_modules/glob-to-regexp": {
+      "version": "0.4.1",
+      "resolved": "https://registry.npmjs.org/glob-to-regexp/-/glob-to-regexp-0.4.1.tgz",
+      "integrity": "sha512-lkX1HJXwyMcprw/5YUZc2s7DrpAiHB21/V+E1rHUrVNokkvB6bqMzT0VfV6/86ZNabt1k14YOIaT7nDvOX3Iiw==",
+      "license": "BSD-2-Clause"
+    },
+    "node_modules/js-cookie": {
+      "version": "3.0.8",
+      "resolved": "https://registry.npmjs.org/js-cookie/-/js-cookie-3.0.8.tgz",
+      "integrity": "sha512-yeJd4aNAdYZQjaon2bpD/Gb0B/omw7HQOsynXXcOiWVCacbBcPlgn8S/d1X6blFSaHao7ozqtW7NZW19xpCtIw==",
+      "license": "MIT"
+    },
     "node_modules/lightningcss": {
       "version": "1.33.0",
       "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",

===== .env.example =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt" .env.example
index e69de29..4d8bc11 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt"
+++ .env.example
@@ -0,0 +1 @@
+VITE_CLERK_PUBLISHABLE_KEY=

===== src/auth/auth-config.js =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt" src/auth/auth-config.js
index e69de29..1982b4b 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt"
+++ src/auth/auth-config.js
@@ -0,0 +1,2 @@
+export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? ''
+export const hasClerkConfiguration = Boolean(clerkPublishableKey)

===== src/auth/AuthEntry.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt" src/auth/AuthEntry.jsx
index e69de29..7876a9b 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt"
+++ src/auth/AuthEntry.jsx
@@ -0,0 +1,323 @@
+import { useEffect, useLayoutEffect, useRef, useState } from 'react';
+import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
+import logo from '../../Logo/Logo.svg';
+
+const deviceVerification = {
+  heading: 'Verify this device',
+  intro: 'Enter the verification code from your account email.',
+  action: 'Verify code',
+  pending: 'Verifying code…',
+  error: 'The verification code could not be accepted. Check it or request another code.',
+};
+
+const finishSignIn = {
+  heading: 'Finish signing in',
+  intro: 'Continue to your group planner.',
+  action: 'Continue to planner',
+  pending: 'Finishing sign-in…',
+  error: 'Sign-in could not be completed. Try again or return to sign in.',
+};
+
+const screens = {
+  signIn: {
+    heading: 'Sign in',
+    intro: 'Welcome back to your group planner.',
+    action: 'Sign in',
+    pending: 'Signing in…',
+    error: 'Sign-in was unsuccessful. Check your username and password, then try again.',
+  },
+  verifyDevice: deviceVerification,
+  verifyRecoveryDevice: deviceVerification,
+  finishSignIn,
+  finishRecovery: { ...finishSignIn, intro: 'Continue to the planner with your updated password.' },
+  recovery: {
+    heading: 'Forgot your password?',
+    intro: 'Enter the verified email address for your account to request a recovery code.',
+    action: 'Send recovery code',
+    pending: 'Requesting code…',
+    error: 'The recovery request could not be completed. Please try again in a moment.',
+  },
+  recoveryCode: {
+    heading: 'Check your email',
+    intro: 'If that address matches an eligible account, a recovery code is on its way. Enter it below to continue.',
+    action: 'Verify recovery code',
+    pending: 'Verifying code…',
+    error: 'The recovery code could not be accepted. Check it or request another code.',
+  },
+  resetPassword: {
+    heading: 'Reset your password',
+    intro: 'Choose a new password for your account.',
+    action: 'Save new password',
+    pending: 'Saving new password…',
+    error: 'The password could not be saved. Try a different password or request another code.',
+  },
+  demo: {
+    heading: 'Choose a member',
+    intro: 'Pick a name to explore the planner with sample data.',
+  },
+};
+
+function Arrow({ back = false }) {
+  return <svg className={back ? 'auth-arrow-back' : undefined} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
+}
+
+function OrbitPanel({ reduceMotion }) {
+  const x = useMotionValue(0);
+  const y = useMotionValue(0);
+
+  function followPointer(event) {
+    if (reduceMotion || event.pointerType !== 'mouse') return;
+    const bounds = event.currentTarget.getBoundingClientRect();
+    x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 8);
+    y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
+  }
+
+  return (
+    <div className="auth-poster" onPointerMove={followPointer} onPointerLeave={() => { x.set(0); y.set(0); }}>
+      <header className="auth-brand"><img src={logo} alt="" /><span>Fish Upon The Sky</span></header>
+      <div className="auth-illustration" aria-hidden="true">
+        <motion.div className="auth-orbital-system" style={reduceMotion ? undefined : { x, y }}>
+          <span className="auth-disc" />
+          <span className="auth-orbit auth-orbit-outer" />
+          <span className="auth-orbit auth-orbit-middle" />
+          <span className="auth-orbit auth-orbit-inner" />
+          <img className="auth-orbit-logo" src={logo} alt="" />
+          <span className="auth-orbit-track" />
+        </motion.div>
+      </div>
+    </div>
+  );
+}
+
+export function AuthLayout({ children }) {
+  const reduceMotion = useReducedMotion();
+  return <main className="auth-page">
+    <div className="auth-layout">
+      <OrbitPanel reduceMotion={reduceMotion} />
+      <section className="auth-content" aria-labelledby="auth-heading">{children}</section>
+    </div>
+  </main>;
+}
+
+function Field({ name, label, type = 'text', autoComplete, error, actionError, ...inputProps }) {
+  const [visible, setVisible] = useState(false);
+  const id = 'auth-' + name;
+  const descriptions = [error && id + '-error', actionError && 'auth-action-error'].filter(Boolean).join(' ');
+  return (
+    <div className="auth-field">
+      <label htmlFor={id}>{label}</label>
+      <div className="auth-input-wrap">
+        <input {...inputProps} id={id} name={name} type={type === 'password' && visible ? 'text' : type}
+          required autoComplete={autoComplete} aria-invalid={error ? true : undefined}
+          aria-describedby={descriptions || undefined} />
+        {type === 'password' && <button type="button" className="auth-visibility" aria-label={visible ? 'Hide password' : 'Show password'}
+          onClick={() => setVisible(!visible)}>
+          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
+            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="2.7" />
+            {visible && <path d="m3 3 18 18" />}
+          </svg>
+        </button>}
+      </div>
+      {error && <span className="auth-field-error" id={id + '-error'}>{error}</span>}
+    </div>
+  );
+}
+
+export default function AuthEntry({
+  authConfigured, members, onEnterDemo, onSignIn, onSendDeviceCode, onVerifyDeviceCode,
+  onStartRecovery, onVerifyRecoveryCode, onSubmitRecoveryPassword, onFinalize,
+}) {
+  const [screen, setScreen] = useState('signIn');
+  const [pending, setPending] = useState('');
+  const [email, setEmail] = useState('');
+  const [errors, setErrors] = useState({});
+  const [actionError, setActionError] = useState('');
+  const [notice, setNotice] = useState('');
+  const [feedbackFocus, setFeedbackFocus] = useState(null);
+  const formRef = useRef(null);
+  const heading = useRef(null);
+  const lastScreen = useRef(screen);
+  const reduceMotion = useReducedMotion();
+  const copy = screens[screen];
+  const busy = Boolean(pending);
+  const verifyingDevice = screen === 'verifyDevice' || screen === 'verifyRecoveryDevice';
+  const finishingSignIn = screen === 'finishSignIn' || screen === 'finishRecovery';
+
+  useEffect(() => {
+    if (screen !== lastScreen.current) heading.current?.focus();
+    lastScreen.current = screen;
+  }, [screen]);
+
+  useLayoutEffect(() => {
+    if (feedbackFocus && !busy) formRef.current?.elements.namedItem(feedbackFocus.name)?.focus();
+  }, [feedbackFocus, busy]);
+
+  function open(next, message = '') {
+    setFeedbackFocus(null);
+    setErrors({});
+    setActionError('');
+    setNotice(message);
+    if (next === 'signIn' || next === 'demo') setEmail('');
+    setScreen(next);
+  }
+
+  function showActionError(message, focus = 'submitAction') {
+    setActionError(message);
+    setFeedbackFocus({ name: focus });
+  }
+
+  async function sendDeviceCode() {
+    setPending('Sending verification code…');
+    try {
+      await onSendDeviceCode();
+      setNotice('A verification code is on its way.');
+    } catch {
+      showActionError('The verification email could not be sent. Try again or return to sign in.', 'resendDeviceCode');
+    }
+  }
+
+  async function resendDeviceCode() {
+    if (busy) return;
+    setNotice('');
+    setActionError('');
+    setFeedbackFocus({ name: 'resendDeviceCode' });
+    await sendDeviceCode();
+    setPending('');
+  }
+
+  async function finish(next) {
+    open(next);
+    setPending(screens[next].pending);
+    try {
+      await onFinalize();
+      open('signIn', next === 'finishRecovery' ? 'Your password has been reset.' : '');
+    } catch {
+      showActionError(screens[next].error);
+    }
+  }
+
+  async function continueSignIn({ needsDeviceVerification }, fromRecovery = false) {
+    if (needsDeviceVerification) {
+      open(fromRecovery ? 'verifyRecoveryDevice' : 'verifyDevice');
+      await sendDeviceCode();
+      return;
+    }
+    await finish(fromRecovery ? 'finishRecovery' : 'finishSignIn');
+  }
+
+  async function submit(event) {
+    event.preventDefault();
+    if (!authConfigured || busy) return;
+    const form = event.currentTarget;
+    const values = Object.fromEntries(new FormData(form));
+    const invalid = {};
+    for (const input of form.querySelectorAll('input')) {
+      const name = input.name;
+      if (name !== 'password' && name !== 'newPassword') values[name] = values[name].trim();
+      if (!values[name]) invalid[name] = 'Enter your ' + input.labels[0].textContent.toLowerCase() + '.';
+      else if (input.validity.typeMismatch) invalid[name] = 'Enter a valid email address.';
+    }
+    setActionError('');
+    setNotice('');
+    setErrors(invalid);
+    const first = Object.keys(invalid)[0];
+    if (first) {
+      const alreadyFocused = form.elements.namedItem(first) === document.activeElement;
+      setFeedbackFocus(previous => ({
+        name: first,
+        announcement: alreadyFocused ? invalid[first] : '',
+        attempt: (previous?.attempt ?? 0) + 1,
+      }));
+      return;
+    }
+    setFeedbackFocus(null);
+    setPending(copy.pending);
+    try {
+      if (screen === 'signIn') {
+        const result = await onSignIn({ username: values.username, password: values.password });
+        await continueSignIn(result);
+      }
+      if (verifyingDevice) {
+        await onVerifyDeviceCode({ code: values.code });
+        await finish(screen === 'verifyRecoveryDevice' ? 'finishRecovery' : 'finishSignIn');
+      }
+      if (screen === 'recovery') {
+        await onStartRecovery({ email: values.email });
+        setEmail(values.email);
+        open('recoveryCode');
+      }
+      if (screen === 'recoveryCode') {
+        await onVerifyRecoveryCode({ code: values.code });
+        open('resetPassword');
+      }
+      if (screen === 'resetPassword') {
+        const result = await onSubmitRecoveryPassword({ newPassword: values.newPassword });
+        await continueSignIn(result, true);
+      }
+      if (finishingSignIn) await finish(screen);
+    } catch {
+      showActionError(copy.error);
+    } finally {
+      setPending('');
+    }
+  }
+
+  function clearError(event) {
+    const name = event.target.name;
+    if (feedbackFocus) setFeedbackFocus(null);
+    if (errors[name]) setErrors(previous => ({ ...previous, [name]: undefined }));
+    if (actionError) setActionError('');
+  }
+
+  return (
+    <AuthLayout>
+          <motion.div className="auth-inner" key={screen}
+            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
+            animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.22 }}>
+            {screen !== 'signIn' && <button className="auth-link auth-back" type="button" disabled={busy} onClick={() => open('signIn')}><Arrow back /> Back to sign in</button>}
+            <h1 id="auth-heading" ref={heading} tabIndex="-1">{copy.heading}</h1>
+            <p className="auth-intro">{copy.intro}</p>
+            {screen === 'demo' ? (
+              <div className="auth-members" role="group" aria-label="Demo members">
+                {members.map(member => (
+                  <button className="auth-member" key={member.id} type="button" onClick={() => onEnterDemo(member.id)}>
+                    {member.name}<Arrow />
+                  </button>
+                ))}
+              </div>
+            ) : (
+              <>
+                {!authConfigured && <p className="auth-notice">Member sign-in isn’t configured yet. You can still explore the demo.</p>}
+                {notice && <p role="status" className="auth-notice auth-success">{notice}</p>}
+                <form ref={formRef} noValidate onSubmit={submit} onChange={clearError} aria-busy={busy}>
+                  {!finishingSignIn && <fieldset className="auth-fields" disabled={busy || !authConfigured}>
+                    {screen === 'signIn' && <>
+                      <Field name="username" label="Username" autoComplete="username" autoCapitalize="none" spellCheck={false} error={errors.username} actionError={actionError} />
+                      <Field name="password" label="Password" type="password" autoComplete="current-password" error={errors.password} actionError={actionError} />
+                    </>}
+                    {screen === 'recovery' && <Field name="email" label="Email address" type="email" autoComplete="email" defaultValue={email} error={errors.email} actionError={actionError} />}
+                    {(verifyingDevice || screen === 'recoveryCode') && <Field name="code" label={verifyingDevice ? 'Verification code' : 'Recovery code'} autoComplete="one-time-code" autoCapitalize="none" spellCheck={false} error={errors.code} actionError={actionError} />}
+                    {screen === 'resetPassword' && <Field name="newPassword" label="New password" type="password" autoComplete="new-password" error={errors.newPassword} actionError={actionError} />}
+                  </fieldset>}
+                  {screen === 'signIn' && <button className="auth-link auth-forgot" type="button" disabled={busy || !authConfigured} onClick={() => open('recovery')}>Forgot password?</button>}
+                  {(screen === 'recoveryCode' || screen === 'resetPassword') && <button className="auth-link auth-forgot" type="button" disabled={busy} onClick={() => open('recovery')}>Request another code</button>}
+                  {verifyingDevice && <button className="auth-link auth-forgot" name="resendDeviceCode" type="button" disabled={busy} onClick={resendDeviceCode}>Request another code</button>}
+                  {actionError && <p className="auth-action-error" id="auth-action-error" role="alert">{actionError}</p>}
+                  <button className="auth-primary" name="submitAction" type="submit" disabled={busy || !authConfigured}>
+                    {pending || copy.action}{busy ? <span className="auth-loader" aria-hidden="true" /> : <Arrow />}
+                  </button>
+                </form>
+                <span className="sr-only" role="alert" aria-atomic="true">
+                  {feedbackFocus?.announcement && <span key={feedbackFocus.attempt}>{feedbackFocus.announcement}</span>}
+                </span>
+                <span className="sr-only" role="status">{pending}</span>
+                {screen === 'signIn' && <div className="auth-demo-entry">
+                  <span>Explore with sample data</span>
+                  <button type="button" className="auth-demo-button" disabled={busy} onClick={() => open('demo')}>Enter demo <Arrow /></button>
+                </div>}
+              </>
+            )}
+          </motion.div>
+    </AuthLayout>
+  );
+}

===== src/auth/ClerkAuthRoot.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt" src/auth/ClerkAuthRoot.jsx
index e69de29..b8e6c9f 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt"
+++ src/auth/ClerkAuthRoot.jsx
@@ -0,0 +1,138 @@
+import { Fragment, useRef, useState } from 'react';
+import { ClerkProvider, useAuth, useClerk, useSignIn, useUser } from '@clerk/react';
+import AuthEntry, { AuthLayout } from './AuthEntry.jsx';
+
+export function SessionExitButton({ onExit, demo = false }) {
+  const [busy, setBusy] = useState(false);
+  const [failed, setFailed] = useState(false);
+
+  async function exit() {
+    if (busy) return;
+    setBusy(true);
+    setFailed(false);
+    try {
+      await onExit();
+    } catch {
+      setFailed(true);
+    } finally {
+      setBusy(false);
+    }
+  }
+
+  return <div className="session-exit">
+    <button type="button" className="quiet-button" aria-disabled={busy || undefined} onClick={exit}>
+      {demo ? 'Exit demo' : busy ? 'Signing out…' : 'Sign out'}
+    </button>
+    {failed && <span role="alert">Couldn’t sign out. Please try again.</span>}
+  </div>;
+}
+
+function AuthStatus({ heading, children }) {
+  return <AuthLayout>
+    <div className="auth-inner">
+      <h1 id="auth-heading">{heading}</h1>
+      {children}
+    </div>
+  </AuthLayout>;
+}
+
+function SignInEntry({ members, onEnterDemo }) {
+  const { signIn } = useSignIn();
+  const recoveryAttempt = useRef(null);
+
+  async function finalize() {
+    if (signIn.status !== 'complete') throw new Error('Sign-in incomplete');
+    const { error } = await signIn.finalize();
+    if (error) throw error;
+  }
+
+  async function signInWithPassword({ username, password }) {
+    if (username.includes('@')) throw new Error('Username required');
+    const { error } = await signIn.password({ identifier: username, password });
+    if (error) throw error;
+    return { needsDeviceVerification: signIn.status === 'needs_client_trust' };
+  }
+
+  async function sendDeviceCode() {
+    const canSendCode = signIn.status === 'needs_client_trust'
+      && signIn.supportedSecondFactors.some(factor => factor.strategy === 'email_code');
+    if (!canSendCode) throw new Error('Device verification email unavailable');
+    const { error } = await signIn.mfa.sendEmailCode();
+    if (error) throw error;
+  }
+
+  async function verifyDeviceCode({ code }) {
+    if (signIn.status !== 'needs_client_trust') throw new Error('Device verification unavailable');
+    const { error } = await signIn.mfa.verifyEmailCode({ code });
+    if (error) throw error;
+  }
+
+  async function startRecovery({ email }) {
+    recoveryAttempt.current = null;
+    // Always show the same next step, including when delivery is unavailable for this account.
+    try {
+      const created = await signIn.create({ identifier: email });
+      if (created.error) return;
+      const sent = await signIn.resetPasswordEmailCode.sendCode();
+      if (!sent.error) recoveryAttempt.current = signIn.id;
+    } catch {
+      return;
+    }
+  }
+
+  function requireRecoveryAttempt() {
+    if (!recoveryAttempt.current || recoveryAttempt.current !== signIn.id) throw new Error('Recovery unavailable');
+  }
+
+  async function verifyRecoveryCode({ code }) {
+    requireRecoveryAttempt();
+    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
+    if (error) throw error;
+    if (signIn.status !== 'needs_new_password') throw new Error('Recovery code not verified');
+  }
+
+  async function submitRecoveryPassword({ newPassword }) {
+    requireRecoveryAttempt();
+    if (signIn.status !== 'needs_new_password') throw new Error('Password reset unavailable');
+    const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
+    if (error) throw error;
+    recoveryAttempt.current = null;
+    return { needsDeviceVerification: signIn.status === 'needs_client_trust' };
+  }
+
+  return <AuthEntry authConfigured members={members} onEnterDemo={onEnterDemo}
+    onSignIn={signInWithPassword} onSendDeviceCode={sendDeviceCode} onVerifyDeviceCode={verifyDeviceCode}
+    onStartRecovery={startRecovery} onVerifyRecoveryCode={verifyRecoveryCode}
+    onSubmitRecoveryPassword={submitRecoveryPassword} onFinalize={finalize} />;
+}
+
+function SessionGate({ members, onEnterDemo, renderPlanner }) {
+  const auth = useAuth();
+  const { isLoaded, user } = useUser();
+  const clerk = useClerk();
+  const signOut = () => clerk.signOut({ redirectUrl: window.location.pathname });
+
+  if (!auth.isLoaded || !isLoaded || (auth.isSignedIn && user?.id !== auth.userId)) {
+    return <AuthStatus heading="Opening your planner"><p role="status">Checking your sign-in…</p></AuthStatus>;
+  }
+  if (!auth.isSignedIn) return <SignInEntry members={members} onEnterDemo={onEnterDemo} />;
+
+  const memberId = user?.publicMetadata?.memberId;
+  const member = members.find(person => person.id === memberId);
+  if (!member) {
+    return <AuthStatus heading="Account setup needed">
+      <p className="auth-intro">Ask the group organizer to link your account to your member profile.</p>
+      <SessionExitButton onExit={signOut} />
+    </AuthStatus>;
+  }
+  return <Fragment key={JSON.stringify([auth.sessionId, member.id])}>
+    {renderPlanner({ currentMemberId: member.id, identityMode: 'authenticated', onSignOut: signOut })}
+  </Fragment>;
+}
+
+export default function ClerkAuthRoot({ publishableKey, members, onEnterDemo, renderPlanner }) {
+  if (!publishableKey) return <AuthEntry authConfigured={false} members={members} onEnterDemo={onEnterDemo} />;
+  return <ClerkProvider publishableKey={publishableKey}>
+    <SessionGate members={members} onEnterDemo={onEnterDemo} renderPlanner={renderPlanner} />
+  </ClerkProvider>;
+}

===== src/App.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\App.jsx" src/App.jsx
index 4e2dcd0..82bdb81 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\App.jsx"
+++ src/App.jsx
@@ -1,5 +1,8 @@
-import { useMemo, useState } from 'react';
+import { useState } from 'react';
 import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
+import ClerkAuthRoot, { SessionExitButton } from './auth/ClerkAuthRoot.jsx';
+import { clerkPublishableKey } from './auth/auth-config.js';
+import logo from '../Logo/Logo.svg';
 
 const people = [
   { id: 'bao', name: 'Bảo', color: 'blue' },
@@ -221,7 +224,7 @@ function HomeView({ polls, outings, onNewPoll, onVote, currentMemberId, goTo })
   </>;
 }
 
-function CalendarView({ onNewPoll, currentMemberId, busyDays, setBusyDays }) {
+function CalendarView({ onNewPoll, currentMemberId, onChangeDemoMember, busyDays, setBusyDays }) {
   const [monthOffset, setMonthOffset] = useState(0);
   const start = new Date(2026, 10 + monthOffset, 1);
   const year = start.getFullYear();
@@ -251,7 +254,11 @@ function CalendarView({ onNewPoll, currentMemberId, busyDays, setBusyDays }) {
         })}</div>
         <div className="calendar-legend"><span><i className="legend-busy" /> Your busy day</span><span><i className="legend-idea" /> Possible outing date</span><span>Tap a date to update yours</span></div>
       </section>
-      <aside className="availability-card"><span className="eyebrow">A quick check-in</span><h2>Mark the days you can’t make.</h2><p>We’ll keep this prototype local to your browser. Everyone can try the flow by selecting a member below.</p><label className="field-label" htmlFor="member-switch">Editing as</label><MemberSelect id="member-switch" currentMemberId={currentMemberId} /><div className="availability-tip"><Icon name="spark" /><span>The best date is the one with room for everyone.</span></div></aside>
+      <aside className="availability-card"><span className="eyebrow">A quick check-in</span><h2>Mark the days you can’t make.</h2>
+        <p>Your availability changes stay in this browser session.</p>
+        {onChangeDemoMember && <><label className="field-label" htmlFor="member-switch">Editing as</label><MemberSelect id="member-switch" currentMemberId={currentMemberId} onChange={onChangeDemoMember} /></>}
+        <div className="availability-tip"><Icon name="spark" /><span>The best date is the one with room for everyone.</span></div>
+      </aside>
     </div>
   </section>;
 }
@@ -288,17 +295,17 @@ function MoneyView({ outings, sheetUrls, onSheetChange, onSheetSave }) {
   </section>;
 }
 
-function MembersView({ members, setMembers, currentMemberId, setCurrentMemberId }) {
+function MembersView({ members, setMembers, currentMemberId, onChangeDemoMember }) {
   const updatePerson = (id, key, value) => setMembers((current) => current.map((person) => person.id === id ? { ...person, [key]: value } : person));
   return <section className="page-section">
     <div className="page-title-row"><div><span className="eyebrow">Seven good humans</span><h1>The people behind the plans.</h1><p>Nicknames are optional. Add a birthday or useful note when you want the group to remember it.</p></div><div className="member-count"><strong>07</strong><span>members<br />one group</span></div></div>
-    <div className="profile-note"><Icon name="edit" /><span>Prototype mode: everyone can try editing a profile. Changes stay in this browser only.</span><label className="profile-editor">Preview as <MemberSelect currentMemberId={currentMemberId} onChange={setCurrentMemberId} /></label></div>
+    <div className="profile-note"><Icon name="edit" /><span>You can edit any member’s profile. Changes stay in this browser session.</span>{onChangeDemoMember && <label className="profile-editor">Preview as <MemberSelect currentMemberId={currentMemberId} onChange={onChangeDemoMember} /></label>}</div>
     <div className="member-grid">{members.map((person) => <article className="member-card" key={person.id}>
       <div className="member-card-top"><Avatar person={person} /><span className="member-card-spark"><Icon name="spark" size={17} /></span></div>
       <label className="field-label" htmlFor={`nickname-${person.id}`}>Display nickname</label><input id={`nickname-${person.id}`} className="text-input" placeholder="Choose your own" value={person.nickname} onChange={(event) => updatePerson(person.id, 'nickname', event.target.value)} />
       <h3>{person.name}</h3>
       <div className="profile-fields"><label className="field-label" htmlFor={`birthday-${person.id}`}>Birthday<input id={`birthday-${person.id}`} className="text-input" type="text" placeholder="Add a date" value={person.birthday ?? ''} onChange={(event) => updatePerson(person.id, 'birthday', event.target.value)} /></label><label className="field-label" htmlFor={`contact-${person.id}`}>Contact<input id={`contact-${person.id}`} className="text-input" type="text" placeholder="Add a contact" value={person.contact ?? ''} onChange={(event) => updatePerson(person.id, 'contact', event.target.value)} /></label><label className="field-label" htmlFor={`food-${person.id}`}>Dietary notes<input id={`food-${person.id}`} className="text-input" type="text" placeholder="Allergies or preferences" value={person.foodNotes ?? ''} onChange={(event) => updatePerson(person.id, 'foodNotes', event.target.value)} /></label></div>
-      <div className="member-card-foot"><span><i /> Can edit group plans</span><span className="member-quiet">No login in prototype</span></div>
+      <div className="member-card-foot"><span><i /> Can edit group plans</span></div>
     </article>)}</div>
   </section>;
 }
@@ -325,18 +332,21 @@ function StickerSlapFooter({ onNavigate, onNewPoll, reduceMotion }) {
   </motion.footer>;
 }
 
-function App() {
+export function PlannerApp({ currentMemberId: entryMemberId, identityMode, onExitDemo, onSignOut }) {
   const reduceMotion = useReducedMotion();
   const [theme, setTheme] = useState('light');
   const [activeTab, setActiveTab] = useState('home');
   const [showPollModal, setShowPollModal] = useState(false);
-  const [currentMemberId, setCurrentMemberId] = useState('bao');
+  const isDemo = identityMode === 'demo';
+  const [demoMemberId, setDemoMemberId] = useState(entryMemberId);
+  const currentMemberId = isDemo ? demoMemberId : entryMemberId;
+  const onChangeDemoMember = isDemo ? setDemoMemberId : undefined;
   const [busyDays, setBusyDays] = useState({});
   const [members, setMembers] = useState(people.map((person) => ({ ...person, nickname: '', birthday: '', foodNotes: '' })));
   const [polls, setPolls] = useState(initialPolls);
   const [outings, setOutings] = useState(initialOutings);
   const [sheetUrls, setSheetUrls] = useState({});
-  const currentMember = useMemo(() => members.find((person) => person.id === currentMemberId) ?? members[0], [members, currentMemberId]);
+  const currentMember = members.find(person => person.id === currentMemberId);
 
   const toggleVote = (pollId, optionId, voteKey = 'votes') => setPolls((current) => current.map((poll) => {
     if (poll.id !== pollId) return poll;
@@ -361,22 +371,26 @@ function App() {
 
   return <div className={`app-shell${theme === 'dark' ? ' theme-dark' : ''}`}>
     <aside className="sidebar">
-      <button className="brand-lockup" onClick={() => setActiveTab('home')} aria-label="Fish Upon The Sky home"><span className="brand-fish">F</span><span><strong>Fish Upon<br />The Sky</strong><small>GROUP SPACE</small></span></button>
+      <button className="brand-lockup" onClick={() => setActiveTab('home')} aria-label="Fish Upon The Sky home"><img className="brand-fish" src={logo} alt="" /><span><strong>Fish Upon<br />The Sky</strong><small>GROUP SPACE</small></span></button>
       <span className="nav-caption">YOUR LITTLE CORNER</span>
       <nav className="side-nav" aria-label="Main navigation">{navItems.map((item) => <button key={item.id} className={`nav-item${activeTab === item.id ? ' is-active' : ''}`} onClick={() => setActiveTab(item.id)}><Icon name={item.icon} size={19} /><span>{item.label}</span>{item.id === 'outings' && polls.some((poll) => poll.status === 'Voting') && <i className="nav-notice" />}</button>)}</nav>
-      <div className="sidebar-bottom"><span className="nav-caption">PLAYING AS</span><label className="sr-only" htmlFor="sidebar-member">Choose a member for this prototype</label><MemberSelect id="sidebar-member" currentMemberId={currentMemberId} onChange={setCurrentMemberId} /><div className="prototype-tag"><span /> Prototype · sample data</div></div>
+      {isDemo && <div className="sidebar-bottom"><label className="nav-caption" htmlFor="sidebar-member">Playing as</label><MemberSelect id="sidebar-member" currentMemberId={currentMemberId} onChange={onChangeDemoMember} /></div>}
     </aside>
 
     <div className="app-main">
+      <div className="planner-session">
+        <span>{isDemo ? 'Demo · sample data' : 'Local sample data'}</span>
+        <SessionExitButton demo={isDemo} onExit={isDemo ? onExitDemo : onSignOut} />
+      </div>
       <header className="topbar"><div className="topbar-context"><span className="crumb">FISH UPON THE SKY <i>/</i> {activeTab.toUpperCase()}</span><h2>{titleByTab[activeTab]}</h2><p>{subtitleByTab[activeTab]}</p></div><div className="topbar-actions"><button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} /></button><div className="topbar-member" title={`Editing as ${currentMember.name}`}><Avatar person={currentMember} small /><span>{currentMember.nickname || currentMember.name}</span></div><button className="button button-primary topbar-new" onClick={() => setShowPollModal(true)}><Icon name="plus" size={18} /> New outing poll</button></div></header>
       <main className="page-content">
         <AnimatePresence mode="wait" initial={false}>
           <motion.div key={activeTab} className="page-view" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }} transition={{ duration: reduceMotion ? 0.01 : 0.22 }}>
             {activeTab === 'home' && <HomeView polls={polls} outings={outings} onNewPoll={() => setShowPollModal(true)} onVote={toggleVote} currentMemberId={currentMemberId} goTo={setActiveTab} />}
-            {activeTab === 'calendar' && <CalendarView onNewPoll={() => setShowPollModal(true)} currentMemberId={currentMemberId} busyDays={busyDays} setBusyDays={setBusyDays} />}
+            {activeTab === 'calendar' && <CalendarView onNewPoll={() => setShowPollModal(true)} currentMemberId={currentMemberId} onChangeDemoMember={onChangeDemoMember} busyDays={busyDays} setBusyDays={setBusyDays} />}
             {activeTab === 'outings' && <OutingsView polls={polls} outings={outings} onNewPoll={() => setShowPollModal(true)} currentMemberId={currentMemberId} onVote={toggleVote} goTo={setActiveTab} onStatusChange={changeOutingStatus} />}
             {activeTab === 'money' && <MoneyView outings={outings} sheetUrls={sheetUrls} onSheetChange={changeSheet} onSheetSave={saveSheet} />}
-            {activeTab === 'members' && <MembersView members={members} setMembers={setMembers} currentMemberId={currentMemberId} setCurrentMemberId={setCurrentMemberId} />}
+            {activeTab === 'members' && <MembersView members={members} setMembers={setMembers} currentMemberId={currentMemberId} onChangeDemoMember={onChangeDemoMember} />}
           </motion.div>
         </AnimatePresence>
         <StickerSlapFooter onNavigate={setActiveTab} onNewPoll={() => setShowPollModal(true)} reduceMotion={reduceMotion} />
@@ -387,4 +401,11 @@ function App() {
   </div>;
 }
 
-export default App;
+export default function App() {
+  const [demoMemberId, setDemoMemberId] = useState(null);
+  if (demoMemberId) {
+    return <PlannerApp currentMemberId={demoMemberId} identityMode="demo" onExitDemo={() => setDemoMemberId(null)} />;
+  }
+  return <ClerkAuthRoot publishableKey={clerkPublishableKey} members={people} onEnterDemo={setDemoMemberId}
+    renderPlanner={identity => <PlannerApp {...identity} />} />;
+}

===== src/styles.css =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-2\\styles.css" src/styles.css
index 082ca82..73c083c 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-2\\styles.css"
+++ src/styles.css
@@ -139,7 +139,7 @@ button:disabled { cursor: not-allowed; opacity: .5; }
 .theme-dark .welcome-stats { background: rgba(21, 39, 60, .34); }
 .sidebar { position: fixed; inset: 0 auto 0 0; z-index: 5; display: flex; width: 248px; flex-direction: column; padding: 30px 20px 22px; background: var(--color-paper); border-right: 1px solid var(--color-line); }
 .brand-lockup { display: flex; align-items: center; gap: 11px; padding: 0; border: 0; background: transparent; text-align: left; cursor: pointer; }
-.brand-fish { display: grid; width: 43px; height: 43px; place-items: center; border-radius: 50% 50% 42% 50%; background: var(--palette-citrus); color: var(--color-text); font-family: var(--font-display); font-size: 25px; transform: rotate(-8deg); }
+.brand-fish { display: block; width: 43px; height: 43px; border-radius: 50%; background: var(--color-surface); }
 .brand-lockup strong { display: block; font-family: var(--font-display); font-size: 19px; letter-spacing: .01em; line-height: .95; }
 .brand-lockup small { display: block; margin-top: 7px; color: var(--color-muted); font-size: 9px; font-weight: 800; letter-spacing: .16em; }
 .nav-caption { margin: 43px 0 11px 10px; color: var(--color-muted); font-size: 10px; font-weight: 800; letter-spacing: .13em; }
@@ -152,8 +152,13 @@ button:disabled { cursor: not-allowed; opacity: .5; }
 .sidebar-bottom { margin-top: auto; }
 .sidebar-bottom .nav-caption { display: block; margin: 0 0 9px 3px; }
 .member-select { width: 100%; }
-.prototype-tag { display: flex; align-items: center; gap: 8px; margin: 16px 4px 0; color: var(--color-muted); font-size: 12px; }
-.prototype-tag span { width: 7px; height: 7px; border-radius: 50%; background: var(--color-success-dot); }
+.planner-session { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); padding: 0 clamp(16px, 5vw, 72px); background: var(--surface-blue-wash); color: var(--color-ink-soft); font-size: var(--type-sm); }
+.session-exit { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1); }
+.session-exit .quiet-button { min-width: 44px; min-height: 44px; color: var(--color-primary); }
+.session-exit .quiet-button[aria-disabled="true"] { cursor: wait; }
+.session-exit [role="alert"] { color: var(--color-danger); }
+.theme-dark .session-exit .quiet-button { color: var(--palette-sea); }
+.theme-dark .session-exit [role="alert"] { color: var(--surface-danger); }
 .app-main { min-height: 100vh; margin-left: 248px; }
 .topbar { position: sticky; top: 0; z-index: 4; display: flex; min-height: 112px; align-items: center; justify-content: space-between; gap: 24px; padding: 20px clamp(24px, 5vw, 72px); background: color-mix(in srgb, var(--color-page) 93%, transparent); border-bottom: 1px solid rgba(46, 90, 167, .08); backdrop-filter: blur(12px); }
 .crumb { color: var(--color-muted-soft); font-size: 9px; font-weight: 800; letter-spacing: .15em; }
@@ -432,11 +437,10 @@ h1, h2, h3 { color: var(--color-text); }
 @media (max-width: 820px) {
   .sidebar { width: 70px; align-items: center; padding: 18px 9px; }
   .brand-lockup { justify-content: center; }
-  .brand-lockup > span:last-child, .nav-caption, .nav-item span, .nav-notice, .sidebar-bottom .member-select, .prototype-tag { display: none; }
+  .brand-lockup > span:last-child, .nav-caption, .nav-item span, .nav-notice, .sidebar-bottom { display: none; }
   .side-nav { width: 100%; margin-top: 43px; }
   .nav-item { justify-content: center; padding: 0; }
   .nav-item.is-active::before { left: -9px; }
-  .sidebar-bottom { display: flex; width: 100%; justify-content: center; }
   .app-main { margin-left: 70px; }
   .topbar { padding: 16px 24px; }
   .topbar-member { display: none; }
@@ -539,5 +543,188 @@ h1, h2, h3 { color: var(--color-text); }
   *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
 }
 
+body:has(.auth-page) { min-width: 0; }
+.auth-page {
+  --auth-gutter: clamp(var(--space-2), 4vw, var(--space-8));
+  display: grid;
+  min-height: 100svh;
+  place-items: center;
+  padding: var(--auth-gutter);
+  background: var(--color-page);
+}
+.auth-layout {
+  display: grid;
+  width: min(100%, 76rem);
+  min-height: min(48rem, calc(100svh - 2 * var(--auth-gutter)));
+  grid-template-columns: 1fr 1fr;
+  border: 1px solid var(--color-line);
+  border-radius: var(--radius-panel);
+  background: var(--color-surface);
+}
+.auth-poster {
+  position: relative;
+  isolation: isolate;
+  min-height: 34rem;
+  overflow: hidden;
+  border-radius: calc(var(--radius-panel) - 1px) 0 0 calc(var(--radius-panel) - 1px);
+  background: var(--color-surface-blue);
+}
+.auth-brand {
+  position: relative;
+  z-index: 1;
+  display: flex;
+  width: fit-content;
+  align-items: center;
+  gap: var(--space-1);
+  margin: var(--space-4);
+  color: var(--color-text);
+  font-family: var(--font-display);
+  font-size: var(--type-lg);
+  font-weight: 800;
+  letter-spacing: -.025em;
+}
+.auth-brand img {
+  width: var(--space-6);
+  height: var(--space-6);
+  border: 1px solid var(--color-line);
+  border-radius: 50%;
+  background: var(--color-surface);
+}
+.auth-illustration { position: absolute; inset: 10% 0 0; display: grid; place-items: center; pointer-events: none; }
+.auth-orbital-system { position: relative; width: 100%; aspect-ratio: 1; color: var(--color-primary); }
+.auth-disc {
+  position: absolute;
+  inset: 13%;
+  border-radius: 50%;
+  background: var(--color-surface-soft);
+}
+.auth-orbit, .auth-orbit-track {
+  position: absolute;
+  top: 50%;
+  left: 50%;
+  border: 1px solid currentColor;
+  border-radius: 50%;
+  transform: translate(-50%, -50%) rotate(-26deg);
+}
+.auth-orbit-outer { width: 155%; height: 78%; }
+.auth-orbit-middle { width: 115%; height: 52%; }
+.auth-orbit-inner { width: 90%; height: 33%; }
+.auth-orbit::after {
+  position: absolute;
+  width: var(--space-2);
+  height: var(--space-2);
+  border: 1px solid currentColor;
+  border-radius: 50%;
+  background: var(--color-surface);
+  content: '';
+}
+.auth-orbit-outer::after { left: 15%; bottom: 12%; width: var(--space-1); height: var(--space-1); }
+.auth-orbit-middle::after { right: 14%; top: 13%; background: var(--color-accent); }
+.auth-orbit-inner::after { bottom: -2%; left: 36%; width: var(--space-1); height: var(--space-1); background: currentColor; }
+.auth-orbit-logo { position: absolute; inset: 8%; width: 84%; height: 84%; }
+.auth-orbit-track { width: 115%; height: 52%; clip-path: inset(50% 0 0); }
+.auth-content {
+  display: grid;
+  min-width: 0;
+  align-items: center;
+  padding: clamp(var(--space-4), 5vw, var(--space-10));
+}
+.auth-inner { width: 100%; max-width: 25rem; margin-inline: auto; }
+.auth-inner h1 {
+  margin: 0 0 var(--space-1);
+  font-family: var(--font-display);
+  font-size: clamp(var(--type-3xl), 4vw, var(--type-5xl));
+  font-weight: 800;
+  letter-spacing: -.035em;
+  line-height: 1.06;
+  overflow-wrap: anywhere;
+}
+.auth-inner h1:focus { outline: none; }
+.auth-intro { margin: 0 0 var(--space-4); color: var(--color-ink-soft); }
+.auth-notice, .auth-action-error {
+  margin: 0 0 var(--space-3);
+  padding: var(--space-2);
+  border-inline-start: 3px solid var(--color-warning);
+  border-radius: 0 var(--radius-field) var(--radius-field) 0;
+  background: var(--surface-citrus-wash);
+  color: var(--color-warning);
+  font-size: var(--type-sm);
+}
+.auth-success { border-color: var(--color-success); background: var(--surface-success); color: var(--color-success); }
+.auth-fields { display: grid; min-width: 0; gap: var(--space-2); margin: 0; padding: 0; border: 0; }
+.auth-field { display: grid; min-width: 0; gap: var(--space-1); }
+.auth-field label { font-weight: 700; }
+.auth-input-wrap { position: relative; }
+.auth-input-wrap input {
+  width: 100%;
+  min-width: 0;
+  min-height: var(--space-6);
+  padding: var(--space-1) var(--space-2);
+  border: 1px solid var(--color-muted-soft);
+  border-radius: var(--radius-field);
+  background: var(--surface-input);
+  color: var(--color-text);
+}
+.auth-input-wrap:has(.auth-visibility) input { padding-right: var(--space-8); }
+.auth-input-wrap input:enabled:hover { border-color: var(--color-primary); }
+.auth-input-wrap input:disabled { background: var(--surface-neutral-wash); border-color: var(--border-input); }
+.auth-input-wrap input[aria-invalid="true"] { border-color: var(--color-danger); }
+.auth-field-error { color: var(--color-danger); font-size: var(--type-sm); }
+.auth-action-error { margin: var(--space-2) 0 0; border-color: var(--color-danger); background: var(--surface-danger); color: var(--color-danger); }
+.auth-visibility, .auth-link, .auth-primary, .auth-demo-button, .auth-member {
+  display: inline-flex;
+  min-height: 44px;
+  align-items: center;
+  justify-content: center;
+  gap: var(--space-1);
+  border: 0;
+  background: transparent;
+  color: var(--color-primary);
+  font-weight: 700;
+  cursor: pointer;
+  transition: background .15s ease, transform .15s ease;
+}
+.auth-page button:active:enabled { transform: translateY(1px); }
+.auth-visibility { position: absolute; inset: 2px 2px 2px auto; width: 44px; padding: 0; border-radius: var(--radius-field); }
+.auth-visibility:enabled:hover { background: var(--surface-blue-wash); }
+.auth-link { padding: 0; text-underline-offset: 3px; }
+.auth-link:enabled:hover { text-decoration: underline; }
+.auth-forgot { display: flex; width: fit-content; margin-left: auto; font-size: var(--type-sm); }
+.auth-back { margin-bottom: var(--space-2); font-size: var(--type-sm); }
+.auth-arrow-back { transform: rotate(180deg); }
+.auth-primary, .auth-demo-button { min-height: var(--space-6); border-radius: var(--radius-pill); }
+.auth-primary { width: 100%; margin-top: var(--space-2); padding: var(--space-1) var(--space-3); background: var(--color-accent); color: var(--color-text-on-accent); }
+.auth-primary:enabled:hover { background: color-mix(in srgb, var(--color-accent) 80%, var(--color-surface-soft)); }
+.auth-primary:disabled { opacity: 1; background: var(--surface-cream-wash); color: var(--color-ink-soft); }
+.auth-inner form[aria-busy="true"] .auth-primary { background: var(--color-accent); }
+.auth-loader { width: var(--space-2); height: var(--space-2); border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: auth-spin .7s linear infinite; }
+@keyframes auth-spin { to { transform: rotate(360deg); } }
+.auth-demo-entry { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--color-border); color: var(--color-muted); font-size: var(--type-sm); }
+.auth-demo-button, .auth-member { padding: var(--space-1) var(--space-2); border: 1px solid var(--color-primary); }
+.auth-demo-button:enabled:hover, .auth-member:hover { background: var(--surface-blue-tint); }
+.auth-members { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-1); }
+.auth-member { justify-content: space-between; min-height: var(--space-6); border-color: var(--color-line); border-radius: var(--radius-field); }
+.auth-member svg { flex-shrink: 0; }
+
+@media (max-width: 760px) {
+  .auth-page { padding: var(--space-2); }
+  .auth-layout { width: min(100%, 34rem); min-height: 0; grid-template-columns: minmax(0, 1fr); }
+  .auth-poster { min-height: 7rem; border-radius: calc(var(--radius-panel) - 1px) calc(var(--radius-panel) - 1px) 0 0; }
+  .auth-brand { max-width: 60%; margin: var(--space-4) 0 var(--space-4) var(--space-3); }
+  .auth-illustration { inset: -55% -16% -55% 57%; }
+  .auth-content { padding: var(--space-4) var(--space-3); }
+  .auth-inner { max-width: none; }
+  .auth-intro { margin-bottom: var(--space-3); }
+}
+@media (max-width: 380px) {
+  .auth-page { padding: var(--space-1); }
+  .auth-content { padding: var(--space-3) var(--space-2); }
+  .auth-brand { margin-left: var(--space-2); }
+}
+@media (prefers-reduced-motion: reduce) {
+  .auth-loader { animation: none; }
+  .auth-page button:active:enabled { transform: none; }
+}
+
 
 
