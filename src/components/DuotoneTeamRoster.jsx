import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Duotone Team Roster — adapted from 21st.dev DuotoneTeamRoster to
 * Fish Upon The Sky's MP174 design tokens with Framer Motion entrance.
 */

export const DEFAULT_LABELS = {
  pause: 'Pause',
  play: 'Play',
  team: 'The Fishes',
  openRole: 'Open role',
  hiring: 'Hiring',
  roleLink: 'See the role',
  memberLink: 'View fish',
};

export const PRESETS = {
  mp174: {
    ground: '#0B1842',
    deep: '#112358',
    hot: '#0192C6',
    glow: '#F1FF62',
    ink: '#F4F5FA',
    shadow: '#091436',
    mid: '#0192C6',
    highlight: '#D4EAFF',
  },
  ember: {
    ground: '#170403',
    deep: '#4f0d06',
    hot: '#ee7a1c',
    glow: '#ffb54a',
    ink: '#fff0c8',
    shadow: '#260604',
    highlight: '#ffe2ad',
  },
  cobalt: {
    ground: '#03061f',
    deep: '#0d1c6e',
    hot: '#2e57f5',
    glow: '#86a6ff',
    ink: '#eef1ff',
    shadow: '#050b33',
    highlight: '#d9e3ff',
  },
  moss: {
    ground: '#061008',
    deep: '#163519',
    hot: '#5d8a35',
    glow: '#c3d66e',
    ink: '#f3f6dd',
    shadow: '#08170b',
    highlight: '#eef3c4',
  },
  mono: {
    ground: '#090909',
    deep: '#262626',
    hot: '#8c8c8c',
    glow: '#e0e0e0',
    ink: '#fafafa',
    shadow: '#0d0d0d',
    highlight: '#f4f4f4',
  },
};

export function resolvePalette(preset, overrides) {
  const base = PRESETS[preset] || PRESETS.mp174;
  const out = Object.assign({}, base);
  if (overrides) {
    for (const k of Object.keys(base)) {
      if (overrides[k]) out[k] = overrides[k];
    }
    if (overrides.mid) out.mid = overrides.mid;
  }
  return out;
}

export function hexToUnit(hex) {
  let h = String(hex || '').trim().replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [0, 0, 0];
  return [0, 2, 4].map((i) => Math.round((parseInt(h.slice(i, i + 2), 16) / 255) * 1000) / 1000);
}

