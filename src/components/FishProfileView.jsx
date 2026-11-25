import { createContext, Fragment, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  animate,
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import FishProfileEditor from './FishProfileEditor.jsx';
import FrostedFolderLookbook, { FolderSheetArt } from './FrostedFolderLookbook.jsx';
import { normalizeExternalUrl } from '../data/fishProfiles.js';

const EASE = [0.16, 1, 0.3, 1];
const TURN_SPRING = { stiffness: 160, damping: 20, mass: 0.7 };
const OPEN_SPRING = { stiffness: 90, damping: 17, mass: 0.9 };
const DEPTH_SPRING = { stiffness: 50, damping: 18, mass: 0.9 };
const SPOT_SPRING = { stiffness: 380, damping: 36, mass: 0.6 };
const TRAIL_SPRING = { stiffness: 420, damping: 34, mass: 0.5 };
const REST = { rotateY: -24, rotateX: 6 };

const MOTION_CFG = {
  delays: { nav: 0, first: 0.08, last: 0.2, portrait: 0.32, book: 0.48, pad: 0.56, intro: 0.64, socials: 0.9 },
  letterStagger: 0.045,
  depth: { portrait: 14, first: 6, last: 9 },
  letter: { perCharacter: 0.055, pauseAfterPunctuation: 0.28, beforeSeal: 1.4, press: 0.8, sealHold: 4.5 },
  bookTilt: 14,
  bookOpen: 34,
  bookCycle: 3.6,
  spotlight: { radius: 145, readyAfter: 1.35 },
  cursor: { dot: 10, ring: 44, disc: 72, readLabel: 'Click' },
};

const MEDIA = {
  finePointer: '(hover: hover) and (pointer: fine)',
  composition: '(min-width: 1024px) and (min-aspect-ratio: 5/4)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
};

const EliasProfileContext = createContext(null);

function useEliasProfile() {
  const ctx = useContext(EliasProfileContext);
  if (!ctx) throw new Error('Elias parts must render inside FishProfileView');
  return ctx;
}

function useMediaQuery(query) {
  const subscribe = useCallback(
    (notify) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    [query],
  );
  const getSnapshot = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

const reveal = (reduceMotion, delay, duration = 0.95) =>
  reduceMotion ? { duration: 0.01 } : { delay, duration, ease: EASE };

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/* ----------------------------- Inline SVGs ----------------------------- */

function ArrowRightSvg({ className = '', strokeWidth = 2 }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowUpRightSvg({ className = '', strokeWidth = 2 }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function BackSvg({ size = 14 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function LockSvg({ size = 13 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2.5" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

function CheckSvg({ size = 15 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/* ----------------------------- Filters & Covers ----------------------------- */

function AuthorInkFilters({ duotoneId, outlineId }) {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="ea-defs">
      <filter id={duotoneId} colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.035 0.004 0.831 0.957" />
          <feFuncG type="table" tableValues="0.078 0.573 0.918 0.961" />
          <feFuncB type="table" tableValues="0.212 0.776 1.000 0.980" />
        </feComponentTransfer>
      </filter>
      <filter id={outlineId}>
        <feMorphology in="SourceAlpha" operator="erode" radius="2" result="inside" />
        <feComposite in="SourceGraphic" in2="inside" operator="out" />
      </filter>
    </svg>
  );
}

function AuthorCoverDays(props) {
  const days = Array.from({ length: 20 }, (_, index) => ({
    x: 20 + (index % 5) * 15,
    y: 84 + Math.floor(index / 5) * 11,
    marked: index === 12,
  }));
  return (
    <svg viewBox="0 0 100 139" preserveAspectRatio="xMidYMid slice" aria-hidden="true" {...props}>
      <rect width="100" height="139" fill="#D4EAFF" />
      {days.map((day) => (
        <circle
          key={`${day.x}-${day.y}`}
          cx={day.x}
          cy={day.y}
          r={day.marked ? 5 : 3.4}
          fill={day.marked ? '#0192C6' : '#8EC2F0'}
        />
      ))}
    </svg>
  );
}

function AuthorCoverLamp(props) {
  return (
    <svg viewBox="0 0 100 139" preserveAspectRatio="xMidYMid slice" aria-hidden="true" {...props}>
      <rect width="100" height="139" fill="#0B1842" />
      <circle cx="70" cy="86" r="30" fill="#183276" />
      <circle cx="70" cy="86" r="14" fill="#F1FF62" fillOpacity="0.9" />
      <rect x="12" y="112" width="56" height="10" rx="1.5" fill="#0192C6" />
      <rect x="18" y="102" width="46" height="10" rx="1.5" fill="#D4EAFF" />
      <rect x="14" y="92" width="40" height="10" rx="1.5" fill="#F1FF62" />
      <rect x="0" y="122" width="100" height="17" fill="#004499" />
    </svg>
  );
}

function AuthorCoverPath(props) {
  return (
    <svg viewBox="0 0 100 139" preserveAspectRatio="xMidYMid slice" aria-hidden="true" {...props}>
      <rect width="100" height="139" fill="#004499" />
      <circle cx="84" cy="30" r="7" fill="#F1FF62" />
      <path
        d="M92 139c-10-14-34-14-30-28s24-12 14-26-46-6-50-18"
        fill="none"
        stroke="#0192C6"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <g fill="#D4EAFF">
        <circle cx="79" cy="128" r="1.6" />
        <circle cx="65" cy="116" r="1.6" />
        <circle cx="73" cy="100" r="1.6" />
        <circle cx="60" cy="88" r="1.6" />
        <circle cx="42" cy="82" r="1.6" />
      </g>
    </svg>
  );
}

function AuthorCoverSunrise(props) {
  return (
    <svg viewBox="0 0 100 139" preserveAspectRatio="xMidYMid slice" aria-hidden="true" {...props}>
      <rect width="100" height="139" fill="#112358" />
      <circle cx="50" cy="96" r="38" fill="#004499" />
      <path d="M20 96a30 30 0 0 1 60 0Z" fill="#F1FF62" />
      <rect y="96" width="100" height="43" fill="#0192C6" />
      <rect x="14" y="104" width="72" height="2.4" rx="1.2" fill="#D4EAFF" />
      <rect x="24" y="112" width="52" height="2.4" rx="1.2" fill="#D4EAFF" />
      <rect x="34" y="120" width="32" height="2.4" rx="1.2" fill="#D4EAFF" />
    </svg>
  );
}

const COVER_ART = {
  sunrise: AuthorCoverSunrise,
  lamp: AuthorCoverLamp,
  path: AuthorCoverPath,
  days: AuthorCoverDays,
};

/* ----------------------------- Controls & Typography ----------------------------- */

function InkButton({ label, icon = 'right', disabled = false, onClick, className = '' }) {
  const Arrow = icon === 'up-right' ? ArrowUpRightSvg : ArrowRightSvg;
  const classes = cn('ea-cta', icon === 'up-right' && 'ea-cta-diagonal', className);

  return (
    <button type="button" className={classes} disabled={disabled} onClick={onClick}>
      <span className="ea-cta-label">{label}</span>
      <span aria-hidden="true" className="ea-cta-mark">
        <Arrow className="ea-cta-arrow ea-cta-arrow-out" strokeWidth={2} />
        <Arrow className="ea-cta-arrow ea-cta-arrow-in" strokeWidth={2} />
      </span>
    </button>
  );
}

function measureKerning(element, text) {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return [];
  const style = getComputedStyle(element);
  const shown = style.textTransform === 'uppercase' ? text.toUpperCase() : text;
  context.font = `${style.fontWeight} 100px ${style.fontFamily}`;
  const width = (value) => context.measureText(value).width;
  return [...shown].map((letter, index) => {
    const next = shown[index + 1];
    return next ? (width(letter + next) - width(letter) - width(next)) / 100 : 0;
  });
}

function MaskedWord({ text, delay, from, reverse = false }) {
  const { reduceMotion } = useEliasProfile();
  const [kerning, setKerning] = useState([]);
  const wordRef = useRef(null);
  const letters = [...String(text || '')];
  const offset = from === 'below' ? '135%' : '-135%';

  useEffect(() => {
    let active = true;
    document.fonts?.ready?.then(() => {
      if (active && wordRef.current) setKerning(measureKerning(wordRef.current, text));
    });
    return () => {
      active = false;
    };
  }, [text]);

  return (
    <span ref={wordRef} aria-hidden="true" className="ea-masked-word">
      {letters.map((letter, index) => {
        const order = reverse ? letters.length - 1 - index : index;
        if (letter === ' ') {
          return (
            <span key={`sp-${index}`} className="ea-letter-space">
              {' '}
            </span>
          );
        }
        return (
          <span
            key={`${letter}-${index}`}
            className="ea-letter-mask"
            style={kerning[index] ? { marginRight: `${kerning[index]}em` } : undefined}
          >
            <motion.span
              className="ea-letter-char"
              initial={reduceMotion ? false : { transform: `translateY(${offset})` }}
              animate={{ transform: 'translateY(0%)' }}
              transition={reveal(reduceMotion, delay + order * MOTION_CFG.letterStagger, 1.0)}
            >
              {letter}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

/* ----------------------------- InkCursor ----------------------------- */

function modeFor(target) {
  if (!(target instanceof Element)) return 'dot';
  if (target.closest('.ea-book-frame')) return 'read';
  if (target.closest('a, button')) return 'link';
  return 'dot';
}

function InkCursor() {
  const [mode, setMode] = useState('dot');
  const rootRef = useRef(null);
  const modeRef = useRef('dot');
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const visible = useMotionValue(0);
  const trailX = useSpring(x, TRAIL_SPRING);
  const trailY = useSpring(y, TRAIL_SPRING);
  const { dot, ring, disc, readLabel } = MOTION_CFG.cursor;

  useEffect(() => {
    const hero = rootRef.current?.parentElement;
    if (!hero) return;

    const handleMove = (event) => {
      const rect = hero.getBoundingClientRect();
      const next = modeFor(event.target);
      x.set(event.clientX - rect.left);
      y.set(event.clientY - rect.top);
      visible.set(1);
      if (next !== modeRef.current) {
        modeRef.current = next;
        setMode(next);
      }
    };
    const handleLeave = () => visible.set(0);

    hero.addEventListener('pointermove', handleMove, { passive: true });
    hero.addEventListener('pointerleave', handleLeave);
    return () => {
      hero.removeEventListener('pointermove', handleMove);
      hero.removeEventListener('pointerleave', handleLeave);
    };
  }, [x, y, visible]);

  return (
    <div ref={rootRef} aria-hidden="true" className="ea-cursor-layer">
      <motion.div className="ea-cursor-anchor" style={{ x: trailX, y: trailY, opacity: visible }}>
        <motion.div
          className="ea-cursor-ring"
          style={{ width: ring, height: ring, left: -ring / 2, top: -ring / 2 }}
          initial={{ transform: 'scale(0.2)', opacity: 0 }}
          animate={mode === 'link' ? { transform: 'scale(1)', opacity: 1 } : { transform: 'scale(0.2)', opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        />
        <motion.div
          className="ea-cursor-disc"
          style={{ width: disc, height: disc, left: -disc / 2, top: -disc / 2 }}
          initial={{ transform: 'scale(0)', opacity: 0 }}
          animate={mode === 'read' ? { transform: 'scale(1)', opacity: 1 } : { transform: 'scale(0)', opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {readLabel}
        </motion.div>
      </motion.div>

      <motion.div className="ea-cursor-anchor" style={{ x, y, opacity: visible }}>
        <motion.div
          className="ea-cursor-dot"
          style={{ width: dot, height: dot, left: -dot / 2, top: -dot / 2 }}
          animate={{ transform: mode === 'dot' ? 'scale(1)' : mode === 'link' ? 'scale(0.5)' : 'scale(0)' }}
          transition={{ duration: 0.3, ease: EASE }}
        />
      </motion.div>
    </div>
  );
}

/* ----------------------------- Navbar ----------------------------- */

function MemberNavItem({ person, active, onSelect, step }) {
  const { reduceMotion } = useEliasProfile();
  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(8px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      transition={reveal(reduceMotion, MOTION_CFG.delays.nav + 0.1 + step * 0.06, 0.75)}
    >
      <button
        type="button"
        onClick={() => onSelect(person.id)}
        aria-current={active ? 'page' : undefined}
        className={cn('ea-nav-link', active && 'is-active')}
      >
        <span className="ea-roll">
          <span>{person.name}</span>
          <span aria-hidden="true">{person.name}</span>
        </span>
      </button>
    </motion.li>
  );
}

function HeroNavbar() {
  const { member, members, memberIndex, isOwner, onBack, onSelectMember, onOpenEditor, reduceMotion } =
    useEliasProfile();

  const leftMembers = members.slice(0, 3);
  const rightMembers = members.slice(3);

  return (
    <header className="ea-wrap ea-header">
      <nav aria-label="Điều hướng hồ sơ thành viên" className="ea-nav">
        <motion.button
          type="button"
          className="ea-nav-status"
          onClick={onBack}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reveal(reduceMotion, MOTION_CFG.delays.nav + 0.25, 0.75)}
        >
          <span aria-hidden="true" className="ea-nav-status-dot" />
          <BackSvg size={13} />
          <span>Back to Fishes</span>
          <span aria-hidden="true" className="ea-sep">
            ·
          </span>
          <span className="ea-nav-count">
            {String(memberIndex + 1).padStart(2, '0')}/{String(members.length).padStart(2, '0')}
          </span>
        </motion.button>

        <button type="button" className="ea-nav-logo" onClick={onBack} title="Quay lại danh sách Fishes">
          <motion.span
            className="ea-nav-logo-inner"
            initial={reduceMotion ? false : { transform: 'translateY(105%)' }}
            animate={{ transform: 'translateY(0%)' }}
            transition={reveal(reduceMotion, MOTION_CFG.delays.nav, 0.85)}
          >
            {member.craft || 'THE FISHES'}
          </motion.span>
        </button>

        <ul className="ea-nav-left">
          {leftMembers.map((person, index) => (
            <MemberNavItem
              key={person.id}
              person={person}
              active={person.id === member.id}
              onSelect={onSelectMember}
              step={leftMembers.length - 1 - index}
            />
          ))}
        </ul>

        <ul className="ea-nav-right">
          {rightMembers.map((person, index) => (
            <MemberNavItem
              key={person.id}
              person={person}
              active={person.id === member.id}
              onSelect={onSelectMember}
              step={index}
            />
          ))}
        </ul>

        <motion.div
          className="ea-nav-cta"
          initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(8px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={reveal(reduceMotion, MOTION_CFG.delays.nav + 0.35, 0.75)}
        >
          {isOwner ? (
            <InkButton label="Sửa hồ sơ" icon="up-right" onClick={onOpenEditor} />
          ) : (
            <span className="ea-readonly-chip" title={`Chỉ ${member.name} có quyền chỉnh sửa`}>
              <LockSvg size={12} />
              <span>Chỉ {member.name} sửa</span>
            </span>
          )}
        </motion.div>
      </nav>
    </header>
  );
}

/* ----------------------------- Intro & Socials ----------------------------- */

const WRITTEN = {
  hidden: { opacity: 0, transform: 'translateY(0.45em)', clipPath: 'inset(0% 0% 100% 0%)' },
  shown: { opacity: 1, transform: 'translateY(0em)', clipPath: 'inset(-20% -5% -35% -5%)' },
};

function AuthorIntro() {
  const { member, reduceMotion } = useEliasProfile();
  const start = MOTION_CFG.delays.intro;
  const roles = member.roles && member.roles.length > 0 ? member.roles : [member.craft || 'Fish'];
  const headline = member.headline && member.headline.length > 0 ? member.headline : [member.name];

  return (
    <div className="ea-intro">
      <motion.p
        className="ea-intro-roles"
        initial={reduceMotion ? false : WRITTEN.hidden}
        animate={WRITTEN.shown}
        transition={reveal(reduceMotion, start, 0.9)}
      >
        {roles.map((role, index) => (
          <Fragment key={`${role}-${index}`}>
            {index > 0 && (
              <span aria-hidden="true" className="ea-sep">
                /
              </span>
            )}
            <span>{role}</span>
          </Fragment>
        ))}
      </motion.p>

      <p className="ea-intro-headline">
        {headline.map((line, index) => (
          <motion.span
            key={`${line}-${index}`}
            className="ea-intro-headline-line"
            initial={reduceMotion ? false : WRITTEN.hidden}
            animate={WRITTEN.shown}
            transition={reveal(reduceMotion, start + 0.08 + index * 0.09, 0.95)}
          >
            {line}
          </motion.span>
        ))}
      </p>

      <motion.hr
        className="ea-intro-rule"
        initial={reduceMotion ? false : { transform: 'scaleX(0)' }}
        animate={{ transform: 'scaleX(1)' }}
        transition={reveal(reduceMotion, start + 0.32, 0.85)}
      />

      <motion.p
        className="ea-intro-description"
        initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(10px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={reveal(reduceMotion, start + 0.42, 0.85)}
      >
        {member.bio || 'Thành viên của Fish Upon The Sky.'}
      </motion.p>

      <motion.dl
        className="ea-intro-facts"
        initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(10px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={reveal(reduceMotion, start + 0.52, 0.85)}
      >
        <div>
          <dt>Sinh nhật</dt>
          <dd>{member.birthday || 'Chưa cập nhật'}</dd>
        </div>
        <div>
          <dt>Ăn uống</dt>
          <dd>{member.foodNotes || 'Không kén'}</dd>
        </div>
        <div>
          <dt>Liên hệ</dt>
          <dd>{member.contact || 'Inbox nhóm'}</dd>
        </div>
      </motion.dl>
    </div>
  );
}

function SocialLinks() {
  const { member, reduceMotion } = useEliasProfile();
  const socials = Array.isArray(member.socials) ? member.socials : [];
  if (socials.length === 0) return null;

  const enter = (step) => reveal(reduceMotion, MOTION_CFG.delays.socials + step * 0.06, 0.75);

  return (
    <ul aria-label="Liên kết mạng xã hội" className="ea-socials">
      {socials.map((link, index) => {
        const safeUrl = normalizeExternalUrl(link.href);
        const text = link.label || link.handle;
        return (
          <Fragment key={link.id || index}>
            {index > 0 && (
              <motion.li
                aria-hidden="true"
                className="ea-sep"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={enter(index * 2 - 1)}
              >
                /
              </motion.li>
            )}
            <motion.li
              initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(8px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={enter(index * 2)}
            >
              {safeUrl ? (
                <a href={safeUrl} target="_blank" rel="noreferrer" className="ea-link" title={link.handle || text}>
                  {text}
                </a>
              ) : (
                <span className="ea-link is-static" title={link.handle || text}>
                  {link.handle || text}
                </span>
              )}
            </motion.li>
          </Fragment>
        );
      })}
    </ul>
  );
}

/* ----------------------------- Self-Writing Letter & 4-Beat Envelope ----------------------------- */

function tomorrowLabel() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

const pad2 = (v) => String(v).padStart(2, '0');

function Envelope({ date, sealText, postmarkText, onClickOpen }) {
  const { reduceMotion } = useEliasProfile();
  const timing = (delay, duration) => (reduceMotion ? { duration: 0.01 } : { delay, duration, ease: EASE });

  return (
    <button type="button" className="ea-envelope-btn" onClick={onClickOpen} aria-label="Mở bức thư tiếp theo">
      <span aria-hidden="true" className="ea-envelope">
        <motion.span
          className="ea-envelope-letter"
          initial={{ transform: 'translateY(-78%)' }}
          animate={{ transform: 'translateY(6%)' }}
          transition={timing(0.2, 1.05)}
        />
        <span className="ea-envelope-side ea-envelope-left" />
        <span className="ea-envelope-side ea-envelope-right" />
        <span className="ea-envelope-bottom" />
        <motion.span
          className="ea-envelope-flap"
          initial={{ transform: 'rotateX(180deg)', opacity: 0 }}
          animate={{ transform: 'rotateX(0deg)', opacity: 1 }}
          transition={timing(1.2, 0.95)}
        >
          <span className="ea-envelope-flap-shape" />
        </motion.span>
        <motion.span
          className="ea-wax-seal"
          initial={{ transform: 'scale(2.2)', opacity: 0 }}
          animate={{ transform: 'scale(1)', opacity: 1 }}
          transition={timing(2.25, 0.55)}
        >
          {sealText}
        </motion.span>
        <motion.span
          className="ea-postmark"
          initial={{ transform: 'scale(1.7) rotate(-34deg)', opacity: 0 }}
          animate={{ transform: 'scale(1) rotate(-12deg)', opacity: 1 }}
          transition={timing(2.75, 0.55)}
        >
          <span>{postmarkText}</span>
          <span className="ea-postmark-date">{date}</span>
        </motion.span>
      </span>
    </button>
  );
}

function TomorrowLetter() {
  const { member, onScreen, reduceMotion } = useEliasProfile();
  const letter = member.letter || {};
  const messages = Array.isArray(letter.messages) && letter.messages.length > 0
    ? letter.messages
    : [letter.body || 'Hẹn cả nhóm một buổi chiều thật chill nhé!'];

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [stage, setStage] = useState('typing');
  const waitedRef = useRef({ step: '', ms: 0 });

  const safeIndex = index % messages.length;
  const message = messages[safeIndex] || '';
  const shown = reduceMotion ? message : message.slice(0, typed);
  const finished = shown.length >= message.length;
  const swap = reduceMotion ? { duration: 0.01 } : { duration: 0.72, ease: EASE };
  const timing = MOTION_CFG.letter;

  useEffect(() => {
    setIndex(0);
    setTyped(0);
    setStage('typing');
    waitedRef.current = { step: '', ms: 0 };
  }, [member.id, letter.body]);

  useEffect(() => {
    if (reduceMotion || !onScreen) return;
    let delay;
    let step;

    if (stage === 'typing' && typed < message.length) {
      const previous = message[typed - 1] ?? '';
      delay = timing.perCharacter + (/[,.!?]/.test(previous) ? timing.pauseAfterPunctuation : 0);
      step = () => setTyped((count) => count + 1);
    } else if (stage === 'typing') {
      delay = timing.beforeSeal;
      step = () => setStage('pressing');
    } else if (stage === 'pressing') {
      delay = timing.press;
      step = () => setStage('sealing');
    } else {
      delay = timing.sealHold;
      step = () => {
        setIndex((current) => (current + 1) % messages.length);
        setTyped(0);
        setStage('typing');
      };
    }

    const key = `${safeIndex}:${stage}:${typed}`;
    const waited = waitedRef.current.step === key ? waitedRef.current.ms : 0;
    const begun = performance.now() - waited;
    const timer = window.setTimeout(step, Math.max(0, delay * 1000 - waited));

    return () => {
      waitedRef.current = { step: key, ms: performance.now() - begun };
      window.clearTimeout(timer);
    };
  }, [reduceMotion, onScreen, safeIndex, stage, typed, message, messages.length, timing]);

  const dateLabel = tomorrowLabel();

  return (
    <motion.section
      aria-label={letter.eyebrow || 'Lời nhắn gửi nhóm'}
      className="ea-pad"
      initial={reduceMotion ? false : { clipPath: 'inset(0% 0% 0% 100%)' }}
      animate={{ clipPath: 'inset(-10% -10% 0% -10%)' }}
      transition={reveal(reduceMotion, MOTION_CFG.delays.pad, 1.05)}
    >
      <p className="sr-only">{`${letter.greeting || ''} ${messages[0]}`}</p>

      <div className="ea-pad-inner">
        <AnimatePresence mode="wait" initial={false}>
          {stage !== 'sealing' ? (
            <motion.div
              key={`sheet-${safeIndex}`}
              className="ea-letter-sheet"
              initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(28px) rotate(-1.4deg)' }}
              animate={{ opacity: 1, transform: 'translateY(0px) rotate(-1.4deg)' }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(40px) scale(0.94) rotate(-1.4deg)' }}
              transition={swap}
            >
              <p className="ea-letter-eyebrow">{letter.eyebrow || 'Lời nhắn gửi nhóm'}</p>
              <button
                type="button"
                className={cn('ea-letter-stamp', finished && 'is-ready', stage === 'pressing' && 'is-pressed')}
                onClick={() => {
                  if (!finished) {
                    setTyped(message.length);
                  } else {
                    setStage('sealing');
                  }
                }}
                title={finished ? 'Đóng dấu & niêm phong' : 'Hiện toàn bộ lời nhắn'}
              >
                {(letter.stamp || 'Gửi tới\nCả Nhóm').split('\n').map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </button>
              <p className="ea-letter-greeting">{letter.greeting || 'Gửi cả nhóm,'}</p>
              <p className="ea-letter-field ea-letter-read">
                {shown}
                {stage === 'typing' && !reduceMotion && <span className="ea-letter-caret" />}
              </p>
              <div className="ea-letter-row">
                <p className="ea-letter-meta">
                  {(letter.counter || 'Lời nhắn')} {pad2(safeIndex + 1)} / {pad2(messages.length)}
                </p>
                <span className="ea-letter-sign">{letter.signoff || `— ${member.name}`}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`envelope-${safeIndex}`}
              className="ea-letter-envelope-view"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: '70%', rotate: 8 }}
              transition={reduceMotion ? { duration: 0.01 } : { duration: 0.85, ease: [0.6, 0, 0.35, 1] }}
            >
              <p className="ea-letter-eyebrow">
                {letter.sealing || 'Đang niêm phong'} · {dateLabel}
              </p>
              <Envelope
                date={dateLabel}
                sealText={letter.seal || member.name.slice(0, 4).toUpperCase()}
                postmarkText={letter.postmark || 'Sky Post'}
                onClickOpen={() => {
                  setIndex((current) => (current + 1) % messages.length);
                  setTyped(0);
                  setStage('typing');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* ----------------------------- Mini Frosted Folder Preview (Hero Slot) ----------------------------- */

function MiniFrostedFolderCard({ onOpenFolder }) {
  const { member, memberIndex, reduceMotion } = useEliasProfile();
  const books = Array.isArray(member.books) ? member.books : [];
  const previewSheet = books[0];
  const [hovered, setHovered] = useState(false);

  const craftLabel = (member.craft || 'FISH').toUpperCase();
  const folderCode = `HỒ SƠ ${String(memberIndex + 1).padStart(2, '0')}`;

  return (
    <figure className="ea-book">
      <motion.button
        type="button"
        aria-label={`Mở ${folderCode} của ${member.name}`}
        className="ea-book-frame ea-mini-folder-frame"
        initial={reduceMotion ? false : { clipPath: 'inset(0% 0% 100% 0%)' }}
        animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        transition={reveal(reduceMotion, MOTION_CFG.delays.book, 1.0)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onOpenFolder}
      >
        <span aria-hidden="true" className="ea-mini-folder-stage">
          <span className="ea-mini-folder-shell">
            <span className="ea-mini-folder-back" />
            <span className="ea-mini-folder-tab" />
            <motion.span
              className="ea-mini-folder-sheet-back"
              animate={reduceMotion ? undefined : { y: hovered ? -6 : 0, rotate: hovered ? -2.2 : -1.2 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            />
            <motion.span
              className="ea-mini-folder-sheet-front"
              animate={reduceMotion ? undefined : { y: hovered ? -12 : 0, rotate: hovered ? 2.4 : 1.1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              {previewSheet?.image ? (
                <img src={previewSheet.image} alt="" />
              ) : (
                <FolderSheetArt
                  art={previewSheet?.art || 'sunrise'}
                  label={previewSheet?.label || 'Hồ sơ'}
                  coverLines={previewSheet?.coverLines || []}
                />
              )}
            </motion.span>
            <span className="ea-mini-folder-cover">
              <span className="ea-mini-folder-spine" />
              <span className="ea-mini-folder-clip-top" />
              <span className="ea-mini-folder-clip-side" />
              <span className="ea-mini-folder-cover-meta">
                <strong>{folderCode}</strong>
                <span>{member.name} · 04 TỜ</span>
              </span>
              <span className="ea-mini-folder-wordmark">{craftLabel}</span>
            </span>
          </span>
        </span>
      </motion.button>

      <figcaption className="ea-book-caption">
        <motion.span
          className="ea-book-label"
          initial={reduceMotion ? false : { opacity: 0, transform: 'translateX(-12px)' }}
          animate={{ opacity: 1, transform: 'translateX(0px)' }}
          transition={reveal(reduceMotion, MOTION_CFG.delays.book + 0.35, 0.75)}
        >
          Hồ sơ cá nhân
        </motion.span>

        <motion.span
          className="ea-book-topics"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reveal(reduceMotion, MOTION_CFG.delays.book + 0.45, 0.75)}
        >
          <span>{books.length || 4} tờ kỷ niệm</span>
          <span aria-hidden="true" className="ea-sep">
            {' / '}
          </span>
          <span>Mở túi nhựa</span>
        </motion.span>

        <motion.button
          type="button"
          onClick={onOpenFolder}
          aria-label="Cuộn xuống mở hồ sơ cá nhân"
          title="Mở hồ sơ cá nhân"
          className="ea-book-arrow"
          initial={reduceMotion ? false : { transform: 'scale(0) rotate(-90deg)' }}
          animate={{ transform: 'scale(1) rotate(0deg)' }}
          transition={reveal(reduceMotion, MOTION_CFG.delays.book + 0.55, 0.7)}
        >
          <span className="ea-cta-mark ea-cta-diagonal">
            <ArrowUpRightSvg className="ea-cta-arrow ea-cta-arrow-out" strokeWidth={2} />
            <ArrowUpRightSvg className="ea-cta-arrow ea-cta-arrow-in" strokeWidth={2} />
          </span>
        </motion.button>
      </figcaption>
    </figure>
  );
}

/* ----------------------------- Main Root ----------------------------- */

function computeLineScale(text, maxCharsBase) {
  const len = String(text || '').trim().length;
  if (len <= maxCharsBase) return 1;
  return Math.max(0.66, Number((maxCharsBase / len).toFixed(3)));
}

export default function FishProfileView({
  member,
  members = [],
  currentMemberId,
  onSelectMember,
  onBack,
  onUpdateMember,
}) {
  const systemReduced = useReducedMotion();
  const mediaReduced = useMediaQuery(MEDIA.reducedMotion);
  const reduceMotion = Boolean(systemReduced || mediaReduced);
  const finePointer = useMediaQuery(MEDIA.finePointer);
  const composition = useMediaQuery(MEDIA.composition);

  const rawUid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const duotoneId = `ea-duotone-${rawUid}`;
  const outlineId = `ea-outline-${rawUid}`;

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState('basic');
  const [editorBookIdx, setEditorBookIdx] = useState(0);
  const [folderOpen, setFolderOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [spotReady, setSpotReady] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const spotOpenRef = useRef(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const depthX = useSpring(pointerX, DEPTH_SPRING);
  const depthY = useSpring(pointerY, DEPTH_SPRING);
  const firstX = useTransform(depthX, (value) => value * -MOTION_CFG.depth.first);
  const firstY = useTransform(depthY, (value) => value * -MOTION_CFG.depth.first * 0.4);
  const lastX = useTransform(depthX, (value) => value * -MOTION_CFG.depth.last);
  const lastY = useTransform(depthY, (value) => value * -MOTION_CFG.depth.last * 0.3);
  const portraitX = useTransform(depthX, (value) => value * MOTION_CFG.depth.portrait);

  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const spotRadius = useMotionValue(0);
  const spotCentreX = useSpring(spotX, SPOT_SPRING);
  const spotCentreY = useSpring(spotY, SPOT_SPRING);
  const spotXVar = useMotionTemplate`${spotCentreX}px`;
  const spotYVar = useMotionTemplate`${spotCentreY}px`;
  const spotRadiusVar = useMotionTemplate`${spotRadius}px`;

  const isOwner = Boolean(member && currentMemberId === member.id);
  const memberIndex = members.findIndex((m) => m.id === member?.id);

  useEffect(() => {
    setEditorOpen(false);
    setEditorTab('basic');
    setEditorBookIdx(0);
    setFolderOpen(false);
    setSpotReady(false);
    spotOpenRef.current = false;
    spotRadius.jump(0);
    const timer = window.setTimeout(() => setSpotReady(true), MOTION_CFG.spotlight.readyAfter * 1000);
    return () => window.clearTimeout(timer);
  }, [member?.id, spotRadius]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let visible = true;
    const update = () => setOnScreen(visible && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    observer.observe(section);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  useEffect(() => {
    if (!savedToast) return;
    const timer = window.setTimeout(() => setSavedToast(false), 3200);
    return () => window.clearTimeout(timer);
  }, [savedToast]);

  const firstName = member?.displayFirst || member?.name || '';
  const lastName = member?.displayLast || member?.nickname || member?.craft || 'Fish';

  const firstScale = useMemo(() => computeLineScale(firstName, 6), [firstName]);
  const lastScale = useMemo(() => computeLineScale(lastName, 8), [lastName]);

  const openEditorAt = useCallback((tabName = 'basic', bookIdx = 0) => {
    setEditorTab(tabName);
    setEditorBookIdx(bookIdx);
    setEditorOpen(true);
  }, []);

  const folderSheets = useMemo(() => {
    const books = Array.isArray(member?.books) ? member.books : [];
    return books.map((book, idx) => ({
      id: book.id || `sheet-${idx}`,
      image: book.image || '',
      alt: book.chapterTitle || book.title || book.label,
      code: book.chapter || `0${idx + 1}`,
      label: book.label,
      title: book.chapterTitle || book.label || book.title,
      detail: (book.topics || []).slice(0, 2).join(' · ') || book.label,
      fullText: book.text,
      topics: book.topics || [],
      art: book.art || 'sunrise',
      coverLines: book.coverLines || [],
    }));
  }, [member?.books]);

  const scrollAndOpenFolder = useCallback(() => {
    setFolderOpen(true);
    const el = document.getElementById('fish-folder-lookbook');
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
  }, [reduceMotion]);

  const ctxValue = useMemo(
    () => ({
      member,
      members,
      memberIndex: Math.max(0, memberIndex),
      isOwner,
      onBack,
      onSelectMember,
      onOpenEditor: () => openEditorAt('basic', 0),
      reduceMotion,
      onScreen,
    }),
    [member, members, memberIndex, isOwner, onBack, onSelectMember, openEditorAt, reduceMotion, onScreen],
  );

  if (!member) return null;

  const portraitSrc = member.customPhoto || member.cutoutPhoto || member.defaultPhoto;
  const portraitWidth = member.cutoutWidth || 1025;
  const portraitHeight = member.cutoutHeight || 1535;

  const depthActive = finePointer && !reduceMotion && !editorOpen;
  const spotActive = depthActive && composition && spotReady;
  const cursorActive = finePointer && !reduceMotion && !editorOpen;

  const spotStyle = {
    '--ea-spot-x': spotXVar,
    '--ea-spot-y': spotYVar,
    '--ea-spot-r': spotRadiusVar,
    '--ea-first-scale': firstScale,
    '--ea-last-scale': lastScale,
  };

  const handlePointerMove = (event) => {
    if (!depthActive) return;
    pointerX.set((event.clientX / window.innerWidth) * 2 - 1);
    pointerY.set((event.clientY / window.innerHeight) * 2 - 1);

    if (!spotActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

    if (inside) {
      spotX.set(x);
      spotY.set(y);
    }

    if (inside !== spotOpenRef.current) {
      spotOpenRef.current = inside;
      animate(spotRadius, inside ? MOTION_CFG.spotlight.radius : 0, {
        duration: inside ? 0.55 : 0.45,
        ease: EASE,
      });
    }
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    spotOpenRef.current = false;
    animate(spotRadius, 0, { duration: 0.45, ease: EASE });
  };

  const handleSaveProfile = async (patch) => {
    if (!isOwner) return { ok: false, error: 'Chỉ chủ hồ sơ mới được chỉnh sửa.' };
    const result = await onUpdateMember?.(member.id, patch);
    if (!result || result.ok !== false) setSavedToast(true);
    return result;
  };

  return (
    <EliasProfileContext.Provider value={ctxValue}>
      <motion.div
        className="ea-fullbleed"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.3 }}
      >
        <section
          ref={sectionRef}
          key={member.id}
          aria-label={`${firstName} ${lastName}`}
          className={cn('ea-hero', cursorActive && 'ea-has-cursor')}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <AuthorInkFilters duotoneId={duotoneId} outlineId={outlineId} />
          {cursorActive && <InkCursor />}

          <HeroNavbar />

          <AnimatePresence>
            {savedToast && (
              <motion.div
                className="ea-saved-toast"
                role="status"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckSvg size={15} />
                <span>Đã lưu hồ sơ của bạn</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ea-wrap ea-stage">
            <motion.div ref={canvasRef} className="ea-canvas" style={spotStyle}>
              <div className="ea-figure">
                <div className="ea-layer ea-layer-name ea-layer-base">
                  <h1 className="ea-name">
                    <span className="sr-only">{`${firstName} ${lastName}`}</span>
                    <motion.span className="ea-name-first" style={{ x: firstX, y: firstY }}>
                      <MaskedWord text={firstName} delay={MOTION_CFG.delays.first} from="below" />
                    </motion.span>
                    <motion.span className="ea-name-last" style={{ x: lastX, y: lastY }}>
                      <MaskedWord text={lastName} delay={MOTION_CFG.delays.last} from="above" reverse />
                    </motion.span>
                  </h1>
                </div>

                {spotActive && (
                  <div aria-hidden="true" className="ea-layer ea-layer-name ea-layer-ink">
                    <div className="ea-name">
                      <motion.span
                        className="ea-name-first ea-ink-first"
                        style={{ x: firstX, y: firstY, filter: `url(#${outlineId})` }}
                      >
                        {firstName}
                      </motion.span>
                      <motion.span
                        className="ea-name-last ea-ink-last"
                        style={{ x: lastX, y: lastY, filter: `url(#${outlineId})` }}
                      >
                        {lastName}
                      </motion.span>
                    </div>
                  </div>
                )}

                <div className="ea-layer ea-layer-portrait ea-layer-base">
                  {portraitSrc && (
                    <motion.img
                      src={portraitSrc}
                      alt={`Chân dung tách nền của ${member.name}`}
                      width={portraitWidth}
                      height={portraitHeight}
                      fetchPriority="high"
                      decoding="async"
                      className="ea-portrait"
                      style={{ x: portraitX, transformOrigin: 'bottom center' }}
                      initial={reduceMotion ? false : { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 }}
                      animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
                      transition={reveal(reduceMotion, MOTION_CFG.delays.portrait, 1.2)}
                    />
                  )}
                </div>

                {spotActive && portraitSrc && (
                  <div aria-hidden="true" className="ea-layer ea-layer-portrait ea-layer-ink">
                    <motion.img
                      src={portraitSrc}
                      alt=""
                      width={portraitWidth}
                      height={portraitHeight}
                      decoding="async"
                      className="ea-portrait ea-ink-portrait"
                      style={{ x: portraitX, filter: `url(#${duotoneId})` }}
                    />
                  </div>
                )}
              </div>

              <AuthorIntro />
              <TomorrowLetter />
              <MiniFrostedFolderCard onOpenFolder={scrollAndOpenFolder} />
              <SocialLinks />
            </motion.div>
          </div>
        </section>

        <FrostedFolderLookbook
          id="fish-folder-lookbook"
          title={`HỒ SƠ ${String(Math.max(0, memberIndex) + 1).padStart(2, '0')}`}
          subtitle={`${member.name} · ${member.role || member.craft || 'Fish'}`}
          line="FISH UPON THE SKY · 2026"
          footer="GÓC YÊU THÍCH & KỶ NIỆM"
          wordmark={(member.craft || 'FISH').toUpperCase()}
          openLabel="Mở hồ sơ cá nhân"
          closeLabel="Đóng hồ sơ lại"
          sheets={folderSheets}
          open={folderOpen}
          onOpenChange={setFolderOpen}
          isOwner={isOwner}
          onEditSheet={(idx) => openEditorAt('books', idx)}
          height="min(82svh, 660px)"
        />

        <AnimatePresence>
          {isOwner && editorOpen && (
            <FishProfileEditor
              member={member}
              initialTab={editorTab}
              initialBookIdx={editorBookIdx}
              onSave={handleSaveProfile}
              onClose={() => setEditorOpen(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </EliasProfileContext.Provider>
  );
}
