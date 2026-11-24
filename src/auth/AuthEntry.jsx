import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import logo from '../../Logo/Logo.svg';

const ringSizes = [300, 372, 452, 542, 644, 758, 884, 1000];

const portalEase = [0.22, 1, 0.36, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: portalEase },
  },
};

const deviceVerification = {
  heading: 'Verify this device',
  intro: 'Enter the verification code from your account email.',
  action: 'Verify code',
  pending: 'Verifying code…',
  error: 'The verification code could not be accepted. Check it or request another code.',
};

const finishSignIn = {
  heading: 'Finish signing in',
  intro: 'Continue to your group planner.',
  action: 'Continue to planner',
  pending: 'Finishing sign-in…',
  error: 'Sign-in could not be completed. Try again or return to sign in.',
};

const screens = {
  signIn: {
    heading: 'Welcome back.',
    intro: 'A little plan, a lot of sky — sign in to your group planner.',
    action: 'Sign in',
    pending: 'Signing in…',
    error: 'Sign-in was unsuccessful. Check your username and password, then try again.',
  },
  verifyDevice: deviceVerification,
  verifyRecoveryDevice: deviceVerification,
  finishSignIn,
  finishRecovery: { ...finishSignIn, intro: 'Continue to the planner with your updated password.' },
  recovery: {
    heading: 'Forgot your password?',
    intro: 'Enter the verified email address for your account to request a recovery code.',
    action: 'Send recovery code',
    pending: 'Requesting code…',
    error: 'Couldn’t reach the sign-in service. Check your connection and try again.',
  },
  recoveryCode: {
    heading: 'Check your email',
    intro: 'If that address matches an eligible account, a recovery code is on its way. Enter it below to continue.',
    action: 'Verify recovery code',
    pending: 'Verifying code…',
    error: 'The recovery code could not be accepted. Check it or request another code.',
  },
  resetPassword: {
    heading: 'Reset your password',
    intro: 'Choose a new password for your account.',
    action: 'Save new password',
    pending: 'Saving new password…',
    error: 'The password could not be saved. Try a different password or request another code.',
  },
  demo: {
    heading: 'Choose a member',
    intro: 'Pick a name to explore the planner with sample data.',
  },
};

function AuthIcon({ name, className = '' }) {
  const common = {
    className,
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  if (name === 'user') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.6" />
        <path d="M5 19.5a7 7 0 0 1 14 0" />
      </svg>
    );
  }
  if (name === 'mail') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4.5 7.5 6.4 4.7a1.9 1.9 0 0 0 2.2 0l6.4-4.7" />
      </svg>
    );
  }
  if (name === 'lock') {
    return (
      <svg {...common}>
        <rect x="4" y="10" width="16" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2.5" />
      </svg>
    );
  }
  if (name === 'key') {
    return (
      <svg {...common}>
        <circle cx="8" cy="14" r="3.5" />
        <path d="M10.8 11.8 19 4m-2.5 2.5L19 9m-4.5-.5L16.5 10.5" />
      </svg>
    );
  }
  if (name === 'eye' || name === 'eyeOff') {
    return (
      <svg {...common}>
        <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.7" />
        {name === 'eyeOff' && <path d="m3.5 3.5 17 17" />}
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}

function PortalBackground({ portalRef, reduceMotion }) {
  useEffect(() => {
    const portal = portalRef.current;
    if (!portal || reduceMotion) return;

    let frame;
    let px = 0;
    let py = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (event) => {
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const animate = () => {
      px += (targetX - px) * 0.05;
      py += (targetY - py) * 0.05;
      portal.style.setProperty('--tx', `${px * -14}px`);
      portal.style.setProperty('--ty', `${py * -10}px`);
      frame = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(frame);
    };
  }, [portalRef, reduceMotion]);

  return (
    <div className="auth-portal-layer" aria-hidden="true">
      <motion.div
        className="auth-glow"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.8, ease: portalEase }}
      />
      <motion.svg
        className="auth-rings"
        viewBox="0 0 2000 2000"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.75, ease: portalEase }}
      >
        <defs>
          <linearGradient id="fish-arc-gradient" gradientUnits="userSpaceOnUse" x1="300" y1="300" x2="1700" y2="1700">
            <stop stopColor="var(--palette-citrus)" />
            <stop offset="0.55" stopColor="var(--palette-sea)" />
            <stop offset="1" stopColor="var(--palette-amalfi)" />
          </linearGradient>
        </defs>
        <circle className="auth-wave" cx="1000" cy="1000" r="300" />
        <circle className="auth-wave auth-wave-b" cx="1000" cy="1000" r="300" />
        {ringSizes.map((radius, index) => {
          const length = 9 + (index % 3) * 5;
          return (
            <Fragment key={radius}>
              <circle className="auth-ring-base" cx="1000" cy="1000" r={radius} />
              <circle
                className={`auth-ring-arc${index % 2 ? ' reverse' : ''}`}
                cx="1000"
                cy="1000"
                r={radius}
                pathLength="100"
                strokeDasharray={`${length} ${100 - length}`}
                style={{
                  '--duration': `${38 + index * 12}s`,
                  animationDelay: `${-index * 7.3}s`,
                }}
              />
            </Fragment>
          );
        })}
      </motion.svg>
    </div>
  );
}

