import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Beam Wordmark Footer — adapted from 21st.dev BeamWordmarkFooter to
 * Fish Upon The Sky's MP174 design tokens with Framer Motion entrance.
 */

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export const hexToRgb = (hex, fallback = '1, 146, 198') => {
  const m = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec((hex || '').trim());
  if (!m) return fallback;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const n = parseInt(h, 16);
  return ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255);
};

export const fitSize = (measuredAt100, target, cap) => {
  if (!(measuredAt100 > 0) || !(target > 0)) return 0;
  const size = (100 * target) / measuredAt100;
  return cap > 0 ? Math.min(size, cap) : size;
};

export const beamTarget = (u, lo = 30, hi = 82) =>
  lo + (hi - lo) * clamp(Number.isFinite(u) ? u : 0.5, 0, 1);

export const drift = (t, centre = 58, amp = 9) =>
  centre + amp * (0.7 * Math.sin(t * 0.21) + 0.3 * Math.sin(t * 0.077 + 1.3));

export const approach = (from, to, k, dt) =>
  to + (from - to) * Math.pow(1 - clamp(k, 0, 1), clamp(dt, 0, 0.1) * 60);

export const baselineAt = (ascent, descent) => {
  if (!(ascent > 0) || !(descent >= 0)) return 0.8;
  return clamp(((100 - ascent - descent) / 2 + ascent) / 100, 0.5, 1.2);
};

export const wordHeight = (fontSize, baseline, cut) =>
  Math.max(0, fontSize * (baseline + clamp(Number.isFinite(cut) ? cut : 0, -0.4, 0.4)));

const QUICK_ICONS = {
  home: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 10.5 8-6.5 8 6.5" />
      <path d="M6 9.5v9.5h12V9.5M9.5 19v-5.5h5V19" />
    </g>
  ),
  outings: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" />
      <path d="m18.5 15 .6 1.9L21 17.5l-1.9.6-.6 1.9-.6-1.9L16 17.5l1.9-.6.6-1.9Z" />
    </g>
  ),
  vault: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 7A2 2 0 0 1 5.5 5h3.8l1.8 2.2h7.4a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7Z" />
    </g>
  ),
  'new-poll': (
    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </g>
  ),
};

const measureBaseline = (family, weight, text) => {
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return 0.8;
    ctx.font = `${weight} 100px ${family}`;
    const m = ctx.measureText(text);
    return baselineAt(m.fontBoundingBoxAscent, m.fontBoundingBoxDescent);
  } catch {
    return 0.8;
  }
};

const Arrow = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path
      d="M2.5 9.5l7-7M4 2.5h5.5V8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DEFAULT_SOCIALS = [
  { label: 'My tasks', action: 'home', icon: 'home' },
  { label: 'Outings', action: 'outings', icon: 'outings' },
  { label: 'Trip Vault', action: 'vault', icon: 'vault' },
  { label: 'Start a new plan', action: 'new-poll', icon: 'new-poll' },
];

const DEFAULT_CREDITS = [
  { lead: 'A little plan, ', label: 'a lot of sky.' },
  { lead: 'Shared lightly by ', label: '07 members', tail: ' · Invite only' },
];

const DEFAULT_COLUMNS = [
  {
    title: 'Spaces',
    links: [
      { label: 'My tasks', tab: 'home' },
      { label: 'Calendar', tab: 'calendar' },
      { label: 'Outings', tab: 'outings' },
      { label: 'Vault', tab: 'vault' },
      { label: 'Fishes', tab: 'members' },
    ],
  },
  {
    title: 'Quick actions',
    links: [
      { label: 'Start a new plan', action: 'new-poll' },
      { label: 'Open active vote', tab: 'outings' },
      { label: 'Trip expense sheets', tab: 'vault' },
      { label: 'Back to top', action: 'scroll-top' },
    ],
  },
];

