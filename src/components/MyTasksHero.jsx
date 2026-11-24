import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

const DEFAULT_WAVE = { expandDuration: 0.8, contractDuration: 0.55, expandDelay: 0.12, feather: 110, bandStrength: 0.14 };
const DEFAULT_PULSES = { share: 1, length: 64, minDuration: 6, maxDuration: 11, startAfter: 1.4, opacity: 0.85 };
const DEFAULT_AUTOPLAY = { verifyAfter: 2.2, cycleAfter: 4.2, cycleEvery: 2.8 };

const DEFAULT_ENTRANCE = {
  eyebrow: 0.08,
  headline: 0.14,
  headlineStep: 0.08,
  grid: 0.3,
  toggle: 0.36,
  sideCards: 0.48,
  copy: 0.56,
  decor: 0.62,
  trust: 0.78,
  hint: 1.25,
};

const DEFAULT_FLOAT = {
  stats: { x: -510, y: 44 },
  certificate: { x: 325, y: 92 },
  arcLeft: { x: -328, y: 106 },
  arcRight: { x: 312, y: 248 },
};

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 170, damping: 19 };
const FLIP = { duration: 0.65, ease: [0.65, 0, 0.35, 1] };
const KNOB_TRAVEL = 0.91;
const LIGHT_REST = { x: 34, y: 22 };

const HeroConfigContext = createContext(null);
const VerificationContext = createContext(null);

function useHeroConfig() {
  const ctx = useContext(HeroConfigContext);
  if (!ctx) throw new Error('MyTasksHero parts must be used inside HeroConfigContext');
  return ctx;
}

function useVerification() {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error('useVerification must be used inside VerificationProvider');
  return ctx;
}

function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function TaskIcon({ name, className = '' }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
  if (name === 'arrowUpRight') return <svg {...common}><path d="M7 17 17 7M7 7h10v10" /></svg>;
  if (name === 'calendar') return <svg {...common}><rect x="3.5" y="5" width="17" height="16" rx="3" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01" /></svg>;
  if (name === 'link') return <svg {...common}><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></svg>;
  if (name === 'spark') return <svg {...common}><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></svg>;
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
  if (name === 'lock') return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
  if (name === 'x') return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === 'shield') return <svg {...common}><path d="M12 3 5 6v6c0 4.5 3 8.4 7 9.5 4-1.1 7-5 7-9.5V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
  return <svg {...common} fill="currentColor" stroke="none"><path d="M7 5.5v13l11-6.5-11-6.5Z" /></svg>;
}

function buildRosette(radius, amplitude, bumps) {
  const steps = bumps * 8;
  const points = Array.from({ length: steps }, (_, i) => {
    const angle = (i / steps) * Math.PI * 2;
    const r = radius + amplitude * Math.cos(bumps * angle);
    return `${(24 + r * Math.cos(angle)).toFixed(2)} ${(24 + r * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join('L')}Z`;
}

const ROSETTE = buildRosette(20.5, 1.6, 12);

function TaskSeal(props) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden {...props}>
      <path d={ROSETTE} />
    </svg>
  );
}

function TaskTick({ drawn, delay = 0, ...props }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden {...props}>
      <motion.path
        d="M15.5 24.5l5.8 5.8L33 18.5"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
        transition={{
          pathLength: { duration: drawn ? 0.42 : 0.2, delay: drawn ? delay : 0, ease: [0.65, 0, 0.35, 1] },
          opacity: { duration: 0.12, delay: drawn ? delay : 0.12 },
        }}
      />
    </svg>
  );
}

const C = 80;
function buildBlob() {
  const drips = [
    { at: 0.7, size: 4.5, width: 0.22 },
    { at: 2.75, size: 3.4, width: 0.18 },
    { at: 4.95, size: 5.2, width: 0.26 },
  ];
  const points = Array.from({ length: 240 }, (_, i) => {
    const angle = (i / 240) * Math.PI * 2;
    const drip = drips.reduce((sum, { at, size, width }) => {
      const distance = Math.atan2(Math.sin(angle - at), Math.cos(angle - at));
      return sum + size * Math.exp(-(distance * distance) / (2 * width * width));
    }, 0);
    const r = 67 + 1.6 * Math.sin(5 * angle + 1) + 1.1 * Math.sin(9 * angle + 2.4) + 0.7 * Math.sin(14 * angle) + drip;
    return `${(C + r * Math.cos(angle)).toFixed(2)} ${(C + r * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join('L')}Z`;
}

const BLOB = buildBlob();

function arcPath(radius, from, to, sweep) {
  const point = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return `${(C + radius * Math.cos(rad)).toFixed(2)} ${(C + radius * Math.sin(rad)).toFixed(2)}`;
  };
  return `M${point(from)}A${radius} ${radius} 0 0 ${sweep} ${point(to)}`;
}

const TOP_ARC = arcPath(36, 194, 346, 1);
const BOTTOM_ARC = arcPath(44.5, 166, 14, 0);
const TOP_LENGTH = ((36 * 152 * Math.PI) / 180) * 0.97;
const BOTTOM_LENGTH = ((44.5 * 152 * Math.PI) / 180) * 0.97;

const starPoints = (cx, cy, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 ? r * 0.45 : r;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');

function FishWaxSeal({ top, bottom, lightRef, glowRef, active = true, ...props }) {
  const id = useId();
  const ref = (name) => `url(#${id}-${name})`;

  return (
    <svg viewBox="0 0 160 160" fill="none" aria-hidden {...props}>
      <defs>
        <radialGradient ref={glowRef} id={`${id}-wax`} cx="31.6%" cy="26.8%" r="75%">
          <stop offset="0" stopColor="#0192C6" />
          <stop offset="0.48" stopColor="#004499" />
          <stop offset="1" stopColor="#112358" />
        </radialGradient>
        <radialGradient id={`${id}-pool`} cx="60%" cy="62%" r="70%">
          <stop offset="0" stopColor="#004499" />
          <stop offset="1" stopColor="#112358" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-60%" y="-10%" width="220%" height="120%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <clipPath id={`${id}-blob`}>
          <path d={BLOB} />
        </clipPath>
        <path id={`${id}-top`} d={TOP_ARC} />
        <path id={`${id}-bottom`} d={BOTTOM_ARC} />

        <filter id={`${id}-dome`} x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="height" />
          <feSpecularLighting
            in="height"
            surfaceScale="5"
            specularConstant="0.85"
            specularExponent="20"
            lightingColor="#ffffff"
            result="gloss"
          >
            <fePointLight ref={lightRef} x="34" y="22" z="110" />
          </feSpecularLighting>
          <feComposite in="gloss" in2="SourceAlpha" operator="in" result="glossIn" />
          <feComposite in="SourceGraphic" in2="glossIn" operator="arithmetic" k2="1" k3="0.6" result="lit" />
          <feDropShadow in="lit" dx="1.5" dy="3" stdDeviation="2.6" floodColor="#0A173B" floodOpacity="0.45" />
        </filter>

        <filter id={`${id}-press`} x="-10%" y="-10%" width="120%" height="120%">
          <feOffset in="SourceAlpha" dx="1.6" dy="1.8" result="down" />
          <feComposite in="SourceAlpha" in2="down" operator="out" result="topEdge" />
          <feGaussianBlur in="topEdge" stdDeviation="1.2" result="topSoft" />
          <feFlood floodColor="#0A173B" floodOpacity={active ? 0.78 : 0.42} />
          <feComposite in2="topSoft" operator="in" result="shade" />
          <feOffset in="SourceAlpha" dx="-1.2" dy="-1.3" result="up" />
          <feComposite in="SourceAlpha" in2="up" operator="out" result="bottomEdge" />
          <feGaussianBlur in="bottomEdge" stdDeviation="0.8" result="bottomSoft" />
          <feFlood floodColor="#D4EAFF" floodOpacity={active ? 0.7 : 0.35} />
          <feComposite in2="bottomSoft" operator="in" result="catch" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shade" />
            <feMergeNode in="catch" />
          </feMerge>
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>

        <filter id={`${id}-raise`} x="-10%" y="-10%" width="120%" height="120%">
          <feOffset in="SourceAlpha" dx="0.7" dy="0.8" result="down" />
          <feComposite in="SourceAlpha" in2="down" operator="out" result="rim" />
          <feFlood floodColor="#D4EAFF" floodOpacity={active ? 0.9 : 0.4} />
          <feComposite in2="rim" operator="in" result="light" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur" />
          <feOffset in="blur" dx="0.9" dy="1.1" result="drop" />
          <feFlood floodColor="#0A173B" floodOpacity={active ? 0.65 : 0.25} />
          <feComposite in2="drop" operator="in" result="cast" />
          <feMerge>
            <feMergeNode in="cast" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="light" />
          </feMerge>
        </filter>
      </defs>

      <path d={BLOB} fill={ref('wax')} filter={ref('dome')} />
      <circle cx={C} cy={C} r="54" fill={ref('pool')} filter={ref('press')} />

      <g fill="#0192C6" filter={ref('raise')}>
        <circle cx={C} cy={C} r="51" stroke="#0192C6" strokeWidth="2.4" fill="none" />
        <circle cx={C} cy={C} r="26.5" stroke="#0192C6" strokeWidth="2.2" fill="none" />
        <text fontSize="10.2" fontWeight="700">
          <textPath href={`#${id}-top`} startOffset="1.5%" textLength={TOP_LENGTH} lengthAdjust="spacingAndGlyphs">
            {top}
          </textPath>
        </text>
        <text fontSize="9.8" fontWeight="700">
          <textPath href={`#${id}-bottom`} startOffset="1.5%" textLength={BOTTOM_LENGTH} lengthAdjust="spacingAndGlyphs">
            {bottom}
          </textPath>
        </text>
        <polygon points={starPoints(C - 39.5, C, 3.4)} />
        <polygon points={starPoints(C + 39.5, C, 3.4)} />
        <rect x="65" y="65" width="30" height="30" rx="9" />
        <path
          d="M73 80.5 78.5 75l8.5 5.5-8.5 5.5-5.5-5.5Z"
          fill="#F1FF62"
        />
      </g>
      <g clipPath={ref('blob')}>
        <g transform="rotate(24 80 80)">
          <motion.rect
            y="-40"
            width="22"
            height="240"
            fill="#fff"
            opacity="0.38"
            filter={ref('soft')}
            initial={{ x: -120 }}
            animate={{ x: 200 }}
            transition={{ duration: 1.5, ease: [0.45, 0, 0.25, 1], delay: 0.9, repeat: Infinity, repeatDelay: 3.8 }}
          />
        </g>
      </g>
    </svg>
  );
}

const ARC_PATHS = {
  left: { d: 'M2 2C30 4 56 26 58 58', dot: [58, 58] },
  right: { d: 'M58 2C57 30 36 56 4 60', dot: [4, 60] },
};

function ConnectorArc({ side, delay, className = '', style }) {
  const { d, dot } = ARC_PATHS[side];
  return (
    <svg viewBox="0 0 62 64" fill="none" aria-hidden className={className} style={style}>
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.circle
        cx={dot[0]}
        cy={dot[1]}
        r="3.2"
        className="mt-arc-dot"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: delay + 0.55 }}
      />
    </svg>
  );
}