export function AuthLayout({ children, hovering = false }) {
  const portalRef = useRef(null);
  const reduceMotion = useReducedMotion();

  return (
    <div ref={portalRef} className={`auth-page${hovering ? ' is-hovering' : ''}`}>
      <PortalBackground portalRef={portalRef} reduceMotion={reduceMotion} />

      <motion.header
        className="auth-top"
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.45, ease: portalEase }}
      >
        <div className="auth-brand">
          <img src={logo} alt="" />
          <span>Fish Upon The Sky</span>
        </div>
        <span className="auth-badge">Invite-only · 7 members</span>
      </motion.header>

      <main className="auth-col">
        <section className="auth-card" aria-labelledby="auth-heading">
          {children}
        </section>
      </main>

      <motion.footer
        className="auth-foot"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.12, ease: portalEase }}
      >
        <span>A little plan, a lot of sky.</span>
        <span>Fish Upon The Sky · 7 members</span>
      </motion.footer>
    </div>
  );
}

function Field({ name, label, icon, type = 'text', autoComplete, error, actionError, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const id = 'auth-' + name;
  const descriptions = [error && id + '-error', actionError && 'auth-action-error'].filter(Boolean).join(' ');
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className={`auth-input-wrap${icon ? ' has-icon' : ''}`}>
        {icon && <AuthIcon name={icon} className="auth-field-icon" />}
        <input
          {...inputProps}
          id={id}
          name={name}
          type={type === 'password' && visible ? 'text' : type}
          required
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptions || undefined}
        />
        {type === 'password' && (
          <button
            type="button"
            className="auth-visibility"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible(!visible)}
          >
            <AuthIcon name={visible ? 'eyeOff' : 'eye'} />
          </button>
        )}
      </div>
      {error && <span className="auth-field-error" id={id + '-error'}>{error}</span>}
    </div>
  );
}