export default function BeamWordmarkFooter({
  brand = 'Fish Upon The Sky',
  wordmark = 'FISH UPON THE SKY',
  company = 'Fish Upon The Sky · 07 Members',
  year = new Date().getFullYear(),
  socials = DEFAULT_SOCIALS,
  credits = DEFAULT_CREDITS,
  columns = DEFAULT_COLUMNS,
  onNavigate,
  onNewPoll,
  onScrollTop,
  onLinkClick,
  cut = 0.14,
  background = '#0B1842',
  ink = '#F4F5FA',
  muted = '#D4EAFF',
  accent = '#0192C6',
  citrus = '#F1FF62',
  wordTop = '#004499',
  wordFoot = '#081233',
  fontSans = 'var(--font-sans)',
  wordWeight = 800,
  animate = true,
  className = '',
}) {
  const reduceMotion = useReducedMotion();
  const word = (wordmark ?? brand).trim() || brand;
  const letters = React.useMemo(() => Array.from(word), [word]);

  const rootRef = React.useRef(null);
  const wordRef = React.useRef(null);
  const innerRef = React.useRef(null);
  const [size, setSize] = React.useState(0);
  const [base, setBase] = React.useState(0.8);
  const [seen, setSeen] = React.useState(false);

  const ptr = React.useRef({ u: 0.5, x: 0, y: 0, inside: false });

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const box = wordRef.current;
    const inner = innerRef.current;
    if (!root || !box || !inner) return;
    let frame = 0;

    const place = () => {
      const r = root.getBoundingClientRect();
      root.style.setProperty('--bwf-rw', r.width + 'px');
      root.style.setProperty('--bwf-rh', r.height + 'px');
      const spans = inner.querySelectorAll('.bwf-l');
      let top = 0;
      spans.forEach((s, i) => {
        let x = 0;
        let y = 0;
        let el = s;
        while (el && el !== root) {
          x += el.offsetLeft;
          y += el.offsetTop;
          el = el.offsetParent;
        }
        s.style.setProperty('--bwf-x', x + 'px');
        s.style.setProperty('--bwf-y', y + 'px');
        if (i === 0) top = y;
      });
      root.style.setProperty('--bwf-top', top + 'px');
      root.style.setProperty('--bwf-bot', top + (parseFloat(inner.style.fontSize) || 0) * 0.92 + 'px');
    };

    const fit = () => {
      const wb = inner.parentElement ?? box;
      const pad = parseFloat(getComputedStyle(wb).paddingLeft) || 0;
      const target = wb.clientWidth - pad * 2;
      inner.style.fontSize = '100px';
      const measured = inner.offsetWidth;
      setBase(measureBaseline(getComputedStyle(inner).fontFamily, wordWeight, word));
      const next = fitSize(measured, target, target * 0.42);
      inner.style.fontSize = next + 'px';
      setSize(next);
      place();
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    fit();
    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    let alive = true;
    document.fonts?.ready.then(() => alive && schedule());
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [word, fontSans, wordWeight]);

  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { threshold: 0.1 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const set = (b, px, py, g) => {
      root.style.setProperty('--bwf-b', b.toFixed(2) + '%');
      root.style.setProperty('--bwf-px', px.toFixed(1) + 'px');
      root.style.setProperty('--bwf-py', py.toFixed(1) + 'px');
      root.style.setProperty('--bwf-g', g.toFixed(3));
    };
    const still = reduceMotion || !animate;
    if (still || !visible) {
      const p = ptr.current;
      set(58, p.x, p.y, p.inside ? 1 : 0);
      if (!still) return;
      const onMove = () => set(58, ptr.current.x, ptr.current.y, ptr.current.inside ? 1 : 0);
      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerleave', onMove);
      return () => {
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerleave', onMove);
      };
    }
    let raf = 0;
    let last = performance.now();
    let t = last / 1000;
    let b = 58;
    let px = ptr.current.x;
    let py = ptr.current.y;
    let g = 0;
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      const p = ptr.current;
      const idle = drift(t);
      const target = p.inside ? beamTarget(p.u) * 0.75 + idle * 0.25 : idle;
      b = approach(b, target, 0.035, dt);
      px = approach(px, p.x, 0.16, dt);
      py = approach(py, p.y, 0.16, dt);
      g = approach(g, p.inside ? 1 : 0, 0.06, dt);
      set(b, px, py, g);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, animate, visible]);

  const onPointer = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const p = ptr.current;
    p.x = e.clientX - r.left;
    p.y = e.clientY - r.top;
    p.u = r.width ? p.x / r.width : 0.5;
    p.inside = e.type !== 'pointerleave';
  };

  const hop = (e) => {
    if (reduceMotion) return;
    const el = e.currentTarget;
    el.classList.remove('is-hop');
    void el.offsetWidth;
    el.classList.add('is-hop');
  };

  const handleAction = (item) => {
    onLinkClick?.(item.label, item.href);
    if (item.tab) {
      onNavigate?.(item.tab);
      return;
    }
    if (item.action === 'new-poll') {
      onNewPoll?.();
      return;
    }
    if (item.action === 'scroll-top') {
      onScrollTop?.();
      return;
    }
    if (item.action) {
      onNavigate?.(item.action);
    }
  };

  const vars = {
    '--bwf-bg': background,
    '--bwf-bg-rgb': hexToRgb(background, '11, 24, 66'),
    '--bwf-ink': ink,
    '--bwf-ink-rgb': hexToRgb(ink, '244, 245, 250'),
    '--bwf-muted': muted,
    '--bwf-acc': hexToRgb(accent, '1, 146, 198'),
    '--bwf-lit': hexToRgb(citrus, '241, 255, 98'),
    '--bwf-citrus': citrus,
    '--bwf-citrus-rgb': hexToRgb(citrus, '241, 255, 98'),
    '--bwf-wt': wordTop,
    '--bwf-wf': wordFoot,
    '--bwf-sans': fontSans,
    '--bwf-ww': String(wordWeight),
    '--bwf-ang': '118deg',
    '--bwf-b': '58%',
    '--bwf-px': '50%',
    '--bwf-py': '50%',
    '--bwf-g': '0',
    '--bwf-top': '0px',
    '--bwf-bot': '100%',
  };

  let d = 0;
  const delay = () => ({ '--bwf-d': (d += 70) + 'ms' });

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <footer
        ref={rootRef}
        className={'bwf ' + className}
        style={vars}
        data-in={seen || reduceMotion ? 'true' : 'false'}
        onPointerMove={onPointer}
        onPointerEnter={onPointer}
        onPointerLeave={onPointer}
      >
        <div className="bwf-rule" aria-hidden="true" />
        <div className="bwf-sky" aria-hidden="true">
          <div className="bwf-wash" />
          <div className="bwf-bands" />
          <div className="bwf-beam" />
          <div className="bwf-glow" />
          <div className="bwf-grain" />
        </div>

        <div className="bwf-inner">
          <div className="bwf-col">
            <p className="bwf-label" style={delay()}>
              © {year} {company ?? brand}
            </p>
            {socials.length > 0 && (
              <ul className="bwf-socials">
                {socials.map((s, i) => (
                  <li key={s.label + i} className="bwf-fade" style={delay()}>
                    <button
                      type="button"
                      className="bwf-soc"
                      aria-label={s.label}
                      onClick={() => handleAction(s)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        {typeof s.icon === 'string' && QUICK_ICONS[s.icon] ? QUICK_ICONS[s.icon] : s.icon}
                      </svg>
                      <span className="bwf-tip" aria-hidden="true">
                        {s.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {credits.length > 0 && (
              <div className="bwf-credits">
                {credits.map((c, i) => (
                  <p key={i} className="bwf-fade" style={delay()}>
                    {c.lead}
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noreferrer">
                        {c.label}
                      </a>
                    ) : (
                      <b>{c.label}</b>
                    )}
                    {c.tail}
                  </p>
                ))}
              </div>
            )}
          </div>

          {columns.map((col, ci) => (
            <nav key={col.title + ci} className="bwf-col" aria-label={col.title}>
              <p className="bwf-label" style={delay()}>
                {col.title}
              </p>
              <ul className="bwf-links">
                {col.links.map((l, li) => (
                  <li key={l.label + li} className="bwf-fade" style={delay()}>
                    <button type="button" className="bwf-link" onClick={() => handleAction(l)}>
                      <span className="bwf-link-t">{l.label}</span>
                      <Arrow />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div
          ref={wordRef}
          className="bwf-word"
          style={{ height: size ? wordHeight(size, base, cut) : 'calc(' + (0.8 + cut) * 18 + 'cqw)' }}
        >
          <p className="sr-only">{word}</p>
          <div className="bwf-word-box">
            <div ref={innerRef} className="bwf-word-in" aria-hidden="true">
              {letters.map((ch, i) => (
                <span key={i} className="bwf-lw" style={{ '--bwf-d': 260 + i * 55 + 'ms' }}>
                  <span
                    className="bwf-l"
                    onClick={hop}
                    onAnimationEnd={(e) => e.currentTarget.classList.remove('is-hop')}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="bwf-foot" aria-hidden="true" />
        </div>
      </footer>
    </motion.div>
  );
}
