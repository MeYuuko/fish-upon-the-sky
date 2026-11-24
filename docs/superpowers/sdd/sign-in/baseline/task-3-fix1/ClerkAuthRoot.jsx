import { Fragment, useRef, useState } from 'react';
import { ClerkProvider, useAuth, useClerk, useSignIn, useUser } from '@clerk/react';
import AuthEntry, { AuthLayout } from './AuthEntry.jsx';

export function SessionExitButton({ onExit, demo = false }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function exit() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await onExit();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return <div className="session-exit">
    <button type="button" className="quiet-button" aria-disabled={busy || undefined} onClick={exit}>
      {demo ? 'Exit demo' : busy ? 'Signing out…' : 'Sign out'}
    </button>
    {failed && <span role="alert">Couldn’t sign out. Please try again.</span>}
  </div>;
}

function AuthStatus({ heading, children }) {
  return <AuthLayout>
    <div className="auth-inner">
      <h1 id="auth-heading">{heading}</h1>
      {children}
    </div>
  </AuthLayout>;
}

function SignInEntry({ members, onEnterDemo }) {
  const { signIn } = useSignIn();
  const recoveryAttempt = useRef(null);

  async function finalize() {
    if (signIn.status !== 'complete') throw new Error('Sign-in incomplete');
    const { error } = await signIn.finalize();
    if (error) throw error;
  }

  async function signInWithPassword({ username, password }) {
    if (username.includes('@')) throw new Error('Username required');
    const { error } = await signIn.password({ identifier: username, password });
    if (error) throw error;
    await finalize();
  }

  async function startRecovery({ email }) {
    recoveryAttempt.current = null;
    // Always show the same next step, including when delivery is unavailable for this account.
    try {
      const created = await signIn.create({ identifier: email });
      if (created.error) return;
      const sent = await signIn.resetPasswordEmailCode.sendCode();
      if (!sent.error) recoveryAttempt.current = signIn.id;
    } catch {
      return;
    }
  }

  async function completeRecovery({ code, newPassword }) {
    if (!recoveryAttempt.current || recoveryAttempt.current !== signIn.id) throw new Error('Recovery unavailable');
    if (signIn.status !== 'complete') {
      if (signIn.status !== 'needs_new_password') {
        const verified = await signIn.resetPasswordEmailCode.verifyCode({ code });
        if (verified.error) throw verified.error;
      }
      const submitted = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
      if (submitted.error) throw submitted.error;
    }
    await finalize();
  }

  return <AuthEntry authConfigured members={members} onEnterDemo={onEnterDemo}
    onSignIn={signInWithPassword} onStartRecovery={startRecovery} onCompleteRecovery={completeRecovery} />;
}

function SessionGate({ members, onEnterDemo, renderPlanner }) {
  const auth = useAuth();
  const { isLoaded, user } = useUser();
  const clerk = useClerk();
  const signOut = () => clerk.signOut({ redirectUrl: window.location.pathname });

  if (!auth.isLoaded || !isLoaded || (auth.isSignedIn && user?.id !== auth.userId)) {
    return <AuthStatus heading="Opening your planner"><p role="status">Checking your sign-in…</p></AuthStatus>;
  }
  if (!auth.isSignedIn) return <SignInEntry members={members} onEnterDemo={onEnterDemo} />;

  const memberId = user?.publicMetadata?.memberId;
  const member = members.find(person => person.id === memberId);
  if (!member) {
    return <AuthStatus heading="Account setup needed">
      <p className="auth-intro">Ask the group organizer to link your account to your member profile.</p>
      <SessionExitButton onExit={signOut} />
    </AuthStatus>;
  }
  return <Fragment key={JSON.stringify([auth.sessionId, member.id])}>
    {renderPlanner({ currentMemberId: member.id, identityMode: 'authenticated', onSignOut: signOut })}
  </Fragment>;
}

export default function ClerkAuthRoot({ publishableKey, members, onEnterDemo, renderPlanner }) {
  if (!publishableKey) return <AuthEntry authConfigured={false} members={members} onEnterDemo={onEnterDemo} />;
  return <ClerkProvider publishableKey={publishableKey}>
    <SessionGate members={members} onEnterDemo={onEnterDemo} renderPlanner={renderPlanner} />
  </ClerkProvider>;
}
