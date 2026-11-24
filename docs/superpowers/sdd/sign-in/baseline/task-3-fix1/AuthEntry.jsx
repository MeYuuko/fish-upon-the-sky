import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import logo from '../../Logo/Logo.svg';

const screens = {
  signIn: {
    heading: 'Sign in',
    intro: 'Welcome back to your group planner.',
    action: 'Sign in',
    pending: 'Signing in…',
    error: 'Sign-in was unsuccessful. Check your username and password, then try again.',
  },
  recovery: {
    heading: 'Forgot your password?',
    intro: 'Enter the verified email address for your account to request a recovery code.',
    action: 'Send recovery code',
    pending: 'Requesting code…',
    error: 'The recovery request could not be completed. Please try again in a moment.',
  },
  reset: {
    heading: 'Reset your password',
    intro: 'If that address matches an eligible account, a recovery code is on its way. Enter it below with your new password.',
    action: 'Reset password',
    pending: 'Resetting password…',
    error: 'The password could not be reset. Check the code and new password, or request another code.',
  },
  demo: {
    heading: 'Choose a member',
    intro: 'Pick a name to explore the planner with sample data.',
  },
};

function Arrow({ back = false }) {
  return <svg className={back ? 'auth-arrow-back' : undefined} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}

function OrbitPanel({ reduceMotion }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function followPointer(event) {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 8);
    y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
  }

  return (
    <div className="auth-poster" onPointerMove={followPointer} onPointerLeave={() => { x.set(0); y.set(0); }}>
      <header className="auth-brand"><img src={logo} alt="" /><span>Fish Upon The Sky</span></header>
      <div className="auth-illustration" aria-hidden="true">
        <motion.div className="auth-orbital-system" style={reduceMotion ? undefined : { x, y }}>
          <span className="auth-disc" />
          <span className="auth-orbit auth-orbit-outer" />
          <span className="auth-orbit auth-orbit-middle" />
          <span className="auth-orbit auth-orbit-inner" />
          <img className="auth-orbit-logo" src={logo} alt="" />
          <span className="auth-orbit-track" />
        </motion.div>
      </div>
    </div>
  );
}

export function AuthLayout({ children }) {
  const reduceMotion = useReducedMotion();
  return <main className="auth-page">
    <div className="auth-layout">
      <OrbitPanel reduceMotion={reduceMotion} />
      <section className="auth-content" aria-labelledby="auth-heading">{children}</section>
    </div>
  </main>;
}

function Field({ name, label, type = 'text', autoComplete, error, actionError, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const id = 'auth-' + name;
  const descriptions = [error && id + '-error', actionError && 'auth-action-error'].filter(Boolean).join(' ');
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <input {...inputProps} id={id} name={name} type={type === 'password' && visible ? 'text' : type}
          required autoComplete={autoComplete} aria-invalid={error ? true : undefined}
          aria-describedby={descriptions || undefined} />
        {type === 'password' && <button type="button" className="auth-visibility" aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(!visible)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="2.7" />
            {visible && <path d="m3 3 18 18" />}
          </svg>
        </button>}
      </div>
      {error && <span className="auth-field-error" id={id + '-error'}>{error}</span>}
    </div>
  );
}

