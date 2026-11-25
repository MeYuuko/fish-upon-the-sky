import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/* Frosted Folder Lookbook — ported from 21st.dev to Fish Upon The Sky's MP174 palette
   with controlled open state, Framer Motion entrance, and interactive sheet reader. */

const ASPECT = 0.75;
const SPINE = 0.07;
const HINT_H = 28;
const PRINT_RATIO = 1.36;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const PAPER = [
  { dx: 0.05, dy: -0.04, w: 0.9, h: 0.955, r: -1.6 },
  { dx: 0.062, dy: 0.004, w: 0.94, h: 0.93, r: 1.1 },
  { dx: 0.055, dy: 0.036, w: 0.86, h: 0.96, r: -0.5 },
];

const STACK = [
  { dx: -0.02, r: -2.2 },
  { dx: 0.025, r: 1.4 },
  { dx: -0.01, r: -0.8 },
  { dx: 0.015, r: 0.6 },
];

const SPREAD_R = [-3, 1.6, -1.4, 2.8];

function layoutFor(W, H, n) {
  const compact = W < 700;
  const g = compact ? 16 : W < 1100 ? 40 : 56;
  const vp = compact ? 18 : 28;
  const cy = (H - vp - HINT_H) / 2;
  const areaH = cy * 2 - vp * 2;
  const fh = Math.max(
    120,
    Math.round(
      compact
        ? Math.min(areaH / 1.14, (W - g * 2) / 1.1 / ASPECT)
        : Math.min(areaH / 1.3, H * 0.66, (W / 2 - g) / 1.23 / ASPECT),
    ),
  );
  const fw = Math.round(fh * ASPECT);
  const closed = { x: W / 2 - fw / 2, y: cy - fh / 2 };
  const cols = compact ? 2 : Math.max(1, n);
  const rows = Math.ceil(Math.max(1, n) / cols);
  const gap = Math.max(12, Math.round(fw * 0.06));
  const turn = Math.sin(((compact ? 1.5 : 3) * Math.PI) / 180) * (PRINT_RATIO / 2);
  const pw = Math.floor(
    Math.min(
      (W - g * 2 - gap * (cols - 1)) / (cols + turn * 2),
      fw * 0.66,
      compact ? (fh * 1.1 - gap * (rows - 1)) / rows / PRINT_RATIO : fw,
    ),
  );
  const ph = Math.round(pw * PRINT_RATIO);
  const cards = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const inRow = Math.min(cols, n - r * cols);
    cards.push({
      x: W / 2 + (c - (inRow - 1) / 2) * (pw + gap),
      y: cy + (r - (rows - 1) / 2) * (ph + gap),
      r: compact ? SPREAD_R[i % 4] * 0.5 : SPREAD_R[i % 4],
    });
  }
  const bcW = fw * (compact ? 0.24 : 0.27);
  const jaw = { x: closed.x + fw - (bcW * 8) / 120, y: closed.y + fh * 0.415 };
  const hintTop = H - vp - HINT_H;
  const rest = compact
    ? { x: W / 2 + fw * 0.3, y: closed.y + fh + (hintTop - closed.y - fh) * 0.52, r: -16 }
    : { x: jaw.x + fw * 0.43 + bcW * 0.92, y: closed.y + fh * 0.97, r: 18 };
  const via = compact
    ? { x: jaw.x + bcW * 0.55, y: jaw.y + (rest.y - jaw.y) * 0.35 }
    : { x: jaw.x + (rest.x - jaw.x) * 0.85, y: jaw.y };
  return { W, H, compact, g, vp, cy, fw, fh, closed, pw, ph, gap, cards, n, bcW, jaw, rest, via };
}

function restState(n, open) {
  const v = open ? 1 : 0;
  return {
    cover: v,
    vc: 0,
    clip: v,
    vk: 0,
    prints: Array.from({ length: n }, () => v),
    vp: Array.from({ length: n }, () => 0),
  };
}

