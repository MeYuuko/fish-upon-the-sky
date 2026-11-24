Final review fix wave snapshot diff.

===== src/auth/ClerkAuthRoot.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\final-fix1\\ClerkAuthRoot.jsx" src/auth/ClerkAuthRoot.jsx
index b8e6c9f..98f0f74 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\final-fix1\\ClerkAuthRoot.jsx"
+++ src/auth/ClerkAuthRoot.jsx
@@ -1,5 +1,6 @@
 import { Fragment, useRef, useState } from 'react';
 import { ClerkProvider, useAuth, useClerk, useSignIn, useUser } from '@clerk/react';
+import { ClerkOfflineError, isClerkRuntimeError } from '@clerk/react/errors';
 import AuthEntry, { AuthLayout } from './AuthEntry.jsx';
 
 export function SessionExitButton({ onExit, demo = false }) {
@@ -36,14 +37,20 @@ function AuthStatus({ heading, children }) {
   </AuthLayout>;
 }
 
-function SignInEntry({ members, onEnterDemo }) {
+function requireRecoveryConnection() {
+  if (navigator.onLine === false) throw new ClerkOfflineError('Browser offline');
+}
+
+function SignInEntry({ members, onEnterDemo, demoButtonRef, onPasswordReset }) {
   const { signIn } = useSignIn();
   const recoveryAttempt = useRef(null);
 
-  async function finalize() {
-    if (signIn.status !== 'complete') throw new Error('Sign-in incomplete');
+  async function finalize({ passwordReset }) {
+    const { status, createdSessionId } = signIn;
+    if (status !== 'complete' || !createdSessionId) throw new Error('Sign-in incomplete');
     const { error } = await signIn.finalize();
     if (error) throw error;
+    if (passwordReset) onPasswordReset(createdSessionId);
   }
 
   async function signInWithPassword({ username, password }) {
@@ -69,14 +76,20 @@ function SignInEntry({ members, onEnterDemo }) {
 
   async function startRecovery({ email }) {
     recoveryAttempt.current = null;
-    // Always show the same next step, including when delivery is unavailable for this account.
     try {
-      const created = await signIn.create({ identifier: email });
-      if (created.error) return;
-      const sent = await signIn.resetPasswordEmailCode.sendCode();
-      if (!sent.error) recoveryAttempt.current = signIn.id;
-    } catch {
-      return;
+      requireRecoveryConnection();
+      const { error: createError } = await signIn.create({ identifier: email });
+      requireRecoveryConnection();
+      if (createError) throw createError;
+      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
+      requireRecoveryConnection();
+      if (sendError) throw sendError;
+      recoveryAttempt.current = signIn.id;
+    } catch (error) {
+      // Keep account-dependent and unclassified outcomes on the same conditional code screen.
+      const connectionFailed = navigator.onLine === false || ClerkOfflineError.is(error)
+        || (isClerkRuntimeError(error) && error.code === 'network_error');
+      if (connectionFailed) throw error;
     }
   }
 
@@ -100,39 +113,49 @@ function SignInEntry({ members, onEnterDemo }) {
     return { needsDeviceVerification: signIn.status === 'needs_client_trust' };
   }
 
-  return <AuthEntry authConfigured members={members} onEnterDemo={onEnterDemo}
+  return <AuthEntry authConfigured members={members} onEnterDemo={onEnterDemo} demoButtonRef={demoButtonRef}
     onSignIn={signInWithPassword} onSendDeviceCode={sendDeviceCode} onVerifyDeviceCode={verifyDeviceCode}
     onStartRecovery={startRecovery} onVerifyRecoveryCode={verifyRecoveryCode}
     onSubmitRecoveryPassword={submitRecoveryPassword} onFinalize={finalize} />;
 }
 
-function SessionGate({ members, onEnterDemo, renderPlanner }) {
+function SessionGate({ members, onEnterDemo, demoButtonRef, renderPlanner }) {
   const auth = useAuth();
   const { isLoaded, user } = useUser();
   const clerk = useClerk();
+  const [passwordResetSessionId, setPasswordResetSessionId] = useState(null);
   const signOut = () => clerk.signOut({ redirectUrl: window.location.pathname });
-
-  if (!auth.isLoaded || !isLoaded || (auth.isSignedIn && user?.id !== auth.userId)) {
-    return <AuthStatus heading="Opening your planner"><p role="status">Checking your sign-in…</p></AuthStatus>;
-  }
-  if (!auth.isSignedIn) return <SignInEntry members={members} onEnterDemo={onEnterDemo} />;
-
-  const memberId = user?.publicMetadata?.memberId;
-  const member = members.find(person => person.id === memberId);
-  if (!member) {
-    return <AuthStatus heading="Account setup needed">
+  const sessionPending = !auth.isLoaded || !isLoaded || (auth.isSignedIn && user?.id !== auth.userId);
+  const passwordResetNotice = !sessionPending && auth.isSignedIn && auth.sessionId === passwordResetSessionId
+    ? 'Your password has been reset.' : '';
+
+  let content;
+  if (sessionPending) {
+    content = <AuthStatus heading="Opening your planner"><p role="status">Checking your sign-in…</p></AuthStatus>;
+  } else if (!auth.isSignedIn) {
+    content = <SignInEntry members={members} onEnterDemo={onEnterDemo} demoButtonRef={demoButtonRef}
+      onPasswordReset={setPasswordResetSessionId} />;
+  } else {
+    const memberId = user?.publicMetadata?.memberId;
+    const member = members.find(person => person.id === memberId);
+    content = member ? <Fragment key={JSON.stringify([auth.sessionId, member.id])}>
+      {renderPlanner({ currentMemberId: member.id, identityMode: 'authenticated', onSignOut: signOut, passwordResetNotice })}
+    </Fragment> : <AuthStatus heading="Account setup needed">
+      {passwordResetNotice && <p className="auth-notice auth-success">{passwordResetNotice}</p>}
       <p className="auth-intro">Ask the group organizer to link your account to your member profile.</p>
       <SessionExitButton onExit={signOut} />
     </AuthStatus>;
   }
-  return <Fragment key={JSON.stringify([auth.sessionId, member.id])}>
-    {renderPlanner({ currentMemberId: member.id, identityMode: 'authenticated', onSignOut: signOut })}
-  </Fragment>;
+
+  return <>
+    <span className="sr-only" role="status" aria-atomic="true">{passwordResetNotice}</span>
+    {content}
+  </>;
 }
 
-export default function ClerkAuthRoot({ publishableKey, members, onEnterDemo, renderPlanner }) {
-  if (!publishableKey) return <AuthEntry authConfigured={false} members={members} onEnterDemo={onEnterDemo} />;
+export default function ClerkAuthRoot({ publishableKey, members, onEnterDemo, demoButtonRef, renderPlanner }) {
+  if (!publishableKey) return <AuthEntry authConfigured={false} members={members} onEnterDemo={onEnterDemo} demoButtonRef={demoButtonRef} />;
   return <ClerkProvider publishableKey={publishableKey}>
-    <SessionGate members={members} onEnterDemo={onEnterDemo} renderPlanner={renderPlanner} />
+    <SessionGate members={members} onEnterDemo={onEnterDemo} demoButtonRef={demoButtonRef} renderPlanner={renderPlanner} />
   </ClerkProvider>;
 }

===== src/auth/AuthEntry.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\final-fix1\\AuthEntry.jsx" src/auth/AuthEntry.jsx
index 7876a9b..f5c15ea 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\final-fix1\\AuthEntry.jsx"
+++ src/auth/AuthEntry.jsx
@@ -35,7 +35,7 @@ const screens = {
     intro: 'Enter the verified email address for your account to request a recovery code.',
     action: 'Send recovery code',
     pending: 'Requesting code…',
-    error: 'The recovery request could not be completed. Please try again in a moment.',
+    error: 'Couldn’t reach the sign-in service. Check your connection and try again.',
   },
   recoveryCode: {
     heading: 'Check your email',
@@ -124,7 +124,7 @@ function Field({ name, label, type = 'text', autoComplete, error, actionError, .
 }
 
 export default function AuthEntry({
-  authConfigured, members, onEnterDemo, onSignIn, onSendDeviceCode, onVerifyDeviceCode,
+  authConfigured, members, onEnterDemo, demoButtonRef, onSignIn, onSendDeviceCode, onVerifyDeviceCode,
   onStartRecovery, onVerifyRecoveryCode, onSubmitRecoveryPassword, onFinalize,
 }) {
   const [screen, setScreen] = useState('signIn');
@@ -152,11 +152,11 @@ export default function AuthEntry({
     if (feedbackFocus && !busy) formRef.current?.elements.namedItem(feedbackFocus.name)?.focus();
   }, [feedbackFocus, busy]);
 
-  function open(next, message = '') {
+  function open(next) {
     setFeedbackFocus(null);
     setErrors({});
     setActionError('');
-    setNotice(message);
+    setNotice('');
     if (next === 'signIn' || next === 'demo') setEmail('');
     setScreen(next);
   }
@@ -189,8 +189,8 @@ export default function AuthEntry({
     open(next);
     setPending(screens[next].pending);
     try {
-      await onFinalize();
-      open('signIn', next === 'finishRecovery' ? 'Your password has been reset.' : '');
+      await onFinalize({ passwordReset: next === 'finishRecovery' });
+      open('signIn');
     } catch {
       showActionError(screens[next].error);
     }
@@ -313,7 +313,7 @@ export default function AuthEntry({
                 <span className="sr-only" role="status">{pending}</span>
                 {screen === 'signIn' && <div className="auth-demo-entry">
                   <span>Explore with sample data</span>
-                  <button type="button" className="auth-demo-button" disabled={busy} onClick={() => open('demo')}>Enter demo <Arrow /></button>
+                  <button ref={demoButtonRef} type="button" className="auth-demo-button" disabled={busy} onClick={() => open('demo')}>Enter demo <Arrow /></button>
                 </div>}
               </>
             )}

===== src/App.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\final-fix1\\App.jsx" src/App.jsx
index 82bdb81..896bb23 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\final-fix1\\App.jsx"
+++ src/App.jsx
@@ -1,4 +1,4 @@
-import { useState } from 'react';
+import { useRef, useState } from 'react';
 import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
 import ClerkAuthRoot, { SessionExitButton } from './auth/ClerkAuthRoot.jsx';
 import { clerkPublishableKey } from './auth/auth-config.js';
@@ -281,7 +281,7 @@ function OutingsView({ polls, outings, onNewPoll, currentMemberId, onVote, goTo,
 
 function MoneyView({ outings, sheetUrls, onSheetChange, onSheetSave }) {
   return <section className="page-section">
-    <div className="page-title-row"><div><span className="eyebrow">One sheet for each outing</span><h1>Money, kept simple.</h1><p>Each plan has its own expense sheet. Add its link here so the whole group can find it later.</p></div><div className="money-stamp">NO<br />SURPRISE<br />SPLITS</div></div>
+    <div className="page-title-row"><div><span className="eyebrow">One sheet for each outing</span><h1>Money, kept simple.</h1><p>Each outing has its own expense sheet. Links added here stay in this planner until you leave or reload it.</p></div><div className="money-stamp">NO<br />SURPRISE<br />SPLITS</div></div>
     <div className="money-intro"><div className="money-intro-icon"><Icon name="wallet" size={25} /></div><div><strong>The outing’s sheet does the math.</strong><p>Keep detailed costs in the group’s separate sheet. This page only keeps the link and its status.</p></div></div>
     <div className="expense-list">{outings.map((outing) => {
       const value = sheetUrls[outing.id] ?? outing.sheetUrl;
@@ -332,7 +332,7 @@ function StickerSlapFooter({ onNavigate, onNewPoll, reduceMotion }) {
   </motion.footer>;
 }
 
-export function PlannerApp({ currentMemberId: entryMemberId, identityMode, onExitDemo, onSignOut }) {
+export function PlannerApp({ currentMemberId: entryMemberId, identityMode, onExitDemo, onSignOut, passwordResetNotice }) {
   const reduceMotion = useReducedMotion();
   const [theme, setTheme] = useState('light');
   const [activeTab, setActiveTab] = useState('home');
@@ -382,6 +382,7 @@ export function PlannerApp({ currentMemberId: entryMemberId, identityMode, onExi
         <span>{isDemo ? 'Demo · sample data' : 'Local sample data'}</span>
         <SessionExitButton demo={isDemo} onExit={isDemo ? onExitDemo : onSignOut} />
       </div>
+      {passwordResetNotice && <p className="planner-reset-notice">{passwordResetNotice}</p>}
       <header className="topbar"><div className="topbar-context"><span className="crumb">FISH UPON THE SKY <i>/</i> {activeTab.toUpperCase()}</span><h2>{titleByTab[activeTab]}</h2><p>{subtitleByTab[activeTab]}</p></div><div className="topbar-actions"><button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} /></button><div className="topbar-member" title={`Editing as ${currentMember.name}`}><Avatar person={currentMember} small /><span>{currentMember.nickname || currentMember.name}</span></div><button className="button button-primary topbar-new" onClick={() => setShowPollModal(true)}><Icon name="plus" size={18} /> New outing poll</button></div></header>
       <main className="page-content">
         <AnimatePresence mode="wait" initial={false}>
@@ -403,9 +404,23 @@ export function PlannerApp({ currentMemberId: entryMemberId, identityMode, onExi
 
 export default function App() {
   const [demoMemberId, setDemoMemberId] = useState(null);
+  const restoreDemoFocus = useRef(false);
+
+  function exitDemo() {
+    restoreDemoFocus.current = true;
+    setDemoMemberId(null);
+  }
+
+  function focusDemoButton(button) {
+    if (button && restoreDemoFocus.current) {
+      restoreDemoFocus.current = false;
+      button.focus();
+    }
+  }
+
   if (demoMemberId) {
-    return <PlannerApp currentMemberId={demoMemberId} identityMode="demo" onExitDemo={() => setDemoMemberId(null)} />;
+    return <PlannerApp currentMemberId={demoMemberId} identityMode="demo" onExitDemo={exitDemo} />;
   }
   return <ClerkAuthRoot publishableKey={clerkPublishableKey} members={people} onEnterDemo={setDemoMemberId}
-    renderPlanner={identity => <PlannerApp {...identity} />} />;
+    demoButtonRef={focusDemoButton} renderPlanner={identity => <PlannerApp {...identity} />} />;
 }

===== src/styles.css =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\final-fix1\\styles.css" src/styles.css
index 73c083c..a01e180 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\final-fix1\\styles.css"
+++ src/styles.css
@@ -153,6 +153,7 @@ button:disabled { cursor: not-allowed; opacity: .5; }
 .sidebar-bottom .nav-caption { display: block; margin: 0 0 9px 3px; }
 .member-select { width: 100%; }
 .planner-session { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); padding: 0 clamp(16px, 5vw, 72px); background: var(--surface-blue-wash); color: var(--color-ink-soft); font-size: var(--type-sm); }
+.planner-reset-notice { margin: 0; padding: var(--space-1) clamp(16px, 5vw, 72px); background: var(--surface-success); color: var(--color-success); font-size: var(--type-sm); }
 .session-exit { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1); }
 .session-exit .quiet-button { min-width: 44px; min-height: 44px; color: var(--color-primary); }
 .session-exit .quiet-button[aria-disabled="true"] { cursor: wait; }