export default function AuthEntry({
  authConfigured, members, onEnterDemo, demoButtonRef, onSignIn, onSendDeviceCode, onVerifyDeviceCode,
  onStartRecovery, onVerifyRecoveryCode, onSubmitRecoveryPassword, onFinalize,
}) {
  const [screen, setScreen] = useState('signIn');
  const [hovering, setHovering] = useState(false);
  const [pending, setPending] = useState('');
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
  const busy = Boolean(pending);
  const verifyingDevice = screen === 'verifyDevice' || screen === 'verifyRecoveryDevice';
  const finishingSignIn = screen === 'finishSignIn' || screen === 'finishRecovery';

  useEffect(() => {
    if (screen !== lastScreen.current) heading.current?.focus();
    lastScreen.current = screen;
  }, [screen]);

  useLayoutEffect(() => {
    if (feedbackFocus && !busy) formRef.current?.elements.namedItem(feedbackFocus.name)?.focus();
  }, [feedbackFocus, busy]);

  function open(next) {
    setHovering(false);
    setFeedbackFocus(null);
    setErrors({});
    setActionError('');
    setNotice('');
    if (next === 'signIn' || next === 'demo') setEmail('');
    setScreen(next);
  }

  function showActionError(message, focus = 'submitAction') {
    setActionError(message);
    setFeedbackFocus({ name: focus });
  }

  async function sendDeviceCode() {
    setPending('Sending verification code…');
    try {
      await onSendDeviceCode();
      setNotice('A verification code is on its way.');
    } catch {
      showActionError('The verification email could not be sent. Try again or return to sign in.', 'resendDeviceCode');
    }
  }

  async function resendDeviceCode() {
    if (busy) return;
    setNotice('');
    setActionError('');
    setFeedbackFocus({ name: 'resendDeviceCode' });
    await sendDeviceCode();
    setPending('');
  }

  async function finish(next) {
    open(next);
    setPending(screens[next].pending);
    try {
      await onFinalize({ passwordReset: next === 'finishRecovery' });
      open('signIn');
    } catch {
      showActionError(screens[next].error);
    }
  }

  async function continueSignIn({ needsDeviceVerification }, fromRecovery = false) {
    if (needsDeviceVerification) {
      open(fromRecovery ? 'verifyRecoveryDevice' : 'verifyDevice');
      await sendDeviceCode();
      return;
    }
    await finish(fromRecovery ? 'finishRecovery' : 'finishSignIn');
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
    setPending(copy.pending);
    try {
      if (screen === 'signIn') {
        const result = await onSignIn({ username: values.username, password: values.password });
        await continueSignIn(result);
      }
      if (verifyingDevice) {
        await onVerifyDeviceCode({ code: values.code });
        await finish(screen === 'verifyRecoveryDevice' ? 'finishRecovery' : 'finishSignIn');
      }
      if (screen === 'recovery') {
        await onStartRecovery({ email: values.email });
        setEmail(values.email);
        open('recoveryCode');
      }
      if (screen === 'recoveryCode') {
        await onVerifyRecoveryCode({ code: values.code });
        open('resetPassword');
      }
      if (screen === 'resetPassword') {
        const result = await onSubmitRecoveryPassword({ newPassword: values.newPassword });
        await continueSignIn(result, true);
      }
      if (finishingSignIn) await finish(screen);
    } catch {
      showActionError(copy.error);
    } finally {
      setPending('');
    }
  }

  function clearError(event) {
    const name = event.target.name;
    if (feedbackFocus) setFeedbackFocus(null);
    if (errors[name]) setErrors(previous => ({ ...previous, [name]: undefined }));
    if (actionError) setActionError('');
  }

  const motionProps = reduceMotion
    ? {}
    : { variants: staggerContainer, initial: 'hidden', animate: 'visible' };
  const itemProps = reduceMotion ? {} : { variants: staggerItem };

  return (
    <AuthLayout hovering={hovering}>
      <motion.div className="auth-inner" key={screen} {...motionProps}>
        <motion.div className="auth-mark" {...itemProps}>
          <img src={logo} alt="" />
        </motion.div>
        {screen !== 'signIn' && (
          <motion.div className="auth-back-wrap" {...itemProps}>
            <button className="auth-link auth-back" type="button" disabled={busy} onClick={() => open('signIn')}>
              <AuthIcon name="arrow" className="auth-arrow-back" /> Back to sign in
            </button>
          </motion.div>
        )}
        <motion.h1 id="auth-heading" ref={heading} tabIndex="-1" {...itemProps}>{copy.heading}</motion.h1>
        <motion.p className="auth-intro" {...itemProps}>{copy.intro}</motion.p>

        {screen === 'demo' ? (
          <motion.div className="auth-members" role="group" aria-label="Demo members" {...itemProps}>
            {members.map(member => (
              <button className="auth-member" key={member.id} type="button" onClick={() => onEnterDemo(member.id)}>
                <span>{member.name}</span>
                <AuthIcon name="arrow" />
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div {...itemProps}>
            {!authConfigured && (
              <p className="auth-notice">Member sign-in isn’t configured yet. You can still explore the demo.</p>
            )}
            {notice && <p role="status" className="auth-notice auth-success">{notice}</p>}
            <form ref={formRef} noValidate onSubmit={submit} onChange={clearError} aria-busy={busy}>
              {!finishingSignIn && (
                <fieldset className="auth-fields" disabled={busy || !authConfigured}>
                  {screen === 'signIn' && (
                    <>
                      <Field name="username" label="Username" icon="user" autoComplete="username" autoCapitalize="none" spellCheck={false} error={errors.username} actionError={actionError} />
                      <Field name="password" label="Password" icon="lock" type="password" autoComplete="current-password" error={errors.password} actionError={actionError} />
                    </>
                  )}
                  {screen === 'recovery' && (
                    <Field name="email" label="Email address" icon="mail" type="email" autoComplete="email" defaultValue={email} error={errors.email} actionError={actionError} />
                  )}
                  {(verifyingDevice || screen === 'recoveryCode') && (
                    <Field name="code" label={verifyingDevice ? 'Verification code' : 'Recovery code'} icon="key" autoComplete="one-time-code" autoCapitalize="none" spellCheck={false} error={errors.code} actionError={actionError} />
                  )}
                  {screen === 'resetPassword' && (
                    <Field name="newPassword" label="New password" icon="lock" type="password" autoComplete="new-password" error={errors.newPassword} actionError={actionError} />
                  )}
                </fieldset>
              )}
              {screen === 'signIn' && (
                <button className="auth-link auth-forgot" type="button" disabled={busy || !authConfigured} onClick={() => open('recovery')}>
                  Forgot password?
                </button>
              )}
              {(screen === 'recoveryCode' || screen === 'resetPassword') && (
                <button className="auth-link auth-forgot" type="button" disabled={busy} onClick={() => open('recovery')}>
                  Request another code
                </button>
              )}
              {verifyingDevice && (
                <button className="auth-link auth-forgot" name="resendDeviceCode" type="button" disabled={busy} onClick={resendDeviceCode}>
                  Request another code
                </button>
              )}
              {actionError && <p className="auth-action-error" id="auth-action-error" role="alert">{actionError}</p>}
              <button
                className="auth-primary"
                name="submitAction"
                type="submit"
                disabled={busy || !authConfigured}
                onPointerEnter={() => setHovering(true)}
                onPointerLeave={() => setHovering(false)}
                onFocus={() => setHovering(true)}
                onBlur={() => setHovering(false)}
              >
                {pending || copy.action}
                {busy ? <span className="auth-loader" aria-hidden="true" /> : <AuthIcon name="arrow" />}
              </button>
            </form>
            <span className="sr-only" role="alert" aria-atomic="true">
              {feedbackFocus?.announcement && <span key={feedbackFocus.attempt}>{feedbackFocus.announcement}</span>}
            </span>
            <span className="sr-only" role="status">{pending}</span>
            {screen === 'signIn' && (
              <>
                <div className="auth-or" aria-hidden="true">
                  <i /><span>or</span><i />
                </div>
                <button
                  ref={demoButtonRef}
                  type="button"
                  className="auth-demo-button"
                  disabled={busy}
                  onClick={() => open('demo')}
                >
                  Explore demo with sample data <AuthIcon name="arrow" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </AuthLayout>
  );
}