function step(S, open, ms) {
  const n = S.prints.length;
  let left = Math.min(ms, 100) / 1000;
  while (left > 1e-6) {
    const dt = Math.min(left, 0.008);
    left -= dt;
    const clipTo = open || S.cover > 0.02 ? 1 : 0;
    S.vk += ((clipTo - S.clip) * 110 - S.vk * 19) * dt;
    S.clip += S.vk * dt;

    let home = true;
    for (let i = 0; i < n; i++) if (S.prints[i] > 0.06) home = false;
    const coverTo = open ? (S.clip > 0.4 || S.cover > 0.001 ? 1.07 : -0.07) : home ? -0.07 : 1.07;
    S.vc += ((coverTo - S.cover) * 22 - S.vc * 5.4) * dt;
    S.cover += S.vc * dt;
    if (S.cover > 1) {
      S.cover = 1;
      S.vc = S.vc > 0.3 ? -S.vc * 0.3 : 0;
    } else if (S.cover < 0) {
      S.cover = 0;
      S.vc = S.vc < -0.3 ? -S.vc * 0.24 : 0;
    }

    for (let i = 0; i < n; i++) {
      const p = S.prints[i];
      const to = open
        ? (S.cover > 0.56 && (i === n - 1 || S.prints[i + 1] > 0.2)) || p > 0.02
          ? 1
          : 0
        : i === 0 || S.prints[i - 1] < 0.8 || p < 0.98
          ? 0
          : 1;
      S.vp[i] += ((to - p) * 90 - S.vp[i] * 15.5) * dt;
      S.prints[i] = p + S.vp[i] * dt;
    }
  }
  const goal = open ? 1 : 0;
  let still = Math.abs(S.clip - goal) < 0.002 && Math.abs(S.vk) < 0.02 && S.cover === goal && S.vc === 0;
  for (let i = 0; i < n; i++) {
    if (Math.abs(S.prints[i] - goal) > 0.002 || Math.abs(S.vp[i]) > 0.02) still = false;
  }
  if (still) {
    S.clip = goal;
    S.vk = 0;
    for (let i = 0; i < n; i++) {
      S.prints[i] = goal;
      S.vp[i] = 0;
    }
  }
  return still;
}

function pose(L, S, lift) {
  const angle = clamp01(S.cover) * 180;
  const cos = Math.cos((angle * Math.PI) / 180);
  const leftEdge = L.compact ? 0 : Math.min(0, SPINE * L.fw + (1 - SPINE) * L.fw * cos);
  const bx = L.W / 2 - (leftEdge + L.fw) / 2;
  const by = L.closed.y;
  const prints = [];
  for (let i = 0; i < L.n; i++) {
    const k = STACK[i % 4];
    const p = S.prints[i];
    const pc = clamp01(p);
    const hx = bx + L.fw * (0.535 + k.dx);
    const hy =
      by + L.fh * (0.04 + i * 0.012) + L.ph / 2 - lift * (1 - clamp01(S.cover * 6)) * (0.06 + 0.012 * i) * L.fh;
    const c = L.cards[i];
    const swing = Math.max(-5, Math.min(5, S.vp[i] * 1.5)) * (c.x < hx ? 1 : -1);
    prints.push({
      x: hx + (c.x - hx) * p,
      y: hy + (c.y - hy) * p,
      r: k.r + (c.r - k.r) * p + swing * Math.sin(pc * Math.PI),
      p,
    });
  }
  const u = Math.max(0, Math.min(1.02, S.clip));
  const jx = (1 - u) * (1 - u) * L.jaw.x + 2 * (1 - u) * u * L.via.x + u * u * L.rest.x;
  const jy = (1 - u) * (1 - u) * L.jaw.y + 2 * (1 - u) * u * L.via.y + u * u * L.rest.y;
  return {
    bx,
    by,
    angle,
    front: angle < 90,
    flash: Math.sin((angle * Math.PI) / 180) * 0.2,
    clip: { x: jx, y: jy, r: L.rest.r * u },
    prints,
  };
}

