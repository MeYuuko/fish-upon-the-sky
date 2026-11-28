import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export function haptic(ms = 10) {
  try {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)')?.matches &&
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      navigator.vibrate(ms);
    }
  } catch {
    // Ignore unsupported or blocked vibration API
  }
}

export function PondSurface({ reduceMotion = false }) {
  return (
    <div className="pond-surface" aria-hidden="true">
      <div className="pond-depth" />
      {!reduceMotion && (
        <>
          <div className="pond-caustics pond-caustics--noise" />
          <div className="pond-caustics pond-caustics--glow" />
        </>
      )}
    </div>
  );
}

export function RippleBurst({ x = '50%', y = '50%', trigger, tone = 'citrus' }) {
  const reduceMotion = useReducedMotion();
  if (!trigger || reduceMotion) return null;

  return (
    <span
      key={trigger}
      className={`pond-burst pond-burst--${tone}`}
      style={{ '--bx': x, '--by': y }}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  );
}

export function useBubbles() {
  const [bubbles, setBubbles] = useState([]);
  const timersRef = useRef(new Set());
  const idRef = useRef(0);

  const spawnBubble = useCallback((emoji, clientX, clientY) => {
    const id = ++idRef.current;
    const sway = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 8);
    setBubbles((prev) => [...prev.slice(-11), { id, emoji, x: clientX, y: clientY, sway }]);
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      setBubbles((prev) => prev.filter((b) => b.id !== id));
    }, 1400);
    timersRef.current.add(timer);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  return { bubbles, spawnBubble };
}

export function BubbleLayer({ bubbles = [] }) {
  const reduceMotion = useReducedMotion();
  if (typeof document === 'undefined' || reduceMotion || bubbles.length === 0) {
    return null;
  }

  return createPortal(
    <div className="pond-bubble-layer" aria-hidden="true">
      {bubbles.map((b) => (
        <motion.span
          key={b.id}
          className="pond-bubble"
          style={{ left: `${b.x}px`, top: `${b.y}px` }}
          initial={{ x: '-50%', y: 0, scale: 0.6, opacity: 0 }}
          animate={{
            x: ['-50%', `calc(-50% + ${b.sway}px)`, `calc(-50% - ${b.sway * 0.6}px)`, '-50%'],
            y: [0, -90],
            scale: [0.6, 1.1, 1],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{b.emoji}</span>
        </motion.span>
      ))}
    </div>,
    document.body,
  );
}

export function TideWave({ wave, onDone }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!wave) return undefined;
    const timer = window.setTimeout(() => {
      onDone?.();
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [wave, onDone]);

  return (
    <AnimatePresence>
      {wave && (
        <motion.div
          key={wave.id}
          className="pond-tide"
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {!reduceMotion && (
            <motion.svg
              className="pond-tide-wave"
              viewBox="0 0 240 16"
              fill="none"
              aria-hidden="true"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <path
                d="M0 8 Q 30 2, 60 8 T 120 8 T 180 8 T 240 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </motion.svg>
          )}
          <span className="pond-tide-text">🌊 {wave.name} just dropped a ripple</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