const BARS = [
  { x: 4.5, rest: 4.5, active: 7 },
  { x: 10.5, rest: 7.5, active: 11 },
  { x: 16.5, rest: 10.5, active: 15 },
];
const BAR_BASE = 19.5;

function StatsChartBars({ active, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      {BARS.map((bar, index) => {
        const height = active ? bar.active : bar.rest;
        return (
          <motion.rect
            key={bar.x}
            x={bar.x}
            width="3.2"
            rx="1.6"
            initial={false}
            animate={{ y: BAR_BASE - height, height }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 18,
              delay: active ? 0.12 + index * 0.09 : (BARS.length - 1 - index) * 0.05,
            }}
          />
        );
      })}
    </svg>
  );
}

function HintArrow({ delay, className = '' }) {
  const draw = { duration: 0.55, ease: [0.65, 0, 0.35, 1] };
  return (
    <svg viewBox="0 0 40 26" fill="none" aria-hidden className={className}>
      <motion.path
        d="M2 5.5C13 1.5 27 3.5 34.5 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ ...draw, delay }}
      />
      <motion.path
        d="M28.2 15.4l6.6 2.4 1.1-6.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut', delay: delay + 0.5 }}
      />
    </svg>
  );
}

function VerificationProvider({ children }) {
  const { WAVE, REDUCE } = useHeroConfig();
  const [verified, setVerified] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);

  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const layersRef = useRef(null);
  const geometry = useRef({ x: 0, y: 0, max: 0 });
  const verifiedRef = useRef(false);
  const waveRef = useRef(null);
  const targetsRef = useRef(new Set());
  const paintedRef = useRef('');

  const progress = useMotionValue(REDUCE ? 1 : 0);

  useEffect(() => {
    if (REDUCE) {
      verifiedRef.current = true;
      setVerified(true);
      progress.set(1);
    }
  }, [REDUCE, progress]);

  const paint = useCallback(
    (value) => {
      const layers = layersRef.current;
      if (!layers) return;
      const { x, y, max } = geometry.current;
      const key = `${value}|${x}|${y}|${max}`;
      if (key === paintedRef.current && layers.dataset.state) return;

      paintedRef.current = key;
      const radius = value * max;
      layers.style.setProperty('--mt-wx', `${x}px`);
      layers.style.setProperty('--mt-wy', `${y}px`);
      layers.style.setProperty('--mt-r0', `${Math.max(0, radius - WAVE.feather)}px`);
      layers.style.setProperty('--mt-r1', `${radius}px`);
      layers.style.setProperty('--mt-band-o', `${Math.sin(Math.min(1, value) * Math.PI)}`);
      layers.dataset.state = value >= 1 ? 'clear' : value <= 0 ? 'mono' : 'moving';
    },
    [WAVE.feather],
  );

  const updateWave = useCallback(
    (value, measuredRoot) => {
      const root = rootRef.current;
      const moving = value > 0 && value < 1;
      const { x, y, max } = geometry.current;
      const updates = [];

      if (!moving) targetsRef.current.forEach((target) => { target.centre = undefined; });

      let rootBox = measuredRoot ?? null;
      targetsRef.current.forEach((target) => {
        const el = target.ref.current;
        if (!el || !root) return;
        let reached = value >= 1;
        if (moving) {
          if (!target.centre || measuredRoot) {
            rootBox ??= root.getBoundingClientRect();
            const box = el.getBoundingClientRect();
            target.centre = { x: box.left + box.width / 2 - rootBox.left, y: box.top + box.height / 2 - rootBox.top };
          }
          const distance = Math.hypot(target.centre.x - x, target.centre.y - y);
          reached = value * max - WAVE.feather / 2 >= distance;
        }
        if (reached !== target.reached) updates.push({ target, reached });
      });

      paint(value);
      updates.forEach(({ target, reached }) => {
        target.reached = reached;
        target.notify(reached);
      });
    },
    [paint, WAVE.feather],
  );

  const subscribeReach = useCallback(
    (ref, notify) => {
      const target = { ref, notify };
      targetsRef.current.add(target);
      updateWave(progress.get());
      return () => {
        targetsRef.current.delete(target);
      };
    },
    [progress, updateWave],
  );

  const measure = useCallback(() => {
    const root = rootRef.current;
    const toggleEl = toggleRef.current;
    if (!root || !toggleEl) return;

    const rootBox = root.getBoundingClientRect();
    const box = toggleEl.getBoundingClientRect();
    const x = box.left + box.width / 2 - rootBox.left;
    const y = box.top + box.height / 2 - rootBox.top;

    const farthest = Math.max(
      Math.hypot(x, y),
      Math.hypot(rootBox.width - x, y),
      Math.hypot(x, rootBox.height - y),
      Math.hypot(rootBox.width - x, rootBox.height - y),
    );

    geometry.current = { x, y, max: farthest + WAVE.feather };
    updateWave(progress.get(), rootBox);
  }, [updateWave, progress, WAVE.feather]);

  useMotionValueEvent(progress, 'change', updateWave);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [measure]);

  const settle = useCallback(
    (next) => {
      verifiedRef.current = next;
      setVerified(next);
      setInteracted(true);
      measure();
      waveRef.current?.stop();

      if (REDUCE) {
        progress.set(next ? 1 : 0);
        return;
      }

      const distance = Math.abs((next ? 1 : 0) - progress.get());
      const duration = (next ? WAVE.expandDuration : WAVE.contractDuration) * Math.max(0.3, distance);
      waveRef.current = animate(progress, next ? 1 : 0, {
        duration,
        delay: next && progress.get() === 0 ? WAVE.expandDelay : 0,
        ease: next ? [0.33, 0.05, 0.25, 1] : [0.55, 0, 0.3, 1],
      });
    },
    [measure, progress, WAVE, REDUCE],
  );

  const toggle = useCallback(() => settle(!verifiedRef.current), [settle]);

  const scrub = useCallback(
    (value) => {
      waveRef.current?.stop();
      setInteracted(true);
      progress.set(Math.min(1, Math.max(0, value)));
    },
    [progress],
  );

  const value = useMemo(
    () => ({
      verified,
      interacted,
      taskOpen,
      setTaskOpen,
      taskIndex,
      setTaskIndex,
      toggle,
      scrub,
      release: settle,
      progress,
      rootRef,
      toggleRef,
      layersRef,
      geometry,
      subscribeReach,
    }),
    [verified, interacted, taskOpen, taskIndex, toggle, scrub, settle, progress, subscribeReach],
  );

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>;
}