function FolderIcon({ name, size = 16 }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  };
  if (name === 'close') {
    return (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  }
  if (name === 'prev') {
    return (
      <svg {...common}>
        <path d="m15 6-6 6 6 6" />
      </svg>
    );
  }
  if (name === 'next') {
    return (
      <svg {...common}>
        <path d="m9 6 6 6-6 6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
    </svg>
  );
}

export function FolderSheetArt({ art = 'sunrise', label = '', coverLines = [] }) {
  const lines = coverLines.filter(Boolean);
  const isLight = art === 'days';

  return (
    <div className={`ffl-art ffl-art-${art}`} aria-hidden="true">
      <svg className="ffl-art-svg" viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice">
        {art === 'sunrise' && (
          <>
            <rect width="120" height="160" fill="#112358" />
            <circle cx="60" cy="112" r="46" fill="#004499" />
            <path d="M24 112a36 36 0 0 1 72 0Z" fill="#F1FF62" />
            <rect y="112" width="120" height="48" fill="#0192C6" />
            <rect x="18" y="122" width="84" height="3" rx="1.5" fill="#D4EAFF" />
            <rect x="30" y="132" width="60" height="3" rx="1.5" fill="#D4EAFF" />
          </>
        )}
        {art === 'lamp' && (
          <>
            <rect width="120" height="160" fill="#0B1842" />
            <circle cx="84" cy="100" r="36" fill="#183276" />
            <circle cx="84" cy="100" r="17" fill="#F1FF62" fillOpacity="0.92" />
            <rect x="14" y="126" width="68" height="11" rx="2" fill="#0192C6" />
            <rect x="20" y="114" width="56" height="11" rx="2" fill="#D4EAFF" />
            <rect x="16" y="102" width="46" height="11" rx="2" fill="#F1FF62" />
            <rect y="137" width="120" height="23" fill="#004499" />
          </>
        )}
        {art === 'path' && (
          <>
            <rect width="120" height="160" fill="#004499" />
            <circle cx="96" cy="36" r="9" fill="#F1FF62" />
            <path
              d="M110 160c-12-18-40-18-36-34s28-14 16-30-54-8-60-22"
              fill="none"
              stroke="#0192C6"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <g fill="#D4EAFF">
              <circle cx="94" cy="146" r="2" />
              <circle cx="76" cy="132" r="2" />
              <circle cx="86" cy="112" r="2" />
              <circle cx="70" cy="98" r="2" />
              <circle cx="48" cy="90" r="2" />
            </g>
          </>
        )}
        {art === 'days' && (
          <>
            <rect width="120" height="160" fill="#D4EAFF" />
            {Array.from({ length: 20 }, (_, index) => {
              const cx = 24 + (index % 5) * 18;
              const cy = 92 + Math.floor(index / 5) * 14;
              const marked = index === 12;
              return (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={marked ? 6 : 4}
                  fill={marked ? '#0192C6' : '#8EC2F0'}
                />
              );
            })}
          </>
        )}
      </svg>

      <div className={`ffl-art-copy${isLight ? ' is-light' : ''}`}>
        {label ? <span className="ffl-art-kicker">{label}</span> : null}
        {lines.length > 0 && (
          <strong className="ffl-art-lines">
            {lines.map((line, idx) => (
              <span key={`${line}-${idx}`}>{line}</span>
            ))}
          </strong>
        )}
      </div>
    </div>
  );
}

export function FrostedFolderLookbook({
  id,
  title = 'HỒ SƠ 01',
  subtitle = 'Góc yêu thích & Kỷ niệm',
  line = 'FISH UPON THE SKY · 2026',
  footer = 'Lưu trữ nội bộ',
  wordmark = 'FISH',
  sheets = [],
  openLabel = 'Mở hồ sơ cá nhân',
  closeLabel = 'Đóng hồ sơ lại',
  tint = '#0192C6',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  isOwner = false,
  onEditSheet,
  height = 'min(80svh, 660px)',
  className = '',
}) {
  const reduceMotion = useReducedMotion();
  const list = useMemo(() => sheets.slice(0, 4), [sheets]);
  const n = list.length;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? Boolean(controlledOpen) : uncontrolledOpen;
  const [L, setL] = useState(null);
  const [readerIdx, setReaderIdx] = useState(null);

  const rootRef = useRef(null);
  const shellRef = useRef(null);
  const coverRef = useRef(null);
  const faceRef = useRef(null);
  const bclipRef = useRef(null);
  const sheetRefs = useRef([]);
  const gradRef = useRef(null);
  const lightRef = useRef(null);
  const glossRef = useRef(null);
  const m = useRef({
    L: null,
    S: restState(n, open),
    open,
    raf: 0,
    last: 0,
    reduced: false,
    mx: 0,
    my: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    hover: 0,
    lift: 0,
    vl: 0,
  });

  const paint = useCallback(() => {
    const s = m.current;
    const lay = s.L;
    const shell = shellRef.current;
    const cover = coverRef.current;
    if (!lay || !shell || !cover) return;
    const P = pose(lay, s.S, s.lift);
    const amp = 10 - 7.5 * (P.angle / 180);
    shell.style.transformOrigin = `${(lay.W / 2 - P.bx).toFixed(1)}px ${(lay.cy - P.by).toFixed(1)}px`;
    shell.style.transform = `translate3d(${P.bx.toFixed(2)}px,${P.by.toFixed(2)}px,0) rotateX(${(-s.ty * amp).toFixed(3)}deg) rotateY(${(s.tx * amp).toFixed(3)}deg)`;
    shell.style.setProperty('--ffl-lx', `${(50 + s.tx * 40).toFixed(1)}%`);
    shell.style.setProperty('--ffl-ly', `${(38 + s.ty * 34).toFixed(1)}%`);
    shell.style.setProperty('--ffl-fl', P.flash.toFixed(3));
    cover.style.transform = `rotateY(${(-P.angle).toFixed(2)}deg)`;
    if (faceRef.current) faceRef.current.style.opacity = P.front ? '1' : '0';

    for (let i = 0; i < P.prints.length; i++) {
      const el = sheetRefs.current[i];
      if (!el) continue;
      const q = P.prints[i];
      const deep = (1 - Math.max(0, Math.min(1, q.p))) * lay.fw * 0.007 * (1 + i * 0.2);
      el.style.transform = `translate3d(${(q.x - lay.pw / 2 - P.bx - s.tx * deep).toFixed(2)}px,${(q.y - lay.ph / 2 - P.by - s.ty * deep).toFixed(2)}px,0) rotate(${q.r.toFixed(3)}deg)`;
      el.style.zIndex = P.front ? '2' : '6';
    }

    const bc = bclipRef.current;
    if (bc) {
      bc.style.transform = `translate3d(${(P.clip.x - lay.jaw.x - (P.bx - lay.closed.x)).toFixed(2)}px,${(P.clip.y - lay.jaw.y).toFixed(2)}px,0) rotate(${P.clip.r.toFixed(2)}deg)`;
    }
    if (gradRef.current) {
      gradRef.current.setAttribute(
        'gradientTransform',
        `rotate(${(18 + s.tx * 50 + s.ty * 24).toFixed(1)} .5 .5)`,
      );
    }
    if (lightRef.current) lightRef.current.setAttribute('azimuth', (235 + s.tx * 70).toFixed(1));
    if (glossRef.current) glossRef.current.setAttribute('x', (86 + s.tx * 9).toFixed(1));
  }, []);

  const kick = useCallback(() => {
    const s = m.current;
    if (s.raf) return;
    s.last = 0;
    const tick = () => {
      const now = performance.now();
      const dt = s.last ? Math.min(100, now - s.last) : 16;
      s.last = now;
      let still = true;
      if (s.reduced) {
        s.S = restState(s.S.prints.length, s.open);
        s.tx = s.ty = s.vx = s.vy = s.lift = s.vl = 0;
      } else {
        still = step(s.S, s.open, dt);
        let left = dt / 1000;
        while (left > 1e-6) {
          const h = Math.min(left, 0.008);
          left -= h;
          s.vx += ((s.mx - s.tx) * 70 - s.vx * 11.5) * h;
          s.tx += s.vx * h;
          s.vy += ((s.my - s.ty) * 70 - s.vy * 11.5) * h;
          s.ty += s.vy * h;
          s.vl += ((s.hover - s.lift) * 150 - s.vl * 14) * h;
          s.lift += s.vl * h;
        }
        if (
          Math.abs(s.mx - s.tx) > 0.002 ||
          Math.abs(s.my - s.ty) > 0.002 ||
          Math.abs(s.vx) > 0.01 ||
          Math.abs(s.vy) > 0.01
        ) {
          still = false;
        }
        if (Math.abs(s.hover - s.lift) > 0.003 || Math.abs(s.vl) > 0.01) still = false;
      }
      paint();
      s.raf = still ? 0 : requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
  }, [paint]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    m.current.reduced = mq.matches;
    const onMq = () => {
      m.current.reduced = mq.matches;
      kick();
    };
    mq.addEventListener('change', onMq);
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      if (r.width < 10 || r.height < 10) return;
      const lay = layoutFor(r.width, r.height, n);
      m.current.L = lay;
      if (m.current.S.prints.length !== n) m.current.S = restState(n, m.current.open);
      setL(lay);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', onMq);
      cancelAnimationFrame(m.current.raf);
      m.current.raf = 0;
    };
  }, [n, kick]);

  useEffect(() => {
    if (m.current.open !== open) {
      m.current.open = open;
      if (open) m.current.hover = 0;
      else setReaderIdx(null);
      kick();
    }
  }, [open, kick]);

  useLayoutEffect(() => {
    paint();
  }, [L, paint]);

  const toggle = useCallback(
    (next) => {
      const to = next === undefined ? !m.current.open : next;
      if (to === m.current.open) return;
      m.current.open = to;
      if (to) m.current.hover = 0;
      else setReaderIdx(null);
      if (!isControlled) setUncontrolledOpen(to);
      onOpenChange?.(to);
      kick();
    },
    [isControlled, kick, onOpenChange],
  );

  useEffect(() => {
    if (!open && readerIdx === null) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (readerIdx !== null) {
        setReaderIdx(null);
      } else if (open) {
        toggle(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, readerIdx, toggle]);

  const onPointerMove = (e) => {
    const s = m.current;
    if (e.pointerType !== 'mouse' || s.reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    s.mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    s.my = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    kick();
  };
  const onPointerLeave = () => {
    const s = m.current;
    s.mx = s.my = 0;
    s.hover = 0;
    kick();
  };
  const onHover = (v) => (e) => {
    const s = m.current;
    if (e.pointerType !== 'mouse' || s.reduced) return;
    s.hover = s.open ? 0 : v;
    kick();
  };

  const fw = L ? L.fw : 0;
  const fh = L ? L.fh : 0;
  const pw = L ? L.pw : 0;
  const vars = {
    '--ffl-tint': tint,
    '--ffl-t': `${(L ? Math.max(11, Math.min(19, fw * 0.031)) : 12).toFixed(2)}px`,
    '--ffl-s': `${(L ? Math.max(7, Math.min(10.5, fw * 0.0165)) : 8).toFixed(2)}px`,
    '--ffl-c': `${(L ? Math.max(9.5, Math.min(12.5, pw * 0.055)) : 11).toFixed(2)}px`,
    '--ffl-m': `${L ? Math.max(6, Math.round(pw * 0.05)) : 8}px`,
    '--ffl-lx': '50%',
    '--ffl-ly': '38%',
    '--ffl-fl': '0',
  };
  const pcH = fh * 0.17;
  const bcW = L ? L.bcW : 0;

  const activeSheet = readerIdx !== null && list[readerIdx] ? list[readerIdx] : null;
  const readerPortalTarget = typeof document !== 'undefined' ? document.querySelector('.app-shell') || document.body : null;

  return (
    <motion.section
      id={id}
      ref={rootRef}
      aria-label="Hồ sơ cá nhân thành viên"
      className={`ffl-root${open ? ' ffl-open' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...vars, height, minHeight: height }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="ffl-glow" aria-hidden="true" />
      <div className="ffl-rig" style={{ visibility: L ? 'visible' : 'hidden' }}>
        <div
          ref={shellRef}
          className="ffl-shell"
          style={{ width: fw, height: fh }}
          onClick={() => toggle()}
          onPointerEnter={onHover(1)}
          onPointerLeave={onHover(0)}
        >
          <div className="ffl-back" aria-hidden="true" />
          {L && !L.compact ? <div className="ffl-tab" aria-hidden="true" /> : null}
          {PAPER.map((k, i) => (
            <div
              key={i}
              className={`ffl-paper${i === PAPER.length - 1 ? ' ffl-ruled' : ''}`}
              aria-hidden="true"
              style={{
                left: `${((0.5 + k.dx - k.w / 2) * 100).toFixed(2)}%`,
                top: `${((0.5 + k.dy - k.h / 2) * 100).toFixed(2)}%`,
                width: `${(k.w * 100).toFixed(2)}%`,
                height: `${(k.h * 100).toFixed(2)}%`,
                transform: `rotate(${k.r}deg)`,
              }}
            />
          ))}
          {list.map((sh, i) => (
            <div
              key={sh.id || i}
              ref={(el) => {
                sheetRefs.current[i] = el;
              }}
              className="ffl-sheet"
              style={{ width: pw, height: L ? L.ph : 0 }}
              role="button"
              tabIndex={open ? 0 : -1}
              aria-label={`${sh.code ? `${sh.code}: ` : ''}${sh.title}`}
              aria-hidden={!open}
              onClick={(e) => {
                if (!m.current.open) return;
                e.stopPropagation();
                setReaderIdx(i);
              }}
              onKeyDown={(e) => {
                if (m.current.open && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  e.stopPropagation();
                  setReaderIdx(i);
                }
              }}
            >
              <div className="ffl-in">
                <div className="ffl-photo">
                  {sh.image ? (
                    <img
                      src={sh.image}
                      alt={sh.alt || sh.title}
                      width={502}
                      height={759}
                      decoding="async"
                      draggable={false}
                      style={{ maxWidth: 'none' }}
                    />
                  ) : (
                    <FolderSheetArt art={sh.art} label={sh.label} coverLines={sh.coverLines} />
                  )}
                </div>
                <div className="ffl-cap">
                  <span className="ffl-name">{sh.title}</span>
                  {sh.code ? <span className="ffl-code">{sh.code}</span> : <span />}
                  {sh.detail ? <span className="ffl-det">{sh.detail}</span> : null}
                </div>
              </div>
            </div>
          ))}
          <div ref={coverRef} className="ffl-cover" style={{ left: `${SPINE * 100}%`, transformOrigin: '0 50%' }}>
            <div className="ffl-sheen" aria-hidden="true" />
            <div ref={faceRef} className="ffl-face">
              <div className="ffl-head">
                <h2 className="ffl-title">{title}</h2>
                {subtitle ? <p>{subtitle}</p> : null}
                {line ? <p>{line}</p> : null}
              </div>
              <div className="ffl-foot">
                {footer ? <p>{footer}</p> : <span />}
                {wordmark ? (
                  <svg className="ffl-mark" viewBox="0 0 300 84" role="img" aria-label={wordmark}>
                    <defs>
                      <linearGradient id={`${uid}c`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#F4F5FA" />
                        <stop offset=".42" stopColor="#D4EAFF" />
                        <stop offset=".56" stopColor="#F1FF62" />
                        <stop offset="1" stopColor="#0192C6" />
                      </linearGradient>
                      <filter
                        id={`${uid}f`}
                        x="-8%"
                        y="-30%"
                        width="116%"
                        height="160%"
                        colorInterpolationFilters="sRGB"
                      >
                        <feTurbulence type="fractalNoise" baseFrequency="0.016 0.03" numOctaves="2" seed="4" result="n" />
                        <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="d" />
                        <feGaussianBlur in="d" stdDeviation="1.3" result="b" />
                        <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -6" result="goo" />
                        <feGaussianBlur in="goo" stdDeviation="1.4" result="h" />
                        <feSpecularLighting
                          in="h"
                          surfaceScale="4"
                          specularConstant="1.2"
                          specularExponent="18"
                          lightingColor="#ffffff"
                          result="s"
                        >
                          <feDistantLight ref={lightRef} azimuth="235" elevation="44" />
                        </feSpecularLighting>
                        <feComposite in="s" in2="goo" operator="in" result="sp" />
                        <feComposite in="goo" in2="sp" operator="arithmetic" k1="0" k2="0.78" k3="0.7" k4="0" />
                      </filter>
                    </defs>
                    <text
                      x="150"
                      y="60"
                      textAnchor="middle"
                      textLength="260"
                      lengthAdjust="spacingAndGlyphs"
                      fontFamily="'DL Calvera','Arial Black',Impact,sans-serif"
                      fontWeight="900"
                      fontStyle="italic"
                      fontSize="58"
                      fill="none"
                      stroke={`url(#${uid}c)`}
                      strokeWidth="4.4"
                      strokeLinejoin="round"
                      filter={`url(#${uid}f)`}
                    >
                      {wordmark}
                    </text>
                  </svg>
                ) : null}
              </div>
              <svg
                className="ffl-pclip"
                viewBox="0 0 24 94"
                width={pcH * (24 / 94)}
                height={pcH}
                style={{ top: -pcH * 0.13 }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient ref={gradRef} id={`${uid}p`} x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate(18 .5 .5)">
                    <stop offset="0" stopColor="#8fa1a6" />
                    <stop offset=".3" stopColor="#f6fbfc" />
                    <stop offset=".5" stopColor="#7c8d92" />
                    <stop offset=".72" stopColor="#eef6f7" />
                    <stop offset="1" stopColor="#6d7d82" />
                  </linearGradient>
                </defs>
                <path
                  d="M9 26V72a4.5 4.5 0 0 0 9 0V12a8 8 0 0 0-16 0V80a10 10 0 0 0 20 0V30"
                  fill="none"
                  stroke={`url(#${uid}p)`}
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="ffl-spine" style={{ width: `${SPINE * 100}%` }} aria-hidden="true" />
          <svg
            ref={bclipRef}
            className="ffl-bclip"
            viewBox="0 0 120 64"
            width={bcW}
            height={bcW * (64 / 120)}
            style={{
              marginLeft: fw - bcW * (104 / 120),
              marginTop: fh * 0.415 - bcW * (32 / 120),
              transformOrigin: '80% 50%',
            }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`${uid}w`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f3f8f9" />
                <stop offset=".5" stopColor="#8b9a9f" />
                <stop offset="1" stopColor="#dfe9eb" />
              </linearGradient>
              <linearGradient id={`${uid}b`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#112358" />
                <stop offset=".35" stopColor="#091436" />
                <stop offset="1" stopColor="#004499" />
              </linearGradient>
              <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <stop offset=".5" stopColor="#ffffff" stopOpacity=".5" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <clipPath id={`${uid}k`}>
                <path d="M76 5h30a5 5 0 0 1 5 5v44a5 5 0 0 1-5 5H76z" />
              </clipPath>
            </defs>
            <path
              d="M80 15C60 19 46 27 31 23.5a9 9 0 1 0 0 17C46 37 60 45 80 49"
              fill="none"
              stroke={`url(#${uid}w)`}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path d="M76 5h30a5 5 0 0 1 5 5v44a5 5 0 0 1-5 5H76z" fill={`url(#${uid}b)`} />
            <g clipPath={`url(#${uid}k)`}>
              <rect ref={glossRef} x="86" y="5" width="9" height="54" fill={`url(#${uid}g)`} />
            </g>
            <path d="M76 5v54" stroke="#0192C6" strokeWidth="1.4" />
          </svg>
        </div>
      </div>

      <button
        type="button"
        className="ffl-hint"
        style={{ bottom: L ? L.vp : 18, height: HINT_H }}
        aria-expanded={open}
        onClick={() => toggle()}
      >
        <i aria-hidden="true" />
        <span>{open ? closeLabel : openLabel}</span>
      </button>

      {readerPortalTarget &&
        createPortal(
          <AnimatePresence>
            {activeSheet && (
              <motion.div
                className="ffl-reader-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setReaderIdx(null);
                }}
              >
                <motion.div
                  className="ffl-reader-card"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="ffl-reader-title"
                  initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="ffl-reader-visual">
                    {activeSheet.image ? (
                      <img src={activeSheet.image} alt={activeSheet.alt || activeSheet.title} />
                    ) : (
                      <FolderSheetArt
                        art={activeSheet.art}
                        label={activeSheet.label}
                        coverLines={activeSheet.coverLines}
                      />
                    )}
                  </div>

                  <div className="ffl-reader-body">
                    <div className="ffl-reader-top">
                      <div>
                        <span className="ffl-reader-code">
                          {activeSheet.code || `0${readerIdx + 1}`} · {activeSheet.label}
                        </span>
                        <h3 id="ffl-reader-title">{activeSheet.title}</h3>
                      </div>
                      <button
                        type="button"
                        className="ffl-reader-close"
                        onClick={() => setReaderIdx(null)}
                        aria-label="Đóng chi tiết"
                      >
                        <FolderIcon name="close" size={18} />
                      </button>
                    </div>

                    {Array.isArray(activeSheet.topics) && activeSheet.topics.length > 0 && (
                      <div className="ffl-reader-topics">
                        {activeSheet.topics.map((topic) => (
                          <span key={topic}>{topic}</span>
                        ))}
                      </div>
                    )}

                    <p className="ffl-reader-text">
                      {activeSheet.fullText || 'Chủ hồ sơ chưa viết nội dung chi tiết cho tờ này.'}
                    </p>

                    <div className="ffl-reader-foot">
                      <div className="ffl-reader-nav">
                        <button
                          type="button"
                          onClick={() => setReaderIdx((readerIdx - 1 + list.length) % list.length)}
                          aria-label="Tờ trước"
                        >
                          <FolderIcon name="prev" size={16} />
                        </button>
                        <span>
                          0{readerIdx + 1} / 0{list.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setReaderIdx((readerIdx + 1) % list.length)}
                          aria-label="Tờ tiếp theo"
                        >
                          <FolderIcon name="next" size={16} />
                        </button>
                      </div>

                      {isOwner && onEditSheet && (
                        <button
                          type="button"
                          className="button button-primary ffl-reader-edit"
                          onClick={() => {
                            const idx = readerIdx;
                            setReaderIdx(null);
                            onEditSheet(idx);
                          }}
                        >
                          <FolderIcon name="edit" size={14} />
                          <span>Sửa tờ này</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          readerPortalTarget,
        )}
    </motion.section>
  );
}

export default FrostedFolderLookbook;
