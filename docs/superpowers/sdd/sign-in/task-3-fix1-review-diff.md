Task 3 fix round 1 snapshot diff (base captured before Device Trust and recovery-state fixes).

===== src/auth/ClerkAuthRoot.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3-fix1\\ClerkAuthRoot.jsx" src/auth/ClerkAuthRoot.jsx
index d8c67c3..b8e6c9f 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3-fix1\\ClerkAuthRoot.jsx"
+++ src/auth/ClerkAuthRoot.jsx
@@ -50,7 +50,21 @@ function SignInEntry({ members, onEnterDemo }) {
     if (username.includes('@')) throw new Error('Username required');
     const { error } = await signIn.password({ identifier: username, password });
     if (error) throw error;
-    await finalize();
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
   }
 
   async function startRecovery({ email }) {
@@ -66,21 +80,30 @@ function SignInEntry({ members, onEnterDemo }) {
     }
   }
 
-  async function completeRecovery({ code, newPassword }) {
+  function requireRecoveryAttempt() {
     if (!recoveryAttempt.current || recoveryAttempt.current !== signIn.id) throw new Error('Recovery unavailable');
-    if (signIn.status !== 'complete') {
-      if (signIn.status !== 'needs_new_password') {
-        const verified = await signIn.resetPasswordEmailCode.verifyCode({ code });
-        if (verified.error) throw verified.error;
-      }
-      const submitted = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
-      if (submitted.error) throw submitted.error;
-    }
-    await finalize();
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
   }
 
   return <AuthEntry authConfigured members={members} onEnterDemo={onEnterDemo}
-    onSignIn={signInWithPassword} onStartRecovery={startRecovery} onCompleteRecovery={completeRecovery} />;
+    onSignIn={signInWithPassword} onSendDeviceCode={sendDeviceCode} onVerifyDeviceCode={verifyDeviceCode}
+    onStartRecovery={startRecovery} onVerifyRecoveryCode={verifyRecoveryCode}
+    onSubmitRecoveryPassword={submitRecoveryPassword} onFinalize={finalize} />;
 }
 
 function SessionGate({ members, onEnterDemo, renderPlanner }) {

===== src/auth/AuthEntry.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3-fix1\\AuthEntry.jsx" src/auth/AuthEntry.jsx
index d15fb0b..7876a9b 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3-fix1\\AuthEntry.jsx"
+++ src/auth/AuthEntry.jsx
@@ -2,6 +2,22 @@ import { useEffect, useLayoutEffect, useRef, useState } from 'react';
 import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
 import logo from '../../Logo/Logo.svg';
 
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
 const screens = {
   signIn: {
     heading: 'Sign in',
@@ -10,6 +26,10 @@ const screens = {
     pending: 'Signing in…',
     error: 'Sign-in was unsuccessful. Check your username and password, then try again.',
   },
+  verifyDevice: deviceVerification,
+  verifyRecoveryDevice: deviceVerification,
+  finishSignIn,
+  finishRecovery: { ...finishSignIn, intro: 'Continue to the planner with your updated password.' },
   recovery: {
     heading: 'Forgot your password?',
     intro: 'Enter the verified email address for your account to request a recovery code.',
@@ -17,12 +37,19 @@ const screens = {
     pending: 'Requesting code…',
     error: 'The recovery request could not be completed. Please try again in a moment.',
   },
-  reset: {
+  recoveryCode: {
+    heading: 'Check your email',
+    intro: 'If that address matches an eligible account, a recovery code is on its way. Enter it below to continue.',
+    action: 'Verify recovery code',
+    pending: 'Verifying code…',
+    error: 'The recovery code could not be accepted. Check it or request another code.',
+  },
+  resetPassword: {
     heading: 'Reset your password',
-    intro: 'If that address matches an eligible account, a recovery code is on its way. Enter it below with your new password.',
-    action: 'Reset password',
-    pending: 'Resetting password…',
-    error: 'The password could not be reset. Check the code and new password, or request another code.',
+    intro: 'Choose a new password for your account.',
+    action: 'Save new password',
+    pending: 'Saving new password…',
+    error: 'The password could not be saved. Try a different password or request another code.',
   },
   demo: {
     heading: 'Choose a member',
@@ -96,9 +123,12 @@ function Field({ name, label, type = 'text', autoComplete, error, actionError, .
   );
 }
 
-export default function AuthEntry({ authConfigured, members, onEnterDemo, onSignIn, onStartRecovery, onCompleteRecovery }) {
+export default function AuthEntry({
+  authConfigured, members, onEnterDemo, onSignIn, onSendDeviceCode, onVerifyDeviceCode,
+  onStartRecovery, onVerifyRecoveryCode, onSubmitRecoveryPassword, onFinalize,
+}) {
   const [screen, setScreen] = useState('signIn');
-  const [busy, setBusy] = useState(false);
+  const [pending, setPending] = useState('');
   const [email, setEmail] = useState('');
   const [errors, setErrors] = useState({});
   const [actionError, setActionError] = useState('');
@@ -109,6 +139,9 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
   const lastScreen = useRef(screen);
   const reduceMotion = useReducedMotion();
   const copy = screens[screen];
+  const busy = Boolean(pending);
+  const verifyingDevice = screen === 'verifyDevice' || screen === 'verifyRecoveryDevice';
+  const finishingSignIn = screen === 'finishSignIn' || screen === 'finishRecovery';
 
   useEffect(() => {
     if (screen !== lastScreen.current) heading.current?.focus();
@@ -128,6 +161,50 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
     setScreen(next);
   }
 
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
   async function submit(event) {
     event.preventDefault();
     if (!authConfigured || busy) return;
@@ -154,23 +231,34 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
       return;
     }
     setFeedbackFocus(null);
-    setBusy(true);
+    setPending(copy.pending);
     try {
-      if (screen === 'signIn') await onSignIn({ username: values.username, password: values.password });
+      if (screen === 'signIn') {
+        const result = await onSignIn({ username: values.username, password: values.password });
+        await continueSignIn(result);
+      }
+      if (verifyingDevice) {
+        await onVerifyDeviceCode({ code: values.code });
+        await finish(screen === 'verifyRecoveryDevice' ? 'finishRecovery' : 'finishSignIn');
+      }
       if (screen === 'recovery') {
         await onStartRecovery({ email: values.email });
         setEmail(values.email);
-        open('reset');
+        open('recoveryCode');
+      }
+      if (screen === 'recoveryCode') {
+        await onVerifyRecoveryCode({ code: values.code });
+        open('resetPassword');
       }
-      if (screen === 'reset') {
-        await onCompleteRecovery({ email, code: values.code, newPassword: values.newPassword });
-        open('signIn', 'Your password has been reset.');
+      if (screen === 'resetPassword') {
+        const result = await onSubmitRecoveryPassword({ newPassword: values.newPassword });
+        await continueSignIn(result, true);
       }
+      if (finishingSignIn) await finish(screen);
     } catch {
-      setActionError(copy.error);
-      setFeedbackFocus({ name: 'submitAction' });
+      showActionError(copy.error);
     } finally {
-      setBusy(false);
+      setPending('');
     }
   }
 
@@ -202,28 +290,27 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
                 {!authConfigured && <p className="auth-notice">Member sign-in isn’t configured yet. You can still explore the demo.</p>}
                 {notice && <p role="status" className="auth-notice auth-success">{notice}</p>}
                 <form ref={formRef} noValidate onSubmit={submit} onChange={clearError} aria-busy={busy}>
-                  <fieldset className="auth-fields" disabled={busy || !authConfigured}>
+                  {!finishingSignIn && <fieldset className="auth-fields" disabled={busy || !authConfigured}>
                     {screen === 'signIn' && <>
                       <Field name="username" label="Username" autoComplete="username" autoCapitalize="none" spellCheck={false} error={errors.username} actionError={actionError} />
                       <Field name="password" label="Password" type="password" autoComplete="current-password" error={errors.password} actionError={actionError} />
                     </>}
                     {screen === 'recovery' && <Field name="email" label="Email address" type="email" autoComplete="email" defaultValue={email} error={errors.email} actionError={actionError} />}
-                    {screen === 'reset' && <>
-                      <Field name="code" label="Recovery code" autoComplete="one-time-code" autoCapitalize="none" spellCheck={false} error={errors.code} actionError={actionError} />
-                      <Field name="newPassword" label="New password" type="password" autoComplete="new-password" error={errors.newPassword} actionError={actionError} />
-                    </>}
-                  </fieldset>
+                    {(verifyingDevice || screen === 'recoveryCode') && <Field name="code" label={verifyingDevice ? 'Verification code' : 'Recovery code'} autoComplete="one-time-code" autoCapitalize="none" spellCheck={false} error={errors.code} actionError={actionError} />}
+                    {screen === 'resetPassword' && <Field name="newPassword" label="New password" type="password" autoComplete="new-password" error={errors.newPassword} actionError={actionError} />}
+                  </fieldset>}
                   {screen === 'signIn' && <button className="auth-link auth-forgot" type="button" disabled={busy || !authConfigured} onClick={() => open('recovery')}>Forgot password?</button>}
-                  {screen === 'reset' && <button className="auth-link auth-forgot" type="button" disabled={busy} onClick={() => open('recovery')}>Request another code</button>}
+                  {(screen === 'recoveryCode' || screen === 'resetPassword') && <button className="auth-link auth-forgot" type="button" disabled={busy} onClick={() => open('recovery')}>Request another code</button>}
+                  {verifyingDevice && <button className="auth-link auth-forgot" name="resendDeviceCode" type="button" disabled={busy} onClick={resendDeviceCode}>Request another code</button>}
                   {actionError && <p className="auth-action-error" id="auth-action-error" role="alert">{actionError}</p>}
                   <button className="auth-primary" name="submitAction" type="submit" disabled={busy || !authConfigured}>
-                    {busy ? copy.pending : copy.action}{busy ? <span className="auth-loader" aria-hidden="true" /> : <Arrow />}
+                    {pending || copy.action}{busy ? <span className="auth-loader" aria-hidden="true" /> : <Arrow />}
                   </button>
                 </form>
                 <span className="sr-only" role="alert" aria-atomic="true">
                   {feedbackFocus?.announcement && <span key={feedbackFocus.attempt}>{feedbackFocus.announcement}</span>}
                 </span>
-                <span className="sr-only" role="status">{busy ? copy.pending : ''}</span>
+                <span className="sr-only" role="status">{pending}</span>
                 {screen === 'signIn' && <div className="auth-demo-entry">
                   <span>Explore with sample data</span>
                   <button type="button" className="auth-demo-button" disabled={busy} onClick={() => open('demo')}>Enter demo <Arrow /></button>
