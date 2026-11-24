Task 3 snapshot diff (base captured before implementation; no Git repository).

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
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\styles.css" src/styles.css
index 95023c4..73c083c 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\styles.css"
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

===== src/auth/AuthEntry.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\AuthEntry.jsx" src/auth/AuthEntry.jsx
index 12c1726..d15fb0b 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\AuthEntry.jsx"
+++ src/auth/AuthEntry.jsx
@@ -62,6 +62,16 @@ function OrbitPanel({ reduceMotion }) {
   );
 }
 
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
 function Field({ name, label, type = 'text', autoComplete, error, actionError, ...inputProps }) {
   const [visible, setVisible] = useState(false);
   const id = 'auth-' + name;
@@ -154,7 +164,7 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
       }
       if (screen === 'reset') {
         await onCompleteRecovery({ email, code: values.code, newPassword: values.newPassword });
-        open('signIn', 'Your password has been reset. You can sign in with your new password.');
+        open('signIn', 'Your password has been reset.');
       }
     } catch {
       setActionError(copy.error);
@@ -172,10 +182,7 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
   }
 
   return (
-    <main className="auth-page">
-      <div className="auth-layout">
-        <OrbitPanel reduceMotion={reduceMotion} />
-        <section className="auth-content" aria-labelledby="auth-heading">
+    <AuthLayout>
           <motion.div className="auth-inner" key={screen}
             initial={reduceMotion ? false : { opacity: 0, y: 6 }}
             animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.22 }}>
@@ -224,8 +231,6 @@ export default function AuthEntry({ authConfigured, members, onEnterDemo, onSign
               </>
             )}
           </motion.div>
-        </section>
-      </div>
-    </main>
+    </AuthLayout>
   );
 }

===== src/auth/ClerkAuthRoot.jsx =====
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt" src/auth/ClerkAuthRoot.jsx
index e69de29..d8c67c3 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-3\\empty.txt"
+++ src/auth/ClerkAuthRoot.jsx
@@ -0,0 +1,115 @@
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
+    await finalize();
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
+  async function completeRecovery({ code, newPassword }) {
+    if (!recoveryAttempt.current || recoveryAttempt.current !== signIn.id) throw new Error('Recovery unavailable');
+    if (signIn.status !== 'complete') {
+      if (signIn.status !== 'needs_new_password') {
+        const verified = await signIn.resetPasswordEmailCode.verifyCode({ code });
+        if (verified.error) throw verified.error;
+      }
+      const submitted = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
+      if (submitted.error) throw submitted.error;
+    }
+    await finalize();
+  }
+
+  return <AuthEntry authConfigured members={members} onEnterDemo={onEnterDemo}
+    onSignIn={signInWithPassword} onStartRecovery={startRecovery} onCompleteRecovery={completeRecovery} />;
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