export function mixHex(a, b, t) {
  const x = hexToUnit(a);
  const y = hexToUnit(b);
  return (
    '#' +
    [0, 1, 2]
      .map((i) => Math.round((x[i] + (y[i] - x[i]) * t) * 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function tritoneTables(shadow, mid, highlight) {
  const s = hexToUnit(shadow);
  const m = hexToUnit(mid);
  const h = hexToUnit(highlight);
  return [0, 1, 2].map((c) => `${s[c]} ${m[c]} ${h[c]}`);
}

export function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function dealColumns(count, roleCount, columns, minPerColumn) {
  const cols = Math.max(1, Math.floor(columns) || 1);
  const deck = [];
  for (let i = 0; i < count; i++) deck.push({ kind: 'member', index: i });
  for (let r = 0; r < roleCount; r++) {
    const at = Math.min(deck.length, Math.round(((r + 1) * (count + roleCount)) / (roleCount + 1)) - 1 + r);
    deck.splice(Math.max(0, at), 0, { kind: 'role', index: r });
  }
  const out = [];
  for (let c = 0; c < cols; c++) out.push([]);
  deck.forEach((d, i) => out[i % cols].push({ kind: d.kind, index: d.index, dup: false }));
  if (!deck.length) return out;
  for (let c = 0; c < cols; c++) {
    let from = (c + Math.floor(cols / 2) + (cols % 2 ? 1 : 0)) % cols;
    if (cols === 1) from = 0;
    const pool = out[from].filter((e) => !e.dup).slice().reverse();
    const rest = deck.map((d) => ({ kind: d.kind, index: d.index, dup: false })).reverse();
    const candidates = pool.concat(rest);
    let k = 0;
    let guard = 0;
    while (out[c].length < minPerColumn && guard < candidates.length * 3) {
      const d = candidates[k % candidates.length];
      k++;
      guard++;
      const clash = out[c].some((e) => e.kind === d.kind && e.index === d.index);
      if (clash && guard < candidates.length) continue;
      out[c].push({ kind: d.kind, index: d.index, dup: true });
    }
  }
  return out;
}

export function fitTitleSize(available, widestAt100, stretch, min, max) {
  if (!(available > 0) || !(widestAt100 > 0)) return min;
  const size = (available / (widestAt100 * (stretch > 0 ? stretch : 1))) * 100;
  return Math.max(min, Math.min(max, Math.floor(size * 10) / 10));
}

export function layoutFor(width, columns) {
  if (width > 0 && width < 700) return 0;
  const wanted = Math.max(2, Math.min(4, Math.round(columns) || 3));
  if (width > 0 && width < 1000) return 2;
  return wanted;
}

export function splitLines(title) {
  return String(title || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

function bringIntoView(card) {
  const frame = card.closest('.dtr-wall, .dtr-strip');
  const track = card.closest('.dtr-track, .dtr-strip-track');
  if (!frame || !track) return;
  const f = frame.getBoundingClientRect();
  const r = card.getBoundingClientRect();
  const vertical = track.classList.contains('dtr-track');
  const now = getComputedStyle(track).translate;
  const parts = !now || now === 'none' ? ['0', '0'] : now.split(' ');
  let x = parseFloat(parts[0]) || 0;
  let y = parseFloat(parts[1] || '0') || 0;
  const m = 24;
  if (vertical) {
    if (r.top < f.top + m) y += f.top + m - r.top;
    else if (r.bottom > f.bottom - m) y -= r.bottom - (f.bottom - m);
  } else {
    if (r.left < f.left + m) x += f.left + m - r.left;
    else if (r.right > f.right - m) x -= r.right - (f.right - m);
  }
  track.style.translate = Math.round(x) + 'px ' + Math.round(y) + 'px';
}

function releaseNudge(card) {
  const track = card.closest('.dtr-track, .dtr-strip-track');
  if (track) track.style.translate = '';
}

function Portrait({ slot, on, filterId, labels, onEnter, onLeave, onToggle, onSelect, follows }) {
  const [failed, setFailed] = React.useState(false);
  const pointer = React.useRef('mouse');
  const panelId = 'p' + React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const hidden = slot.dup;
  const isRole = slot.kind === 'role';
  const member = slot.kind === 'member' ? slot.member : null;
  const role = slot.kind === 'role' ? slot.role : null;
  const craft = member ? member.craft || member.role : role ? role.craft || labels.hiring : '';
  const label = member ? member.name + ', ' + member.role : role ? labels.openRole + ': ' + role.title : '';
  const photo = member && member.photo && !failed ? member.photo : '';
  const href = member ? member.href : role ? role.href : undefined;
  const linkLabel = member ? member.linkLabel || labels.memberLink : (role && role.linkLabel) || labels.roleLink;
  const exposure = member && member.exposure && member.exposure > 0 ? member.exposure : 1;
  const focus = (member && member.focus) || '50% 22%';
  const followable = follows && Boolean(href) && !/^mailto:/i.test(String(href));
  const clickable = Boolean((member && onSelect) || followable);

  const follow = (card) => {
    const a = card.querySelector('.dtr-panel a');
    if (a) a.click();
  };

  return (
    <div
      className={'dtr-card' + (isRole ? ' dtr-role' : '')}
      data-on={on ? '' : undefined}
      data-click={clickable ? '' : undefined}
      aria-hidden={hidden ? true : undefined}
      style={{ '--dtr-cw': Math.min(26, craft.length) * 0.74 + 2.2 + 'em' }}
      onPointerDown={(e) => {
        pointer.current = e.pointerType;
      }}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        bringIntoView(e.currentTarget);
        onEnter(slot.key);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return;
        onLeave(slot.key);
        if (!e.currentTarget.contains(document.activeElement)) releaseNudge(e.currentTarget);
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        onLeave(slot.key);
        releaseNudge(e.currentTarget);
      }}
    >
      <div className="dtr-photo">
        {photo ? (
          <>
            <img
              className="dtr-duo"
              src={photo}
              alt=""
              width={720}
              height={960}
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{
                filter: (exposure !== 1 ? 'brightness(' + exposure + ') ' : '') + 'url(#' + filterId + ')',
                objectPosition: focus,
              }}
              onError={() => setFailed(true)}
            />
            <img
              className="dtr-true"
              src={photo}
              alt=""
              width={720}
              height={960}
              loading="lazy"
              decoding="async"
              draggable={false}
              style={{ objectPosition: focus }}
            />
          </>
        ) : (
          <div className="dtr-plate" aria-hidden="true">
            <span>{member ? initials(member.name) : (role && role.mark) || 'You?'}</span>
            {role ? <em>{role.title}</em> : null}
          </div>
        )}
      </div>
      <span className="dtr-chip" aria-hidden="true">
        {craft}
      </span>
      <button
        type="button"
        className="dtr-hit"
        tabIndex={hidden ? -1 : 0}
        aria-label={label}
        aria-expanded={hidden ? undefined : on}
        aria-controls={panelId}
        onFocus={(e) => {
          if (!e.currentTarget.matches(':focus-visible')) return;
          onEnter(slot.key);
          bringIntoView(e.currentTarget.parentElement);
        }}
        onClick={(e) => {
          const card = e.currentTarget.parentElement;
          if (e.detail === 0) {
            if (!on) {
              onEnter(slot.key);
              bringIntoView(card);
            } else if (member && onSelect) {
              onSelect(member);
            } else {
              const a = card.querySelector('.dtr-panel a');
              if (a) a.focus();
            }
            return;
          }
          if (pointer.current === 'mouse') {
            if (member && onSelect) {
              onSelect(member);
              return;
            }
            if (followable) follow(card);
            return;
          }
          if (!on) {
            bringIntoView(card);
            onToggle(slot.key);
          } else if (member && onSelect) {
            onSelect(member);
          } else {
            onToggle(slot.key);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onLeave(slot.key);
        }}
      />
      <div
        className="dtr-panel"
        id={panelId}
        aria-hidden={on ? undefined : true}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return;
          const btn = e.currentTarget.parentElement?.querySelector('.dtr-hit');
          if (btn) btn.focus();
          onLeave(slot.key);
        }}
      >
        <p className="dtr-name">{member ? member.name : role ? role.title : ''}</p>
        {member || (role && role.note) ? <p className="dtr-roleline">{member ? member.role : role ? role.note : ''}</p> : null}
        {member && member.bio ? <p className="dtr-bio">{member.bio}</p> : null}
        {href ? (
          <a href={href} tabIndex={hidden || !on ? -1 : 0}>
            {linkLabel} <span aria-hidden="true">↗</span>
          </a>
        ) : member && onSelect ? (
          <button
            type="button"
            className="dtr-panel-btn"
            tabIndex={hidden || !on ? -1 : 0}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(member);
            }}
          >
            {linkLabel} <span aria-hidden="true">↗</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function DuotoneTeamRoster({
  members = [],
  openRoles = [],
  eyebrow = '07 FISHES',
  title = 'The\nFishes',
  intro = 'Seven friends sharing one sky.',
  cta = { label: 'Our sky', href: '#our-sky' },
  secondaryCta = null,
  onCtaClick,
  preset = 'mp174',
  palette,
  columns = 3,
  driftSeconds = 10,
  drift = true,
  height = 'min(82svh, 740px)',
  fontFamily = 'var(--font-display)',
  stretch = 1,
  uppercase = true,
  grain = true,
  labels,
  className = '',
  onMemberSelect,
  clickFollowsLink = true,
}) {
  const reduceMotion = useReducedMotion();
  const pal = resolvePalette(preset, palette);
  const text = { ...DEFAULT_LABELS, ...(labels || {}) };
  const rawId = React.useId();
  const uid = 'dtr' + rawId.replace(/[^a-zA-Z0-9]/g, '');
  const filterId = uid + '-tone';
  const titleId = uid + '-title';
  const rootRef = React.useRef(null);
  const copyRef = React.useRef(null);
  const titleRef = React.useRef(null);
  const [cols, setCols] = React.useState(layoutFor(0, columns));
  const [titleSize, setTitleSize] = React.useState(0);
  const [active, setActive] = React.useState(null);
  const [paused, setPaused] = React.useState(false);
  const [outOfView, setOutOfView] = React.useState(false);
  const [tabHidden, setTabHidden] = React.useState(false);
  const offscreen = outOfView || tabHidden;

  const lines = splitLines(title);
  const mid = (palette && palette.mid) || pal.mid || mixHex(pal.hot, pal.highlight, 0.35);
  const tables = tritoneTables(mixHex(pal.shadow, pal.deep, 0.4), mid, mixHex(pal.highlight, pal.ink, 0.5));
  const still = !drift || !(driftSeconds > 0);
  const copies = still ? [0] : [0, 1];
  const [minPer, setMinPer] = React.useState(4);
  const plan = React.useMemo(
    () => dealColumns(members.length, openRoles.length, cols || 1, cols && !still ? minPer : 0),
    [members.length, openRoles.length, cols, minPer, still],
  );

  const slotFor = (e, prefix) =>
    e.kind === 'role'
      ? { key: prefix, kind: 'role', role: openRoles[e.index], dup: e.dup }
      : { key: prefix, kind: 'member', member: members[e.index], dup: e.dup };

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    const copy = copyRef.current;
    const head = titleRef.current;
    if (!root || !copy || !head) return;
    const fit = () => {
      const w = root.getBoundingClientRect().width;
      const next = layoutFor(w, columns);
      setCols((c) => (c === next ? c : next));
      const spans = head.querySelectorAll('.dtr-line > span');
      let widest = 0;
      const cur = parseFloat(getComputedStyle(head).fontSize) || 100;
      spans.forEach((s) => {
        widest = Math.max(widest, s.offsetWidth);
      });
      const widestAt100 = (widest / cur) * 100;
      const cs = getComputedStyle(copy);
      const avail = copy.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = root.getBoundingClientRect().height;
      const strip = next === 0;
      if (next > 0) {
        const wallW = root.getBoundingClientRect().width * (next === 2 ? 0.5 : 0.58);
        const cardH = ((wallW - 14 * (next + 1)) / next) * (4 / 3) + 14;
        const need = Math.max(3, Math.ceil(h / Math.max(80, cardH)));
        setMinPer((m) => (m === need ? m : need));
      }
      const maxByHeight = strip ? 180 : Math.max(56, (h * 0.5) / Math.max(1, lines.length + 0.45));
      const overhang = strip ? 1 : 1.12;
      setTitleSize(fitTitleSize(avail * overhang, widestAt100, stretch, 40, Math.min(240, maxByHeight)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(root);
    let alive = true;
    document.fonts?.ready.then(() => alive && fit());
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [columns, stretch, title, fontFamily, uppercase, lines.length]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setOutOfView(!entry.isIntersecting), { threshold: 0 });
    io.observe(root);
    const vis = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', vis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  const onEnter = React.useCallback((key) => setActive(key), []);
  const onLeave = React.useCallback((key) => setActive((a) => (a === key ? null : a)), []);
  const onToggle = React.useCallback((key) => setActive((a) => (a === key ? null : key)), []);

  React.useEffect(() => {
    if (!active) return;
    const down = (e) => {
      if (e.pointerType === 'mouse') return;
      const t = e.target;
      if (!t || !t.closest || !t.closest('.dtr-card')) setActive(null);
    };
    document.addEventListener('pointerdown', down);
    return () => document.removeEventListener('pointerdown', down);
  }, [active]);

  const rootStyle = {
    '--dtr-ground': pal.ground,
    '--dtr-deep': pal.deep,
    '--dtr-hot': pal.hot,
    '--dtr-glow': pal.glow,
    '--dtr-ink': pal.ink,
    '--dtr-display': fontFamily,
    '--dtr-stretch': String(stretch),
    '--dtr-case': uppercase ? 'uppercase' : 'none',
    '--dtr-cols': String(cols || 1),
    '--dtr-ts': titleSize ? titleSize + 'px' : undefined,
    '--dtr-sdur': Math.max(8, (members.length + openRoles.length) * Math.max(1, driftSeconds) * 0.55) + 's',
    '--dtr-h': height,
    height: cols === 0 || still ? 'auto' : height,
    minHeight: cols === 0 ? undefined : still ? height : '580px',
  };

  const pauseButton = (
    <button
      type="button"
      className="dtr-pause"
      aria-pressed={paused}
      onClick={() => setPaused((p) => !p)}
    >
      <i aria-hidden="true" />
      {paused ? text.play : text.pause}
    </button>
  );

  const phases = [0, 0.38, 0.71, 0.18];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <section
        ref={rootRef}
        className={'dtr ' + className}
        style={rootStyle}
        aria-labelledby={titleId}
        data-mode={cols === 0 ? 'strip' : 'columns'}
        data-cols={cols || undefined}
        data-active={active ? '' : undefined}
        data-active-col={active && cols !== 0 ? active.split('-')[0] : undefined}
        data-paused={paused ? '' : undefined}
        data-static={still ? '' : undefined}
        data-offscreen={offscreen ? '' : undefined}
      >
        <svg className="dtr-defs" aria-hidden="true" focusable="false">
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0 0.13 0.5 0.9 1" />
              <feFuncG type="table" tableValues="0 0.13 0.5 0.9 1" />
              <feFuncB type="table" tableValues="0 0.13 0.5 0.9 1" />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="table" tableValues={tables[0]} />
              <feFuncG type="table" tableValues={tables[1]} />
              <feFuncB type="table" tableValues={tables[2]} />
            </feComponentTransfer>
          </filter>
        </svg>
        <div className="dtr-field" aria-hidden="true" />
        {grain ? <div className="dtr-grain" aria-hidden="true" /> : null}
        {cols !== 0 && !still ? pauseButton : null}

        <div className="dtr-in">
          <div className="dtr-copy" ref={copyRef}>
            <h2 className="dtr-title" id={titleId} ref={titleRef}>
              {eyebrow ? <span className="dtr-eyebrow">{eyebrow} </span> : null}
              {lines.map((l, i) => (
                <span className="dtr-line" key={i} style={{ '--i': i }}>
                  <span>
                    <span>{l}</span>
                  </span>
                  {i < lines.length - 1 ? ' ' : null}
                </span>
              ))}
            </h2>
            {intro ? <p className="dtr-intro">{intro}</p> : null}
            {cta || secondaryCta ? (
              <div className="dtr-actions">
                {cta ? (
                  onCtaClick ? (
                    <button type="button" className="dtr-cta" onClick={onCtaClick}>
                      <span className="dtr-cta-label">
                        <span>{cta.label}</span>
                        <span aria-hidden="true">{cta.label}</span>
                      </span>
                      <span className="dtr-cta-arrow" aria-hidden="true">
                        →
                      </span>
                    </button>
                  ) : (
                    <a className="dtr-cta" href={cta.href}>
                      <span className="dtr-cta-label">
                        <span>{cta.label}</span>
                        <span aria-hidden="true">{cta.label}</span>
                      </span>
                      <span className="dtr-cta-arrow" aria-hidden="true">
                        →
                      </span>
                    </a>
                  )
                ) : null}
                {secondaryCta ? (
                  <a className="dtr-link" href={secondaryCta.href}>
                    {secondaryCta.label}
                  </a>
                ) : null}
                {cols === 0 && !still ? pauseButton : null}
              </div>
            ) : null}
          </div>

          {cols === 0 ? (
            <div className="dtr-strip" role="group" aria-label={text.team}>
              <div className="dtr-strip-track">
                {copies.map((copy) =>
                  plan[0].map((e, i) => {
                    const slot = slotFor({ ...e, dup: e.dup || copy === 1 }, 's' + copy + '-' + i);
                    return (
                      <Portrait
                        key={slot.key}
                        slot={slot}
                        on={active === slot.key}
                        filterId={filterId}
                        labels={text}
                        onEnter={onEnter}
                        onLeave={onLeave}
                        onToggle={onToggle}
                        onSelect={onMemberSelect}
                        follows={clickFollowsLink}
                      />
                    );
                  }),
                )}
              </div>
            </div>
          ) : (
            <div className="dtr-wall" role="group" aria-label={text.team}>
              {plan.map((col, c) => {
                const dur = Math.max(6, col.length * Math.max(1, driftSeconds));
                const phase = phases[c % phases.length];
                return (
                  <div
                    className="dtr-col"
                    key={c}
                    data-dir={c % 2 ? 'down' : 'up'}
                    style={{
                      '--ci': c,
                      '--dtr-dur': dur + 's',
                      '--dtr-phase': -(dur * phase) + 's',
                      '--dtr-rest': c % 2 ? 1 - phase : phase,
                    }}
                  >
                    <div className="dtr-track">
                      {copies.map((copy) =>
                        col.map((e, i) => {
                          const slot = slotFor({ ...e, dup: e.dup || copy === 1 }, c + '-' + copy + '-' + i);
                          return (
                            <div key={slot.key}>
                              <Portrait
                                slot={slot}
                                on={active === slot.key}
                                filterId={filterId}
                                labels={text}
                                onEnter={onEnter}
                                onLeave={onLeave}
                                onToggle={onToggle}
                                onSelect={onMemberSelect}
                                follows={clickFollowsLink}
                              />
                            </div>
                          );
                        }),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
