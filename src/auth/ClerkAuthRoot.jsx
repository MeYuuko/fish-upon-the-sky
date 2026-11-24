import { Fragment, useRef, useState } from 'react';
import { ClerkProvider, useAuth, useClerk, useSignIn, useUser } from '@clerk/react';
import { ClerkOfflineError, isClerkRuntimeError } from '@clerk/react/errors';
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

function requireRecoveryConnection() {
  if (navigator.onLine === false) throw new ClerkOfflineError('Browser offline');
}

function SignInEntry({ members, onEnterDemo, demoButtonRef, onPasswordReset }) {
  const { signIn } = useSignIn();
  const recoveryAttempt = useRef(null);

  async function finalize({ passwordReset }) {
    const { status, createdSessionId } = signIn;
    if (status !== 'complete' || !createdSessionId) throw new Error('Sign-in incomplete');
    const { error } = await signIn.finalize();
    if (error) throw error;
    if (passwordReset) onPasswordReset(createdSessionId);
  }

  async function signInWithPassword({ username, password }) {
    if (username.includes('@')) throw new Error('Username required');
    const { error } = await signIn.password({ identifier: username, password });
    if (error) throw error;
    return { needsDeviceVerification: signIn.status === 'needs_client_trust' };
  }

  async function sendDeviceCode() {
    const canSendCode = signIn.status === 'needs_client_trust'
      && signIn.supportedSecondFactors.some(factor => factor.strategy === 'email_code');
    if (!canSendCode) throw new Error('Device verification email unavailable');
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) throw error;
  }

  async function verifyDeviceCode({ code }) {
    if (signIn.status !== 'needs_client_trust') throw new Error('Device verification unavailable');
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) throw error;
  }

  async function startRecovery({ email }) {
    recoveryAttempt.current = null;
    try {
      requireRecoveryConnection();
      const { error: createError } = await signIn.create({ identifier: email });
      requireRecoveryConnection();
      if (createError) throw createError;
      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      requireRecoveryConnection();
      if (sendError) throw sendError;
      recoveryAttempt.current = signIn.id;
    } catch (error) {
      // Keep account-dependent and unclassified outcomes on the same conditional code screen.
      const connectionFailed = navigator.onLine === false || ClerkOfflineError.is(error)
        || (isClerkRuntimeError(error) && error.code === 'network_error');
      if (connectionFailed) throw error;
    }
  }

  function requireRecoveryAttempt() {
    if (!recoveryAttempt.current || recoveryAttempt.current !== signIn.id) throw new Error('Recovery unavailable');
  }

  async function verifyRecoveryCode({ code }) {
    requireRecoveryAttempt();
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) throw error;
    if (signIn.status !== 'needs_new_password') throw new Error('Recovery code not verified');
  }

  async function submitRecoveryPassword({ newPassword }) {
    requireRecoveryAttempt();
    if (signIn.status !== 'needs_new_password') throw new Error('Password reset unavailable');
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
    if (error) throw error;
    recoveryAttempt.current = null;
    return { needsDeviceVerification: signIn.status === 'needs_client_trust' };
  }

  return <AuthEntry authConfigured members={members} onEnterDemo={onEnterDemo} demoButtonRef={demoButtonRef}
    onSignIn={signInWithPassword} onSendDeviceCode={sendDeviceCode} onVerifyDeviceCode={verifyDeviceCode}
    onStartRecovery={startRecovery} onVerifyRecoveryCode={verifyRecoveryCode}
    onSubmitRecoveryPassword={submitRecoveryPassword} onFinalize={finalize} />;
}

function SessionGate({ members, onEnterDemo, demoButtonRef, renderPlanner }) {
  const auth = useAuth();
  const { isLoaded, user } = useUser();
  const clerk = useClerk();
  const [passwordResetSessionId, setPasswordResetSessionId] = useState(null);
  const signOut = () => clerk.signOut({ redirectUrl: window.location.pathname });
  const sessionPending = !auth.isLoaded || !isLoaded || (auth.isSignedIn && user?.id !== auth.userId);
  const passwordResetNotice = !sessionPending && auth.isSignedIn && auth.sessionId === passwordResetSessionId
    ? 'Your password has been reset.' : '';

  let content;
  if (sessionPending) {
    content = <AuthStatus heading="Opening your planner"><p role="status">Checking your sign-in…</p></AuthStatus>;
  } else if (!auth.isSignedIn) {
    content = <SignInEntry members={members} onEnterDemo={onEnterDemo} demoButtonRef={demoButtonRef}
      onPasswordReset={setPasswordResetSessionId} />;
  } else {
    const memberId = user?.publicMetadata?.memberId;
    const member = members.find(person => person.id === memberId);
    content = member ? <Fragment key={JSON.stringify([auth.sessionId, member.id])}>
      {renderPlanner({ currentMemberId: member.id, identityMode: 'authenticated', onSignOut: signOut, passwordResetNotice })}
    </Fragment> : <AuthStatus heading="Account setup needed">
      {passwordResetNotice && <p className="auth-notice auth-success">{passwordResetNotice}</p>}
      <p className="auth-intro">Ask the group organizer to link your account to your member profile.</p>
      <SessionExitButton onExit={signOut} />
    </AuthStatus>;
  }

  return <>
    <span className="sr-only" role="status" aria-atomic="true">{passwordResetNotice}</span>
    {content}
  </>;
}

export default function ClerkAuthRoot({ publishableKey, members, onEnterDemo, demoButtonRef, renderPlanner }) {
  if (!publishableKey) return <AuthEntry authConfigured={false} members={members} onEnterDemo={onEnterDemo} demoButtonRef={demoButtonRef} />;
  return <ClerkProvider publishableKey={publishableKey}>
    <SessionGate members={members} onEnterDemo={onEnterDemo} demoButtonRef={demoButtonRef} renderPlanner={renderPlanner} />
  </ClerkProvider>;
}
