import { useEffect, useLayoutEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

function TabBarIcon({ name }) {
  const common = {
    className: 'lgt-ic',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };

  if (name === 'home') {
    return (
      <svg {...common}>
        <path d="m3.5 10 8.5-7 8.5 7" />
        <path d="M5.5 9v10h13V9M9 19v-6h6v6" />
      </svg>
    );
  }
  if (name === 'calendar') {
    return (
      <svg {...common}>
        <rect x="3.5" y="5" width="17" height="16" rx="3" />
        <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" />
        <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
      </svg>
    );
  }
  if (name === 'spark') {
    return (
      <svg {...common}>
        <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
        <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
      </svg>
    );
  }
  if (name === 'folder') {
    return (
      <svg {...common}>
        <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4l2 2.5h7A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5V6.5Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8" />
    </svg>
  );
}

// Damped spring constants from 21st.dev LiquidGlassTabBar (~14% overshoot, peak ~0.33s)
const ZETA = 0.53;
const WN = 11.1;
const WD = WN * Math.sqrt(1 - ZETA * ZETA);
const K = ZETA / Math.sqrt(1 - ZETA * ZETA);
const spring = (t) => (t <= 0 ? 0 : 1 - Math.exp(-ZETA * WN * t) * (Math.cos(WD * t) + K * Math.sin(WD * t)));

export default function LiquidGlassTabBar({
  items = [],
  activeId,
  onChange,
  variant = 'header',
  ariaLabel = 'Primary pages',
  className = '',
}) {
  const reduceMotion = useReducedMotion();
  const barRef = useRef(null);
  const lensRef = useRef(null);
  const rimRef = useRef(null);
  const itemRefs = useRef([]);
  const curRef = useRef({ left: 0, width: 0, ready: false });
  const rafRef = useRef(0);

  const overhang = variant === 'dock' ? 10 : 7;
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );

  const applyGeometry = (left, width, stretch = 0) => {
    const lens = lensRef.current;
    const rim = rimRef.current;
    if (!lens || !rim) return;
    const clampedStretch = Math.max(-0.08, Math.min(0.08, stretch));
    const tx = `${left.toFixed(2)}px`;
    const wPx = `${Math.max(40, width).toFixed(2)}px`;
    lens.style.transform = `translate3d(${tx}, 0, 0) scaleX(${(1 + Math.abs(clampedStretch)).toFixed(4)})`;
    rim.style.transform = `translate3d(${tx}, 0, 0) scaleX(${(1 + Math.abs(clampedStretch)).toFixed(4)})`;
    lens.style.width = wPx;
    rim.style.width = wPx;
    lens.style.opacity = '1';
    rim.style.opacity = '1';
  };

  const measureTarget = (idx) => {
    const btn = itemRefs.current[idx];
    if (!btn) return null;
    return {
      left: btn.offsetLeft - overhang,
      width: btn.offsetWidth + overhang * 2,
    };
  };

  useLayoutEffect(() => {
    const target = measureTarget(activeIndex);
    if (!target) return;

    cancelAnimationFrame(rafRef.current);

    if (!curRef.current.ready || reduceMotion) {
      curRef.current = { ...target, ready: true };
      applyGeometry(target.left, target.width, 0);
      return;
    }

    const from = { left: curRef.current.left, width: curRef.current.width };
    const t0 = performance.now();

    const tick = (now) => {
      const t = (now - t0) / 1000;
      const done = t >= 1.15;
      const p = done ? 1 : spring(t);
      const nextLeft = from.left + (target.left - from.left) * p;
      const nextWidth = from.width + (target.width - from.width) * p;
      const velFactor = done ? 0 : Math.exp(-ZETA * WN * t) * Math.sin(WD * t) * 0.05;
      curRef.current = { left: nextLeft, width: nextWidth, ready: true };
      applyGeometry(nextLeft, nextWidth, velFactor);
      if (!done) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeIndex, items.length, reduceMotion]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const ro = new ResizeObserver(() => {
      const target = measureTarget(activeIndex);
      if (!target) return;
      curRef.current = { ...target, ready: true };
      applyGeometry(target.left, target.width, 0);
    });
    ro.observe(bar);
    return () => ro.disconnect();
  }, [activeIndex, overhang]);

  return (
    <motion.div
      ref={barRef}
      className={`lgt-bar lgt-bar--${variant}${className ? ' ' + className : ''}`}
      role="tablist"
      aria-label={ariaLabel}
      initial={reduceMotion ? false : { opacity: 0, y: variant === 'dock' ? 18 : -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="lgt-pill" aria-hidden="true" />

      <div ref={lensRef} className="lgt-lens" aria-hidden="true" style={{ opacity: 0 }}>
        <div className="lgt-clip">
          <div className="lgt-glass" />
          <div className="lgt-body" />
          <div className="lgt-band lgt-band-t" />
          <div className="lgt-band lgt-band-b" />
          <div className="lgt-fr lgt-fr-t" />
          <div className="lgt-fr lgt-fr-b" />
          <div className="lgt-glow" />
        </div>
      </div>

      {items.map((item, idx) => {
        const active = idx === activeIndex;
        const nudge = active ? 0 : idx < activeIndex ? -2 : 2;
        return (
          <button
            key={item.id}
            ref={(el) => {
              itemRefs.current[idx] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            className={`lgt-item${active ? ' is-on' : ''}`}
            style={{ '--lgt-nudge': `${nudge}px` }}
            onClick={() => onChange?.(item.id)}
          >
            <TabBarIcon name={item.icon} />
            <span className="lgt-lbl">{item.label}</span>
            {item.count !== undefined && variant === 'header' && (
              <sup className="lgt-count">{String(item.count).padStart(2, '0')}</sup>
            )}
            {item.notice && <i className="lgt-notice" aria-hidden="true" />}
          </button>
        );
      })}

      <div ref={rimRef} className="lgt-rim" aria-hidden="true" style={{ opacity: 0 }} />
    </motion.div>
  );
}