export default function AuthEntry({ authConfigured, members, onEnterDemo, onSignIn, onStartRecovery, onCompleteRecovery }) {
  const [screen, setScreen] = useState('signIn');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [feedbackFocus, setFeedbackFocus] = useState(null);
  const formRef = useRef(null);
  const heading = useRef(null);
  const lastScreen = useRef(screen);
  const reduceMotion = useReducedMotion();
  const copy = screens[screen];

  useEffect(() => {
    if (screen !== lastScreen.current) heading.current?.focus();
    lastScreen.current = screen;
  }, [screen]);

  useLayoutEffect(() => {
    if (feedbackFocus && !busy) formRef.current?.elements.namedItem(feedbackFocus.name)?.focus();
  }, [feedbackFocus, busy]);

  function open(next, message = '') {
    setFeedbackFocus(null);
    setErrors({});
    setActionError('');
    setNotice(message);
    if (next === 'signIn' || next === 'demo') setEmail('');
    setScreen(next);
  }

  async function submit(event) {
    event.preventDefault();
    if (!authConfigured || busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const invalid = {};
    for (const input of form.querySelectorAll('input')) {
      const name = input.name;
      if (name !== 'password' && name !== 'newPassword') values[name] = values[name].trim();
      if (!values[name]) invalid[name] = 'Enter your ' + input.labels[0].textContent.toLowerCase() + '.';
      else if (input.validity.typeMismatch) invalid[name] = 'Enter a valid email address.';
    }
    setActionError('');
    setNotice('');
    setErrors(invalid);
    const first = Object.keys(invalid)[0];
    if (first) {
      const alreadyFocused = form.elements.namedItem(first) === document.activeElement;
      setFeedbackFocus(previous => ({
        name: first,
        announcement: alreadyFocused ? invalid[first] : '',
        attempt: (previous?.attempt ?? 0) + 1,
      }));
      return;
    }
    setFeedbackFocus(null);
    setBusy(true);
    try {
      if (screen === 'signIn') await onSignIn({ username: values.username, password: values.password });
      if (screen === 'recovery') {
        await onStartRecovery({ email: values.email });
        setEmail(values.email);
        open('reset');
      }
      if (screen === 'reset') {
        await onCompleteRecovery({ email, code: values.code, newPassword: values.newPassword });
        open('signIn', 'Your password has been reset.');
      }
    } catch {
      setActionError(copy.error);
      setFeedbackFocus({ name: 'submitAction' });
    } finally {
      setBusy(false);
    }
  }

  function clearError(event) {
    const name = event.target.name;
    if (feedbackFocus) setFeedbackFocus(null);
    if (errors[name]) setErrors(previous => ({ ...previous, [name]: undefined }));
    if (actionError) setActionError('');
  }

  return (
    <AuthLayout>
          <motion.div className="auth-inner" key={screen}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.22 }}>
            {screen !== 'signIn' && <button className="auth-link auth-back" type="button" disabled={busy} onClick={() => open('signIn')}><Arrow back /> Back to sign in</button>}
            <h1 id="auth-heading" ref={heading} tabIndex="-1">{copy.heading}</h1>
            <p className="auth-intro">{copy.intro}</p>
            {screen === 'demo' ? (
              <div className="auth-members" role="group" aria-label="Demo members">
                {members.map(member => (
                  <button className="auth-member" key={member.id} type="button" onClick={() => onEnterDemo(member.id)}>
                    {member.name}<Arrow />
                  </button>
                ))}
              </div>
            ) : (
              <>
                {!authConfigured && <p className="auth-notice">Member sign-in isn’t configured yet. You can still explore the demo.</p>}
                {notice && <p role="status" className="auth-notice auth-success">{notice}</p>}
                <form ref={formRef} noValidate onSubmit={submit} onChange={clearError} aria-busy={busy}>
                  <fieldset className="auth-fields" disabled={busy || !authConfigured}>
                    {screen === 'signIn' && <>
                      <Field name="username" label="Username" autoComplete="username" autoCapitalize="none" spellCheck={false} error={errors.username} actionError={actionError} />
                      <Field name="password" label="Password" type="password" autoComplete="current-password" error={errors.password} actionError={actionError} />
                    </>}
                    {screen === 'recovery' && <Field name="email" label="Email address" type="email" autoComplete="email" defaultValue={email} error={errors.email} actionError={actionError} />}
                    {screen === 'reset' && <>
                      <Field name="code" label="Recovery code" autoComplete="one-time-code" autoCapitalize="none" spellCheck={false} error={errors.code} actionError={actionError} />
                      <Field name="newPassword" label="New password" type="password" autoComplete="new-password" error={errors.newPassword} actionError={actionError} />
                    </>}
                  </fieldset>
                  {screen === 'signIn' && <button className="auth-link auth-forgot" type="button" disabled={busy || !authConfigured} onClick={() => open('recovery')}>Forgot password?</button>}
                  {screen === 'reset' && <button className="auth-link auth-forgot" type="button" disabled={busy} onClick={() => open('recovery')}>Request another code</button>}
                  {actionError && <p className="auth-action-error" id="auth-action-error" role="alert">{actionError}</p>}
                  <button className="auth-primary" name="submitAction" type="submit" disabled={busy || !authConfigured}>
                    {busy ? copy.pending : copy.action}{busy ? <span className="auth-loader" aria-hidden="true" /> : <Arrow />}
                  </button>
                </form>
                <span className="sr-only" role="alert" aria-atomic="true">
                  {feedbackFocus?.announcement && <span key={feedbackFocus.attempt}>{feedbackFocus.announcement}</span>}
                </span>
                <span className="sr-only" role="status">{busy ? copy.pending : ''}</span>
                {screen === 'signIn' && <div className="auth-demo-entry">
                  <span>Explore with sample data</span>
                  <button type="button" className="auth-demo-button" disabled={busy} onClick={() => open('demo')}>Enter demo <Arrow /></button>
                </div>}
              </>
            )}
          </motion.div>
    </AuthLayout>
  );
}
