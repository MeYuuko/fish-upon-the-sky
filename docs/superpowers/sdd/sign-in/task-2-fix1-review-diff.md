Task 2 fix round 1 snapshot diff (base captured before the accessibility fix).

===== src/auth/AuthEntry.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-2-fix1\\AuthEntry.jsx" src/auth/AuthEntry.jsx
index bbab463..12c1726 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-2-fix1\\AuthEntry.jsx"
+++ src/auth/AuthEntry.jsx
@@ -1,4 +1,4 @@
-import { useEffect, useRef, useState } from 'react';
+import { useEffect, useLayoutEffect, useRef, useState } from 'react';
 import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
 import logo from '../../Logo/Logo.svg';
 
@@ -93,6 +93,8 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
   const [errors, setErrors] = useState({});
   const [actionError, setActionError] = useState('');
   const [notice, setNotice] = useState('');
+  const [feedbackFocus, setFeedbackFocus] = useState(null);
+  const formRef = useRef(null);
   const heading = useRef(null);
   const lastScreen = useRef(screen);
   const reduceMotion = useReducedMotion();
@@ -103,7 +105,12 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
     lastScreen.current = screen;
   }, [screen]);
 
+  useLayoutEffect(() => {
+    if (feedbackFocus && !busy) formRef.current?.elements.namedItem(feedbackFocus.name)?.focus();
+  }, [feedbackFocus, busy]);
+
   function open(next, message = '') {
+    setFeedbackFocus(null);
     setErrors({});
     setActionError('');
     setNotice(message);
@@ -128,9 +135,15 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
     setErrors(invalid);
     const first = Object.keys(invalid)[0];
     if (first) {
-      form.elements.namedItem(first).focus();
+      const alreadyFocused = form.elements.namedItem(first) === document.activeElement;
+      setFeedbackFocus(previous => ({
+        name: first,
+        announcement: alreadyFocused ? invalid[first] : '',
+        attempt: (previous?.attempt ?? 0) + 1,
+      }));
       return;
     }
+    setFeedbackFocus(null);
     setBusy(true);
     try {
       if (screen === 'signIn') await onSignIn({ username: values.username, password: values.password });
@@ -145,6 +158,7 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
       }
     } catch {
       setActionError(copy.error);
+      setFeedbackFocus({ name: 'submitAction' });
     } finally {
       setBusy(false);
     }
@@ -152,6 +166,7 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
 
   function clearError(event) {
     const name = event.target.name;
+    if (feedbackFocus) setFeedbackFocus(null);
     if (errors[name]) setErrors(previous => ({ ...previous, [name]: undefined }));
     if (actionError) setActionError('');
   }
@@ -179,7 +194,7 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
               <>
                 {!authConfigured && <p className="auth-notice">Member sign-in isn’t configured yet. You can still explore the demo.</p>}
                 {notice && <p role="status" className="auth-notice auth-success">{notice}</p>}
-                <form noValidate onSubmit={submit} onChange={clearError} aria-busy={busy}>
+                <form ref={formRef} noValidate onSubmit={submit} onChange={clearError} aria-busy={busy}>
                   <fieldset className="auth-fields" disabled={busy || !authConfigured}>
                     {screen === 'signIn' && <>
                       <Field name="username" label="Username" autoComplete="username" autoCapitalize="none" spellCheck={false} error={errors.username} actionError={actionError} />
@@ -194,10 +209,13 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
                   {screen === 'signIn' && <button className="auth-link auth-forgot" type="button" disabled={busy || !authConfigured} onClick={() => open('recovery')}>Forgot password?</button>}
                   {screen === 'reset' && <button className="auth-link auth-forgot" type="button" disabled={busy} onClick={() => open('recovery')}>Request another code</button>}
                   {actionError && <p className="auth-action-error" id="auth-action-error" role="alert">{actionError}</p>}
-                  <button className="auth-primary" type="submit" disabled={busy || !authConfigured}>
+                  <button className="auth-primary" name="submitAction" type="submit" disabled={busy || !authConfigured}>
                     {busy ? copy.pending : copy.action}{busy ? <span className="auth-loader" aria-hidden="true" /> : <Arrow />}
                   </button>
                 </form>
+                <span className="sr-only" role="alert" aria-atomic="true">
+                  {feedbackFocus?.announcement && <span key={feedbackFocus.attempt}>{feedbackFocus.announcement}</span>}
+                </span>
                 <span className="sr-only" role="status">{busy ? copy.pending : ''}</span>
                 {screen === 'signIn' && <div className="auth-demo-entry">
                   <span>Explore with sample data</span>

===== src/styles.css =====
(no change)
