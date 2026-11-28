import { useEffect, useLayoutEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import BrandIcon from './BrandIcon.jsx';

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
    if (!btn || btn.offsetWidth === 0) return null;
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
            <BrandIcon name={item.icon} size={20} strokeWidth={1.75} className="lgt-ic" />
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