function useWaveReach(ref) {
  const [reached, setReached] = useState(false);
  const { subscribeReach } = useVerification();
  useEffect(() => subscribeReach(ref, setReached), [ref, subscribeReach]);
  return reached;
}

function KineticText({ text }) {
  const { REDUCE } = useHeroConfig();
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!root || !finePointer.matches || REDUCE) return;

    const chars = [...root.querySelectorAll('.mt-char')];
    let centres = [];
    let frame = 0;
    let radius = 0;

    const readRadius = () => {
      radius = parseFloat(getComputedStyle(root).fontSize) * 1.15;
    };

    const lock = () => {
      root.dataset.locked = 'false';
      chars.forEach((char) => { char.style.width = ''; });
      const widths = chars.map((char) => char.getBoundingClientRect().width);
      chars.forEach((char, index) => { char.style.width = `${widths[index]}px`; });
      root.dataset.locked = 'true';
      readRadius();
    };

    const measure = () => {
      centres = chars.map((char) => {
        const box = char.getBoundingClientRect();
        return [box.left + box.width / 2, box.top + box.height / 2];
      });
    };

    const handleMove = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!centres.length) measure();
        chars.forEach((char, index) => {
          const [x, y] = centres[index];
          const distance = Math.hypot(event.clientX - x, (event.clientY - y) * 0.6);
          const reach = Math.max(0, 1 - distance / radius);
          const boost = reach * reach;
          char.style.transform = boost > 0.01 ? `translateY(${(-boost * 3).toFixed(2)}px) scale(${(1 + boost * 0.08).toFixed(3)})` : '';
          char.style.color = boost > 0.2 ? 'var(--palette-citrus)' : '';
        });
      });
    };

    const handleLeave = () => {
      cancelAnimationFrame(frame);
      centres = [];
      chars.forEach((char) => {
        char.style.transform = '';
        char.style.color = '';
      });
    };

    const observer = new ResizeObserver(() => {
      centres = [];
      lock();
    });

    readRadius();
    document.fonts?.ready.then(lock);
    observer.observe(root.parentElement ?? root);
    root.addEventListener('pointerenter', measure);
    root.addEventListener('pointermove', handleMove);
    root.addEventListener('pointerleave', handleLeave);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener('pointerenter', measure);
      root.removeEventListener('pointermove', handleMove);
      root.removeEventListener('pointerleave', handleLeave);
    };
  }, [REDUCE]);

  return (
    <span ref={rootRef} className="mt-kinetic">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {[...text].map((char, index) => (
          <span key={`${char}-${index}`} className="mt-char">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
}

function VerifyToggle() {
  const { AUTOPLAY, ENTRANCE, TOGGLE, REDUCE } = useHeroConfig();
  const dragRef = useRef(null);
  const dragEndedRef = useRef(false);
  const { verified, interacted, toggle, toggleRef, scrub, release, progress } = useVerification();

  useEffect(() => {
    if (interacted || !AUTOPLAY.verifyAfter || REDUCE) return;
    const timer = window.setTimeout(toggle, AUTOPLAY.verifyAfter * 1000);
    return () => window.clearTimeout(timer);
  }, [interacted, toggle, AUTOPLAY.verifyAfter, REDUCE]);

  useEffect(() => {
    const handleKey = (event) => {
      const target = event.target;
      if (event.key.toLowerCase() !== 'v' || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      toggle();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggle]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    dragRef.current = { x: event.clientX, from: progress.get(), moved: false, id: event.pointerId };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    const button = event.currentTarget;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 5) return;
      drag.moved = true;
      button.setPointerCapture(drag.id);
      button.dataset.dragging = 'true';
    }
    const travel = KNOB_TRAVEL * parseFloat(getComputedStyle(button).fontSize);
    const value = Math.min(1, Math.max(0, drag.from + dx / travel));
    button.style.setProperty('--mt-knob-x', `${value * KNOB_TRAVEL}em`);
    scrub(value);
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    const button = event.currentTarget;
    dragRef.current = null;
    if (!drag?.moved) return;
    dragEndedRef.current = true;
    delete button.dataset.dragging;
    button.style.removeProperty('--mt-knob-x');
    release(progress.get() > 0.5);
  };

  const handleClick = () => {
    if (dragEndedRef.current) {
      dragEndedRef.current = false;
      return;
    }
    toggle();
  };

  return (
    <motion.span
      className="mt-toggle-wrap"
      initial={REDUCE ? false : { opacity: 0, scale: 0.72 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { duration: 0.25, delay: ENTRANCE.toggle },
        scale: { type: 'spring', stiffness: 320, damping: 17, delay: ENTRANCE.toggle },
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        role="switch"
        aria-checked={verified}
        aria-label={TOGGLE.label}
        aria-keyshortcuts="V"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="mt-toggle"
      >
        <span className="mt-toggle-track" />
        <motion.span
          className="mt-toggle-knob"
          initial={false}
          animate={{
            x: interacted || REDUCE
              ? '0em'
              : ['0em', '0em', '0.2em', '0em', '0.09em', '0em'],
          }}
          transition={
            interacted || REDUCE
              ? { duration: 0.2 }
              : { duration: 1.3, delay: ENTRANCE.hint + 0.45, times: [0, 0.05, 0.3, 0.55, 0.75, 1], ease: 'easeInOut' }
          }
        >
          <motion.span
            className="mt-toggle-seal-wrap"
            animate={verified ? { scale: [1, 1.16, 1] } : { scale: 1 }}
            transition={{ duration: 0.42, ease: [0.3, 0, 0.3, 1] }}
          >
            <TaskSeal className="mt-toggle-seal" />
            <motion.span
              className="mt-toggle-tick"
              animate={{ opacity: verified ? 1 : 0.6 }}
              transition={{ duration: 0.25 }}
            >
              <TaskTick drawn className="mt-full-svg" />
            </motion.span>
          </motion.span>
        </motion.span>
      </button>
      <AnimatePresence>
        {!interacted && !REDUCE && (
          <motion.span
            className="mt-hint-anchor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5, delay: ENTRANCE.hint } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            aria-hidden
          >
            <span className="mt-hint">
              <span className="mt-hint-pointer">
                {TOGGLE.hint.pointer} <kbd className="mt-hint-key">V</kbd>
              </span>
              <span className="mt-hint-touch">{TOGGLE.hint.touch}</span>
              <HintArrow delay={ENTRANCE.hint + 0.15} className="mt-hint-arrow" />
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

const PULSE_TONES = ['mt-pulse-sea', 'mt-pulse-citrus', 'mt-pulse-amalfi', 'mt-pulse-cream'];
const pseudoRandom = (seed) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

function GridLines() {
  const { ENTRANCE, PULSES, REDUCE } = useHeroConfig();
  const [lines, setLines] = useState([]);
  const [pulses, setPulses] = useState([]);
  const gridRef = useRef(null);
  const glintsRef = useRef(null);
  const pulsesRef = useRef(null);
  const geometry = useRef({ lines: [], step: 116 });
  const { rootRef } = useVerification();

  useEffect(() => {
    const grid = gridRef.current;
    const layer = pulsesRef.current;
    if (!grid || !layer) return;

    const place = () => {
      const step = parseFloat(getComputedStyle(grid).getPropertyValue('--mt-grid-step')) || 116;
      const { width, height } = grid.getBoundingClientRect();
      const centre = width / 2;
      const reach = Math.floor(centre / step);
      const xs = [];
      const next = [];

      layer.style.setProperty('--mt-pulse-travel', `${height + PULSES.length}px`);

      for (let i = -reach; i <= reach; i++) {
        const x = centre + i * step;
        if (x < 1 || x > width - 1) continue;
        xs.push(x);
        if (pseudoRandom(i + 50) > PULSES.share) continue;
        next.push({
          x,
          duration: PULSES.minDuration + pseudoRandom(i + 90) * (PULSES.maxDuration - PULSES.minDuration),
          delay: PULSES.startAfter + pseudoRandom(i + 130) * PULSES.maxDuration * 0.7,
          tone: PULSE_TONES[Math.floor(pseudoRandom(i + 170) * PULSE_TONES.length)],
        });
      }
      geometry.current = { lines: xs, step };
      setLines(xs);
      setPulses(next);
    };

    const observer = new ResizeObserver(place);
    observer.observe(grid);

    let isOnScreen = true;
    const sync = () => {
      layer.dataset.paused = String(!isOnScreen || document.hidden);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      isOnScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(layer);
    document.addEventListener('visibilitychange', sync);

    return () => {
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [PULSES]);

  useEffect(() => {
    const layer = glintsRef.current;
    const panel = layer?.parentElement;
    if (!layer || !panel || !rootRef.current) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const state = { tx: 0, ty: 0, x: 0, y: 0, level: 0, target: 0, frame: 0, running: false };

    const tick = () => {
      const { lines: xs, step } = geometry.current;
      const glints = layer.children;
      state.x += (state.tx - state.x) * 0.18;
      state.y += (state.ty - state.y) * 0.18;
      state.level += (state.target - state.level) * 0.12;
      layer.style.setProperty('--mt-gy', `${state.y}px`);

      for (let i = 0; i < glints.length; i++) {
        const glint = glints[i];
        const strength = Math.max(0, 1 - Math.abs((xs[i] ?? -9999) - state.x) / (step * 0.85));
        glint.style.opacity = (strength * strength * state.level).toFixed(3);
      }

      const settled = Math.abs(state.tx - state.x) < 0.5 && Math.abs(state.target - state.level) < 0.01;
      if (settled) {
        state.running = false;
        return;
      }
      state.frame = requestAnimationFrame(tick);
    };

    const run = () => {
      if (state.running) return;
      state.running = true;
      state.frame = requestAnimationFrame(tick);
    };

    const handleMove = (event) => {
      if (!finePointer.matches || REDUCE) return;
      const box = panel.getBoundingClientRect();
      state.tx = event.clientX - box.left;
      state.ty = event.clientY - box.top;
      if (state.level < 0.02) {
        state.x = state.tx;
        state.y = state.ty;
      }
      state.target = 1;
      run();
    };

    const handleLeave = () => {
      state.target = 0;
      run();
    };

    panel.addEventListener('pointermove', handleMove, { passive: true });
    panel.addEventListener('pointerleave', handleLeave);
    return () => {
      cancelAnimationFrame(state.frame);
      panel.removeEventListener('pointermove', handleMove);
      panel.removeEventListener('pointerleave', handleLeave);
    };
  }, [rootRef, REDUCE]);

  return (
    <>
      <motion.div
        ref={gridRef}
        className="mt-grid"
        initial={REDUCE ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: ENTRANCE.grid, ease: EASE }}
        aria-hidden
      />
      <div ref={glintsRef} className="mt-glints" aria-hidden>
        {lines.map((x) => (
          <span key={x} className="mt-glint" style={{ left: x }} />
        ))}
      </div>
      <div ref={pulsesRef} className="mt-pulses" aria-hidden>
        {pulses.map((pulse) => (
          <span
            key={pulse.x}
            className={`mt-pulse ${pulse.tone}`}
            style={{
              left: pulse.x,
              height: PULSES.length,
              opacity: PULSES.opacity,
              '--mt-pulse-duration': `${pulse.duration.toFixed(2)}s`,
              '--mt-pulse-delay': `${pulse.delay.toFixed(2)}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function WaveOverlay() {
  const { WAVE } = useHeroConfig();
  const { layersRef } = useVerification();
  return (
    <div
      ref={layersRef}
      className="mt-wave"
      data-state="mono"
      style={{ '--mt-band-strength': WAVE.bandStrength }}
      aria-hidden
    >
      <div className="mt-wave-gray" />
      <div className="mt-wave-band" />
    </div>
  );
}

function StatsCard() {
  const { ENTRANCE, FLOAT, STATS, REDUCE } = useHeroConfig();
  const cardRef = useRef(null);
  const numberRef = useRef(null);
  const reached = useWaveReach(cardRef);
  const position = { '--x': FLOAT.stats.x, '--y': FLOAT.stats.y };
  const word = reached ? STATS.states.on : STATS.states.off;

  useEffect(() => {
    const el = numberRef.current;
    if (!el || REDUCE) return;
    el.textContent = '0';
    const controls = animate(0, STATS.value, {
      duration: 1.2,
      delay: ENTRANCE.sideCards + 0.15,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => {
        el.textContent = String(Math.round(value)).padStart(2, '0');
      },
    });
    return () => controls.stop();
  }, [REDUCE, STATS.value, ENTRANCE.sideCards]);

  return (
    <motion.div
      className="mt-float"
      style={position}
      initial={REDUCE ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: ENTRANCE.sideCards, ease: EASE }}
    >
      <div ref={cardRef} data-active={reached} className="mt-stats-card">
        <span className="mt-stats-icon">
          <StatsChartBars active={reached} className="mt-stats-bars" />
        </span>
        <span className="mt-stats-body">
          <span className="mt-stats-label">
            <span>{STATS.word}</span>
            <span className="mt-stats-word-slot">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={word}
                  className="mt-stats-word"
                  initial={{ y: '105%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '-105%' }}
                  transition={{ duration: 0.42, ease: [0.65, 0, 0.35, 1] }}
                >
                  {word}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
          <span className="mt-stats-figure">
            <span ref={numberRef}>{String(STATS.value).padStart(2, '0')}</span>
            {STATS.suffix}
          </span>
          <span className="mt-stats-note">
            <span className="mt-stats-note-inner">
              <span>{STATS.note}</span>
            </span>
          </span>
        </span>
      </div>
    </motion.div>
  );
}

function StackCardFace({ task, reached, lifted, stampDelay }) {
  const { CERTIFICATE } = useHeroConfig();
  return (
    <>
      <span
        className="mt-cert-wash"
        style={{
          background: `radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, ${task.accent} 22%, transparent), transparent 65%)`,
        }}
      />
      <span
        className="mt-cert-inner-border"
        style={{ borderColor: `color-mix(in srgb, ${task.accent} 24%, transparent)` }}
      />
      <span className="mt-cert-top">
        <span className="mt-cert-brand">
          <span
            className="mt-cert-icon"
            style={{
              background: `color-mix(in srgb, ${task.accent} 18%, transparent)`,
              color: task.accent,
            }}
          >
            <TaskIcon name={task.icon} className="mt-cert-svg" />
          </span>
          <span className="mt-cert-kicker">{CERTIFICATE.kicker}</span>
        </span>
        <AnimatePresence>
          {reached && (
            <motion.span
              className="mt-cert-pill"
              style={{
                background: `color-mix(in srgb, ${task.accent} 18%, transparent)`,
                color: task.accent,
              }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0, transition: { delay: stampDelay + 0.25, duration: 0.3 } }}
              exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
            >
              {CERTIFICATE.status.on}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span className="mt-cert-title">{task.title}</span>
      <span className="mt-cert-sub">
        {CERTIFICATE.recipientLabel} <strong>{task.subtitle}</strong>
      </span>

      <span className="mt-cert-foot">
        <span className="mt-cert-tags-slot">
          <motion.span
            className="mt-cert-tags"
            initial={false}
            animate={{ opacity: lifted ? 0 : 1, y: lifted ? -4 : 0 }}
            transition={{ duration: 0.22 }}
          >
            {task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="mt-cert-tag">{tag}</span>
            ))}
          </motion.span>
          <motion.span
            className="mt-cert-hover-cta"
            style={{ color: task.accent }}
            initial={false}
            animate={{ opacity: lifted ? 1 : 0, y: lifted ? 0 : 4 }}
            transition={{ duration: 0.22 }}
          >
            {CERTIFICATE.hover}
            <TaskIcon name="arrow" className="mt-cert-arrow" />
          </motion.span>
        </span>

        <span className="mt-cert-seal-slot">
          <motion.span
            className="mt-cert-seal-empty"
            initial={false}
            animate={{ opacity: reached ? 0 : 1, scale: reached ? 0.8 : 1 }}
            transition={{ duration: 0.25, delay: reached ? stampDelay : 0 }}
          />
          <motion.span
            className="mt-cert-seal-stamped"
            style={{ color: task.accent }}
            initial={false}
            animate={
              reached
                ? { opacity: 1, scale: 1, rotate: 0 }
                : { opacity: 0, scale: 1.6, rotate: -28 }
            }
            transition={
              reached
                ? {
                    type: 'spring',
                    stiffness: 420,
                    damping: 20,
                    delay: stampDelay,
                    opacity: { duration: 0.12, delay: stampDelay },
                  }
                : { duration: 0.22, ease: [0.4, 0, 1, 1] }
            }
          >
            <TaskSeal className="mt-full-svg" />
            <TaskTick drawn={reached} delay={stampDelay + 0.18} className="mt-cert-seal-tick" />
          </motion.span>
        </span>
      </span>
    </>
  );
}

function StackCard({
  task,
  isTop,
  reached,
  lifted,
  stampDelay,
  target,
  transition,
  layoutId,
  triggerRef,
  draggedRef,
  onOpen,
  onHover,
  onThrow,
  onKey,
  onLanded,
}) {
  const { CERTIFICATE } = useHeroConfig();
  const x = useMotionValue(0);
  const lean = useTransform(x, [-240, 0, 240], [-10, 0, 10]);

  return (
    <motion.button
      ref={isTop ? triggerRef : undefined}
      layoutId={layoutId}
      type="button"
      tabIndex={isTop ? 0 : -1}
      aria-hidden={!isTop}
      aria-haspopup="dialog"
      aria-keyshortcuts="ArrowLeft ArrowRight"
      aria-label={`${task.title}, ${CERTIFICATE.sampleLabel}: ${CERTIFICATE.hover}. Drag or use arrow keys for other tasks`}
      onClick={onOpen}
      onKeyDown={onKey}
      onHoverStart={() => isTop && onHover(true)}
      onHoverEnd={() => onHover(false)}
      onFocus={(event) => onHover(event.currentTarget.matches(':focus-visible'))}
      onBlur={() => onHover(false)}
      drag={isTop ? 'x' : false}
      dragSnapToOrigin
      dragElastic={0.5}
      dragMomentum={false}
      onDragStart={() => {
        draggedRef.current = true;
        onHover(false);
      }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 500) {
          onThrow(info.offset.x + info.velocity.x * 0.1 > 0 ? 1 : -1);
        }
        setTimeout(() => { draggedRef.current = false; }, 0);
      }}
      className={`mt-cert${isTop ? ' is-top' : ''}`}
      style={{ x, rotateZ: lean, touchAction: 'pan-y' }}
      initial={false}
      animate={target}
      transition={transition}
      onAnimationComplete={onLanded}
    >
      <svg className="mt-cert-trace" aria-hidden>
        <motion.rect
          x="0.75"
          y="0.75"
          rx="16.5"
          fill="none"
          stroke={task.accent}
          strokeWidth="1.5"
          style={{ width: 'calc(100% - 1.5px)', height: 'calc(100% - 1.5px)' }}
          initial={false}
          animate={{ pathLength: reached ? 1 : 0, opacity: reached ? 0 : 1 }}
          transition={
            reached
              ? {
                  pathLength: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
                  opacity: { duration: 0.4, delay: 0.85 },
                }
              : { duration: 0 }
          }
        />
      </svg>
      <StackCardFace task={task} reached={reached} lifted={lifted} stampDelay={stampDelay} />
    </motion.button>
  );
}

function TaskStack() {
  const { AUTOPLAY, CERTIFICATE, TASKS, ENTRANCE, FLOAT, REDUCE } = useHeroConfig();
  const COUNT = TASKS.length;

  const stackPose = (place, tilt, unit) => ({
    x: -0.75 * unit * place,
    y: 0.6 * unit * place,
    rotate: tilt + 4 * place,
    scale: 1 - 0.035 * place,
    zIndex: COUNT - place,
  });

  const [hovered, setHovered] = useState(false);
  const [flip, setFlip] = useState(null);
  const [unit, setUnit] = useState(16);

  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const wasOpen = useRef(false);
  const draggedRef = useRef(false);
  const stoppedRef = useRef(false);
  const liveRef = useRef({ hovered: false, open: false, advance: () => {} });

  const { taskOpen, setTaskOpen, taskIndex, setTaskIndex } = useVerification();
  const reached = useWaveReach(wrapRef);
  const isMobile = useMediaQuery('(max-width: 639.98px)');

  const position = { '--x': FLOAT.certificate.x, '--y': FLOAT.certificate.y };
  const lifted = hovered && !taskOpen;
  const tilt = reached ? CERTIFICATE.tilt.verified : CERTIFICATE.tilt.rest;

  const topPose = useMemo(() => {
    if (lifted) return { ...stackPose(0, CERTIFICATE.tilt.hover, unit), y: -0.5 * unit };
    if (reached) return { ...stackPose(0, 0, unit), rotate: [null, 0, 0, CERTIFICATE.tilt.verified] };
    return stackPose(0, CERTIFICATE.tilt.rest, unit);
  }, [lifted, reached, unit, CERTIFICATE.tilt]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => setUnit(parseFloat(getComputedStyle(wrap).fontSize) || 16));
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !AUTOPLAY.cycleAfter || REDUCE || COUNT < 2) return;

    const every = AUTOPLAY.cycleEvery * 1000;
    let visible = true;
    let next = performance.now() + AUTOPLAY.cycleAfter * 1000;

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });

    const tick = window.setInterval(() => {
      const { hovered: isHovered, open, advance } = liveRef.current;
      const now = performance.now();
      if (stoppedRef.current) return;
      if (isHovered || open || draggedRef.current || !visible || document.hidden || wrap.contains(document.activeElement)) {
        next = Math.max(next, now + every);
        return;
      }
      if (now < next) return;
      advance();
      next = now + every;
    }, 200);

    observer.observe(wrap);
    return () => {
      window.clearInterval(tick);
      observer.disconnect();
    };
  }, [AUTOPLAY.cycleAfter, AUTOPLAY.cycleEvery, REDUCE, COUNT]);

  useEffect(() => {
    if (wasOpen.current && !taskOpen) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
    wasOpen.current = taskOpen;
  }, [taskOpen]);

  const cycle = (step, direction = step) => {
    const leaving = taskIndex;
    setHovered(false);
    setTaskIndex((taskIndex + step + COUNT) % COUNT);
    setFlip({ card: step === 1 ? leaving : (taskIndex - 1 + COUNT) % COUNT, direction });
  };

  useEffect(() => {
    liveRef.current = { hovered, open: taskOpen, advance: () => cycle(1) };
  });

  const handleKey = (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    stoppedRef.current = true;
    cycle(event.key === 'ArrowRight' ? 1 : -1);
  };

  const handleLanded = (index) => {
    if (flip?.card === index) setFlip(null);
  };

  const handleOpen = () => {
    if (draggedRef.current) return;
    stoppedRef.current = true;
    setHovered(false);
    setTaskOpen(true);
  };

  if (COUNT === 0) return null;

  return (
    <motion.div
      className="mt-float"
      style={position}
      initial={REDUCE ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: ENTRANCE.sideCards + 0.08, ease: EASE }}
    >
      <div ref={wrapRef} className="mt-cert-wrap">
        {TASKS.map((task, index) => {
          const place = (index - taskIndex + COUNT) % COUNT;
          const isTop = place === 0;
          const flying = flip?.card === index;
          const back = stackPose(COUNT - 1, tilt, unit);

          if (isTop && taskOpen && !isMobile) return null;

          const target =
            flip && flying && !isTop
              ? {
                  x: [null, 10 * unit * flip.direction, back.x],
                  y: [null, -1.4 * unit, back.y],
                  rotate: [null, tilt + 16 * flip.direction, back.rotate],
                  scale: [null, 1.02, back.scale],
                  zIndex: [COUNT + 1, COUNT + 1, 1],
                }
              : flying && isTop
                ? {
                    x: [back.x, -10 * unit, 0],
                    y: [back.y, -1.4 * unit, 0],
                    rotate: [back.rotate, tilt - 14, tilt],
                    scale: [back.scale, 1.02, 1],
                    zIndex: [COUNT + 1, COUNT + 1, COUNT],
                  }
                : isTop
                  ? topPose
                  : stackPose(place, tilt, unit);

          const transition = flying
            ? { duration: 0.5, times: [0, 0.4, 1], ease: [0.33, 0, 0.2, 1] }
            : isTop && reached && !lifted
              ? {
                  rotate: { duration: 1.25, times: [0, 0.28, 0.62, 1], ease: 'easeInOut' },
                  default: SPRING,
                }
              : SPRING;

          return (
            <StackCard
              key={task.id}
              task={task}
              isTop={isTop}
              reached={reached}
              lifted={isTop && lifted}
              stampDelay={0.32 + place * 0.14}
              target={target}
              transition={transition}
              layoutId={isTop && !isMobile ? 'mt-task-card' : undefined}
              triggerRef={triggerRef}
              draggedRef={draggedRef}
              onOpen={handleOpen}
              onHover={setHovered}
              onThrow={(direction) => {
                stoppedRef.current = true;
                cycle(1, direction);
              }}
              onKey={handleKey}
              onLanded={() => handleLanded(index)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

function TaskDialog() {
  const { CERTIFICATE, TASKS, onNavigate } = useHeroConfig();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const { taskOpen, setTaskOpen, taskIndex, verified, toggle } = useVerification();
  const isMobile = useMediaQuery('(max-width: 639.98px)');

  const status = verified ? CERTIFICATE.status.on : CERTIFICATE.status.off;
  const task = TASKS[taskIndex] ?? TASKS[0];

  useEffect(() => {
    if (!taskOpen) return;
    closeRef.current?.focus({ preventScroll: true });

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setTaskOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll('button, a[href]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [taskOpen, setTaskOpen]);

  if (!task) return null;

  const openTarget = () => {
    setTaskOpen(false);
    onNavigate(task.target);
  };

  return (
    <AnimatePresence>
      {taskOpen && (
        <div className={`mt-dialog-backdrop${isMobile ? ' is-mobile' : ''}`}>
          <motion.div
            className="mt-dialog-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setTaskOpen(false)}
            aria-hidden
          />
          <motion.div
            ref={dialogRef}
            layoutId={isMobile ? undefined : 'mt-task-card'}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mt-task-title"
            aria-describedby="mt-task-note"
            className={`mt-dialog-card${isMobile ? ' is-mobile' : ''}`}
            {...(isMobile
              ? {
                  initial: { y: '100%' },
                  animate: { y: 0 },
                  exit: { y: '100%' },
                  transition: { type: 'spring', stiffness: 320, damping: 34 },
                }
              : {
                  initial: { rotate: CERTIFICATE.tilt.hover },
                  animate: { rotate: 0 },
                  transition: { type: 'spring', stiffness: 200, damping: 26 },
                })}
          >
            <motion.div
              className="mt-dialog-inner"
              style={{ borderColor: `color-mix(in srgb, ${task.accent} 26%, transparent)` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: isMobile ? 0.1 : 0.18, duration: 0.25 } }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
            >
              <div className="mt-dialog-top">
                <div>
                  <p className="eyebrow">{CERTIFICATE.type}</p>
                  <h2 id="mt-task-title">{task.title}</h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setTaskOpen(false)}
                  aria-label="Close task"
                  className="icon-button"
                >
                  <TaskIcon name="x" className="mt-dialog-x" />
                </button>
              </div>

              <p
                id="mt-task-note"
                className="mt-dialog-badge"
                style={{
                  background: `color-mix(in srgb, ${task.accent} 16%, transparent)`,
                  color: task.accent,
                }}
              >
                {CERTIFICATE.sampleLabel} · {task.subtitle}
              </p>

              <p className="mt-dialog-detail">{task.detail}</p>

              <div className="mt-dialog-tags">
                {task.tags.map((tag) => (
                  <span key={tag} className="mt-dialog-tag">{tag}</span>
                ))}
              </div>

              <div className="mt-dialog-status-row">
                <span className={`mt-dialog-seal${verified ? ' is-on' : ''}`} style={verified ? { color: task.accent } : undefined}>
                  <motion.span
                    className="mt-full-box"
                    key={verified ? 'on' : 'off'}
                    initial={verified ? { scale: 1.4, rotate: -20, opacity: 0 } : { opacity: 0.4 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                  >
                    <TaskSeal className="mt-full-svg" />
                    <TaskTick drawn={verified} delay={0.15} className="mt-cert-seal-tick" />
                  </motion.span>
                </span>
                <div className="mt-dialog-status-copy">
                  <strong>{status}</strong>
                  <p>{verified ? CERTIFICATE.statusDetail.on : CERTIFICATE.statusDetail.off}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={verified}
                  aria-label="Ready check"
                  onClick={toggle}
                  className={`mt-mini-switch${verified ? ' is-on' : ''}`}
                >
                  <motion.span
                    className="mt-mini-switch-knob"
                    initial={false}
                    animate={{ x: verified ? 19 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <button type="button" onClick={openTarget} className="button button-primary mt-dialog-action">
                <span>{task.actionLabel}</span>
                <TaskIcon name="arrow" className="mt-btn-icon" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatusBadge() {
  const { ENTRANCE, STATUS_BADGE, REDUCE } = useHeroConfig();
  const STAMP_REST = `scale(1, 1) rotate(${STATUS_BADGE.stampTilt}deg)`;
  const STAMP_FRAMES = [
    STAMP_REST,
    `scale(1.07, 0.9) rotate(${STATUS_BADGE.stampTilt}deg)`,
    `scale(0.98, 1.03) rotate(${STATUS_BADGE.stampTilt}deg)`,
    STAMP_REST,
  ];

  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const badgeRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const lightRef = useRef(null);
  const glowRef = useRef(null);
  const wasFlipped = useRef(false);

  const reached = useWaveReach(badgeRef);
  const lightX = useSpring(LIGHT_REST.x, { stiffness: 120, damping: 20 });
  const lightY = useSpring(LIGHT_REST.y, { stiffness: 120, damping: 20 });

  useMotionValueEvent(lightX, 'change', (value) => {
    lightRef.current?.setAttribute('x', `${value}`);
    glowRef.current?.setAttribute('cx', `${18 + (value / 160) * 64}%`);
  });
  useMotionValueEvent(lightY, 'change', (value) => {
    lightRef.current?.setAttribute('y', `${value}`);
    glowRef.current?.setAttribute('cy', `${18 + (value / 160) * 64}%`);
  });

  const status = reached ? STATUS_BADGE.on : STATUS_BADGE.off;
  const lifted = hovered && !flipped;

  useEffect(() => {
    if (flipped) backRef.current?.focus({ preventScroll: true });
    else if (wasFlipped.current) frontRef.current?.focus({ preventScroll: true });
    wasFlipped.current = flipped;
    if (!flipped) return;
    const handleKey = (event) => {
      if (event.key === 'Escape') setFlipped(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipped]);

  const handleLightMove = (event) => {
    if (event.pointerType !== 'mouse' || REDUCE) return;
    const box = event.currentTarget.getBoundingClientRect();
    lightX.set(((event.clientX - box.left) / box.width) * 160);
    lightY.set(((event.clientY - box.top) / box.height) * 160);
  };

  const handleLeave = () => {
    setHovered(false);
    lightX.set(LIGHT_REST.x);
    lightY.set(LIGHT_REST.y);
  };

  return (
    <motion.div
      ref={badgeRef}
      className="mt-badge"
      initial={REDUCE ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: ENTRANCE.trust + 0.1, ease: EASE }}
    >
      <motion.div
        className="mt-badge-lift"
        style={{ transformOrigin: '80% 85%' }}
        initial={false}
        animate={{ y: lifted ? -6 : 0, rotate: lifted ? -4 : 0, scale: flipped ? 1.38 : 1 }}
        transition={{
          y: { type: 'spring', stiffness: 260, damping: 20 },
          rotate: { type: 'spring', stiffness: 260, damping: 20 },
          scale: FLIP,
        }}
      >
        <motion.span
          className="mt-badge-shadow"
          initial={false}
          animate={{
            opacity: lifted ? 0.45 : 0.24,
            y: lifted ? 10 : 4,
            scale: lifted ? 0.9 : 1,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          aria-hidden
        />
        <motion.div
          className="mt-seal-flip"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={FLIP}
        >
          <button
            ref={frontRef}
            type="button"
            aria-hidden={flipped}
            tabIndex={flipped ? -1 : 0}
            aria-label={`Inspect seal: ${status.toLowerCase()}`}
            aria-expanded={flipped}
            onClick={() => {
              setHovered(false);
              setFlipped(true);
            }}
            onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
            onPointerMove={handleLightMove}
            onPointerLeave={handleLeave}
            onFocus={(event) => setHovered(event.currentTarget.matches(':focus-visible'))}
            onBlur={() => setHovered(false)}
            className="mt-seal-face mt-seal-front"
          >
            <motion.span
              className="mt-full-box"
              initial={false}
              animate={{ transform: reached ? STAMP_FRAMES : STAMP_REST }}
              transition={{ duration: 0.6, times: [0, 0.4, 0.7, 1], ease: 'easeOut' }}
            >
              {reached && (
                <motion.span
                  className="mt-seal-ripple"
                  initial={{ scale: 0.75, opacity: 0.55 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.9, delay: 0.18, ease: EASE }}
                  aria-hidden
                />
              )}
              <FishWaxSeal
                top={status}
                bottom={STATUS_BADGE.tail}
                active={reached}
                lightRef={lightRef}
                glowRef={glowRef}
                className="mt-full-svg"
              />
            </motion.span>
          </button>

          <div
            aria-hidden={!flipped}
            role="group"
            aria-label={STATUS_BADGE.back.title}
            className="mt-seal-face mt-seal-back"
          >
            <TaskIcon name="shield" className="mt-seal-back-icon" />
            <strong>{STATUS_BADGE.back.title}</strong>
            <p>{STATUS_BADGE.back.text}</p>
            <button
              ref={backRef}
              type="button"
              tabIndex={flipped ? 0 : -1}
              onClick={() => setFlipped(false)}
              className="mt-seal-back-btn"
            >
              {STATUS_BADGE.back.action}
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {lifted && (
          <motion.span
            className="mt-badge-tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            aria-hidden
          >
            {STATUS_BADGE.hint}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MembersStrip() {
  const { ENTRANCE, MEMBERS, REDUCE, onNavigate } = useHeroConfig();
  return (
    <div className="mt-members-strip">
      <div className="mt-copy-halo mt-copy-halo-trust" aria-hidden />
      <motion.p
        className="eyebrow mt-members-label"
        initial={REDUCE ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: ENTRANCE.trust }}
      >
        SHARED SPACE · 07 MEMBERS
      </motion.p>
      <ul className="mt-members-row">
        {MEMBERS.map((person, index) => (
          <motion.li
            key={person.id}
            initial={REDUCE ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: ENTRANCE.trust + 0.06 + index * 0.05, ease: EASE }}
          >
            <button type="button" className="mt-member-chip" onClick={() => onNavigate('members')}>
              <span className={`avatar avatar-${person.color} avatar-small`}>{person.name.slice(0, 1)}</span>
              <span>{person.nickname || person.name}</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function HeroDecor() {
  const { ENTRANCE, FLOAT } = useHeroConfig();
  return (
    <>
      <ConnectorArc
        side="left"
        delay={ENTRANCE.decor}
        className="mt-float mt-arc mt-arc-left"
        style={{ '--x': FLOAT.arcLeft.x, '--y': FLOAT.arcLeft.y }}
      />
      <ConnectorArc
        side="right"
        delay={ENTRANCE.decor + 0.1}
        className="mt-float mt-arc mt-arc-right"
        style={{ '--x': FLOAT.arcRight.x, '--y': FLOAT.arcRight.y }}
      />
    </>
  );
}

function HeroCopy() {
  const { COPY, ENTRANCE, REDUCE, onNewPoll, onNavigate } = useHeroConfig();

  const lineReveal = (index) => ({
    initial: REDUCE ? false : { opacity: 0, y: '0.28em' },
    animate: { opacity: 1, y: '0em' },
    transition: { duration: 0.5, delay: ENTRANCE.headline + index * ENTRANCE.headlineStep, ease: EASE },
  });

  const fadeUp = (delay) => ({
    initial: REDUCE ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  const scrollToVote = () => {
    const el = document.getElementById('active-vote');
    if (el) {
      el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
    } else {
      onNavigate('outings');
    }
  };

  return (
    <div className="mt-copy">
      <div className="mt-copy-halo" aria-hidden />
      <motion.p className="mt-eyebrow" {...fadeUp(ENTRANCE.eyebrow)}>
        <span className="mt-eyebrow-seal" aria-hidden>
          <TaskSeal className="mt-full-svg" />
          <TaskTick drawn className="mt-eyebrow-tick" />
        </span>
        <span>{COPY.eyebrow}</span>
      </motion.p>

      <h1 id="mt-hero-title" className="mt-headline">
        <motion.span className="mt-headline-line" {...lineReveal(0)}>
          <KineticText text={COPY.lines[0]} />
        </motion.span>
        <motion.span className="mt-headline-line" {...lineReveal(1)}>
          <span className="mt-headline-mid">
            <KineticText text={COPY.lines[1]} />
            <motion.button
              type="button"
              onClick={onNewPoll}
              aria-label="Plan the next outing"
              className="mt-arrow"
              initial={REDUCE ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 20, delay: ENTRANCE.toggle + 0.1 }}
            >
              <TaskIcon name="arrowUpRight" className="mt-arrow-svg" />
            </motion.button>
          </span>
        </motion.span>
        <motion.span className="mt-headline-line mt-headline-last" {...lineReveal(2)}>
          <span className="sr-only">{COPY.lastWord}</span>
          <VerifyToggle />
          <span aria-hidden>{COPY.lastWord.slice(1)}</span>
        </motion.span>
      </h1>

      <motion.p className="mt-subtext" {...fadeUp(ENTRANCE.copy)}>
        {COPY.subtext}
      </motion.p>

      <div className="mt-actions">
        <motion.button
          type="button"
          onClick={onNewPoll}
          className="button button-primary mt-action-primary"
          {...fadeUp(ENTRANCE.copy + 0.1)}
        >
          <span>Plan the next outing</span>
          <TaskIcon name="arrow" className="mt-btn-icon" />
        </motion.button>
        <motion.button
          type="button"
          onClick={scrollToVote}
          className="button button-secondary mt-action-secondary"
          {...fadeUp(ENTRANCE.copy + 0.2)}
        >
          <TaskIcon name="play" className="mt-btn-icon-play" />
          <span>View active vote</span>
        </motion.button>
      </div>
    </div>
  );
}

function HeroLayout() {
  const { rootRef } = useVerification();
  return (
    <div id="top" ref={rootRef} className="mt-hero">
      <div className="mt-panel">
        <GridLines />
        <section aria-labelledby="mt-hero-title" className="mt-stage">
          <div className="mt-stage-inner">
            <HeroCopy />
            <div className="mt-floats">
              <StatsCard />
              <TaskStack />
              <HeroDecor />
            </div>
          </div>
        </section>
        <MembersStrip />
        <StatusBadge />
      </div>
      <TaskDialog />
      <WaveOverlay />
    </div>
  );
}

export default function MyTasksHero({ memberName, polls, outings, members, onNewPoll, onNavigate }) {
  const reduce = useReducedMotion();

  const openPoll = polls.find((poll) => poll.status === 'Voting');
  const sheetMissing = outings.some((outing) => outing.status === 'Done' && !outing.sheetUrl);

  const tasks = useMemo(() => {
    const list = [];
    if (openPoll) {
      list.push({
        id: 'vote',
        title: `Vote on ${openPoll.title}`,
        subtitle: `Due ${openPoll.deadline}`,
        accent: '#F1FF62',
        icon: 'spark',
        tags: ['Dates', 'Place & Budget'],
        detail: 'Pick the dates, place, and budget that work best for you.',
        target: 'outings',
        actionLabel: 'Open poll in Outings',
      });
    }
    if (sheetMissing) {
      list.push({
        id: 'sheet',
        title: 'Add expense sheet',
        subtitle: 'Riverside picnic',
        accent: '#0192C6',
        icon: 'link',
        tags: ['Shared Sheet', 'West Lake'],
        detail: 'Attach the group expense sheet link so everyone can check splits.',
        target: 'money',
        actionLabel: 'Open Money list',
      });
    }
    list.push({
      id: 'busy',
      title: 'Mark busy days',
      subtitle: 'Nov–Dec schedule',
      accent: '#D4EAFF',
      icon: 'calendar',
      tags: ['07 Schedules', 'Quick Tap'],
      detail: 'Tap the days you are unavailable so the group can spot a shared free day.',
      target: 'calendar',
      actionLabel: 'Open Calendar',
    });
    return list;
  }, [openPoll, sheetMissing]);

  const config = useMemo(
    () => ({
      COPY: {
        eyebrow: `MY TASKS · ${(memberName || 'FRIEND').toUpperCase()}`,
        lines: ['Make every', 'group plan'],
        lastWord: 'official.',
        subtext: 'Votes, schedules, and shared sheets—lined up in one place for the seven of you.',
      },
      TOGGLE: {
        label: 'Reveal group status',
        hint: { pointer: 'Click, drag, or press', touch: 'Tap or drag' },
      },
      STATS: {
        value: tasks.length,
        suffix: '',
        word: 'Tasks',
        states: { off: 'pending', on: 'ready' },
        note: 'Everything waiting on you right now.',
      },
      CERTIFICATE: {
        kicker: 'MY TASK',
        type: 'GROUP ACTION ITEM',
        sampleLabel: 'Active task',
        recipientLabel: 'Status:',
        status: { on: 'Ready', off: 'Pending' },
        statusDetail: {
          on: 'Stamped and lined up for Fish Upon The Sky.',
          off: 'Flip the switch to stamp this task ready.',
        },
        hover: 'Inspect task',
        tilt: { rest: 8, verified: 3.5, hover: 0 },
      },
      STATUS_BADGE: {
        off: 'PENDING',
        on: 'ALL SET',
        tail: 'FISH UPON THE SKY',
        stampTilt: -6,
        hint: 'Click to flip',
        back: {
          title: '7 members synced',
          text: 'Votes, schedules, and sheets stay together in one shared space.',
          action: 'Back',
        },
      },
      TASKS: tasks,
      MEMBERS: members,
      WAVE: DEFAULT_WAVE,
      PULSES: DEFAULT_PULSES,
      AUTOPLAY: DEFAULT_AUTOPLAY,
      ENTRANCE: DEFAULT_ENTRANCE,
      FLOAT: DEFAULT_FLOAT,
      REDUCE: Boolean(reduce),
      onNewPoll,
      onNavigate,
    }),
    [memberName, tasks, members, reduce, onNewPoll, onNavigate],
  );

  return (
    <HeroConfigContext.Provider value={config}>
      <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
        <VerificationProvider>
          <HeroLayout />
        </VerificationProvider>
      </MotionConfig>
    </HeroConfigContext.Provider>
  );
}
