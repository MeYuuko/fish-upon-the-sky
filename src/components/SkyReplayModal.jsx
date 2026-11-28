import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BrandIcon from './BrandIcon.jsx';

const CHAPTERS = [
  { id: 'numbers', code: '01', eyebrow: 'OUR SKY IN NUMBERS', title: 'Everything we shared' },
  { id: 'crew', code: '02', eyebrow: 'CREW SUPERLATIVES', title: 'The seven fishes' },
  { id: 'mosaic', code: '03', eyebrow: 'FRAMES ACROSS THE MONTHS', title: 'Sky mosaic' },
  { id: 'vault', code: '04', eyebrow: 'KEPT IN THE VAULT', title: 'Highlights & horizon' },
];

export default function SkyReplayModal({
  ripples = [],
  outings = [],
  polls = [],
  members = [],
  onClose,
  onNavigate,
  reduceMotion = false,
}) {
  const [chapterIndex, setChapterIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
      if (event.key === 'ArrowRight') setChapterIndex((i) => Math.min(CHAPTERS.length - 1, i + 1));
      if (event.key === 'ArrowLeft') setChapterIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const stats = useMemo(() => {
    const doneTrips = outings.filter((o) => o.status === 'Done').length;
    const echoCount = ripples.reduce(
      (sum, r) => sum + Object.values(r.reactions ?? {}).reduce((s, arr) => s + arr.length, 0),
      0,
    );
    const noteCount = ripples.reduce((sum, r) => sum + (r.notes?.length ?? 0), 0);
    const placeCount = outings.reduce((sum, o) => sum + (o.places?.length ?? 0), 0);
    return {
      ripples: ripples.length,
      trips: outings.length,
      doneTrips,
      echoesAndNotes: echoCount + noteCount,
      places: placeCount,
    };
  }, [ripples, outings]);

  const crewStats = useMemo(() => {
    const byMember = members.map((m) => {
      const myRipples = ripples.filter((r) => r.memberId === m.id);
      const rippleCount = myRipples.length;
      const echoesReceived = myRipples.reduce(
        (sum, r) => sum + Object.values(r.reactions ?? {}).reduce((s, arr) => s + arr.length, 0),
        0,
      );
      const pollResponses = polls.filter((p) => (p.votes?.[m.id]?.length ?? 0) > 0).length;
      return {
        member: m,
        rippleCount,
        echoesReceived,
        pollResponses,
      };
    });

    const maxRipples = Math.max(1, ...byMember.map((x) => x.rippleCount));
    const topPhotographer = [...byMember].sort((a, b) => b.rippleCount - a.rippleCount)[0] || null;
    const topVoter = [...byMember].sort((a, b) => b.pollResponses - a.pollResponses)[0] || null;
    const echoMagnet = [...byMember].sort((a, b) => b.echoesReceived - a.echoesReceived)[0] || null;

    return {
      byMember: [...byMember].sort((a, b) => b.rippleCount - a.rippleCount),
      maxRipples,
      topPhotographer,
      topVoter,
      echoMagnet,
    };
  }, [members, ripples, polls]);

  const mosaicFrames = useMemo(() => {
    const rippleFrames = ripples.map((r) => {
      const date = new Date(r.createdAt);
      const month = Number.isNaN(date.getTime())
        ? 'Live'
        : date.toLocaleDateString('en-US', { month: 'short' });
      const sender = members.find((m) => m.id === r.memberId);
      return {
        id: r.id,
        url: r.imageUrl,
        caption: r.caption || r.place || 'Sky Ripple',
        meta: `${month} · ${sender?.nickname || sender?.name || 'Fish'}`,
      };
    });

    const vaultFrames = outings.flatMap((o) =>
      (o.photos ?? [])
        .filter((p) => p?.url)
        .map((p) => ({
          id: `${o.id}-${p.id}`,
          url: p.url,
          caption: p.caption || o.title,
          meta: `${o.date || 'Vault'} · ${p.addedBy || 'Group'}`,
        })),
    );

    const seen = new Set();
    const combined = [];
    for (const item of [...rippleFrames, ...vaultFrames]) {
      if (!item.url || seen.has(item.url)) continue;
      seen.add(item.url);
      combined.push(item);
      if (combined.length >= 12) break;
    }
    return combined;
  }, [ripples, outings, members]);

  const highlights = useMemo(() => {
    const tripNotes = outings.flatMap((o) =>
      (o.notes ?? []).map((n) => ({
        id: `${o.id}-${n.id}`,
        text: n.text,
        meta: `${o.title} · ${n.author || 'Fish'}`,
      })),
    );
    const rippleCaptions = ripples
      .filter((r) => r.caption)
      .slice(0, 4)
      .map((r) => {
        const sender = members.find((m) => m.id === r.memberId);
        return {
          id: `rc-${r.id}`,
          text: r.caption,
          meta: `${r.place || 'Sky Ripple'} · ${sender?.nickname || sender?.name || 'Fish'}`,
        };
      });
    return [...tripNotes, ...rippleCaptions].slice(0, 6);
  }, [outings, ripples, members]);

  const chapter = CHAPTERS[chapterIndex];
  const progressPct = ((chapterIndex + 1) / CHAPTERS.length) * 100;

  return (
    <motion.div
      className="modal-backdrop sky-replay-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <motion.section
        className="sky-replay-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sky-replay-title"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ripples-hud-corners" aria-hidden="true">
          <span>+</span>
          <span>+</span>
          <span>+</span>
          <span>+</span>
        </div>

        <div className="sky-replay-progress" aria-hidden="true">
          <div className="sky-replay-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="sky-replay-head">
          <div>
            <span className="eyebrow">
              SKY REPLAY · CHAPTER {chapter.code} / 0{CHAPTERS.length} · {chapter.eyebrow}
            </span>
            <h2 id="sky-replay-title">{chapter.title}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close Sky Replay" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="sky-replay-body">
          <AnimatePresence mode="wait">
            {chapter.id === 'numbers' && (
              <motion.div
                key="numbers"
                className="sky-replay-stats"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="sky-replay-stat is-hero">
                  <BrandIcon name="futs-wave" size={22} />
                  <strong>{String(stats.ripples).padStart(2, '0')}</strong>
                  <span>Ripples dropped on the pond</span>
                </div>
                <div className="sky-replay-stat">
                  <BrandIcon name="futs-spark" size={20} />
                  <strong>{String(stats.trips).padStart(2, '0')}</strong>
                  <span>Outings &amp; plans tracked</span>
                </div>
                <div className="sky-replay-stat">
                  <BrandIcon name="futs-check-badge" size={20} />
                  <strong>{String(stats.doneTrips).padStart(2, '0')}</strong>
                  <span>Memories archived</span>
                </div>
                <div className="sky-replay-stat">
                  <BrandIcon name="futs-chat" size={20} />
                  <strong>{String(stats.echoesAndNotes).padStart(2, '0')}</strong>
                  <span>Bubbles &amp; float notes</span>
                </div>
                <div className="sky-replay-stat">
                  <BrandIcon name="futs-compass" size={20} />
                  <strong>{String(stats.places).padStart(2, '0')}</strong>
                  <span>Saved spots pinned</span>
                </div>
              </motion.div>
            )}

            {chapter.id === 'crew' && (
              <motion.div
                key="crew"
                className="sky-replay-crew"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="sky-replay-awards">
                  <div className="sky-replay-award">
                    <span className="eyebrow">TOP SURFACE PHOTOGRAPHER</span>
                    <strong>{crewStats.topPhotographer?.member?.nickname || crewStats.topPhotographer?.member?.name || '—'}</strong>
                    <span>{crewStats.topPhotographer?.rippleCount ?? 0} ripples shared</span>
                  </div>
                  <div className="sky-replay-award">
                    <span className="eyebrow">MOST ACTIVE VOTER</span>
                    <strong>{crewStats.topVoter?.member?.nickname || crewStats.topVoter?.member?.name || '—'}</strong>
                    <span>{crewStats.topVoter?.pollResponses ?? 0} polls answered</span>
                  </div>
                  <div className="sky-replay-award">
                    <span className="eyebrow">BUBBLE MAGNET</span>
                    <strong>{crewStats.echoMagnet?.member?.nickname || crewStats.echoMagnet?.member?.name || '—'}</strong>
                    <span>{crewStats.echoMagnet?.echoesReceived ?? 0} bubbles received</span>
                  </div>
                </div>

                <div className="sky-replay-bars">
                  {crewStats.byMember.map(({ member, rippleCount }) => {
                    const pct = Math.round((rippleCount / crewStats.maxRipples) * 100);
                    return (
                      <div key={member.id} className="sky-replay-bar-row">
                        <span className="sky-replay-bar-name">{member.nickname || member.name}</span>
                        <div className="sky-replay-bar-track">
                          <div className="sky-replay-bar-fill" style={{ width: `${Math.max(pct, rippleCount > 0 ? 8 : 0)}%` }} />
                        </div>
                        <strong className="sky-replay-bar-val">{String(rippleCount).padStart(2, '0')}</strong>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {chapter.id === 'mosaic' && (
              <motion.div
                key="mosaic"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {mosaicFrames.length === 0 ? (
                  <p className="sky-replay-empty">Drop ripples or add trip photos to build your group mosaic.</p>
                ) : (
                  <div className="sky-replay-mosaic">
                    {mosaicFrames.map((frame) => (
                      <figure key={frame.id} className="sky-replay-tile">
                        <img src={frame.url} alt={frame.caption} loading="lazy" />
                        <figcaption>
                          <strong>{frame.meta}</strong>
                          <span>{frame.caption}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {chapter.id === 'vault' && (
              <motion.div
                key="vault"
                className="sky-replay-vault-step"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {highlights.length === 0 ? (
                  <p className="sky-replay-empty">Add highlight notes inside Trip Vault or captions on Ripples to see them collected here.</p>
                ) : (
                  <div className="sky-replay-highlights">
                    {highlights.map((item) => (
                      <article key={item.id} className="sky-replay-highlight-card">
                        <p>“{item.text}”</p>
                        <span>{item.meta}</span>
                      </article>
                    ))}
                  </div>
                )}

                <div className="sky-replay-cta-row">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                      onNavigate?.('vault');
                      onClose?.();
                    }}
                  >
                    <BrandIcon name="futs-folder" size={16} /> Open Trip Vault
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      onNavigate?.('ripples');
                      onClose?.();
                    }}
                  >
                    <BrandIcon name="futs-wave" size={16} /> Open Ripples
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="sky-replay-foot">
          <button
            type="button"
            className="button button-secondary"
            disabled={chapterIndex === 0}
            onClick={() => setChapterIndex((i) => Math.max(0, i - 1))}
          >
            ← Prev
          </button>

          <div className="sky-replay-dots" role="tablist" aria-label="Replay chapters">
            {CHAPTERS.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={idx === chapterIndex}
                aria-label={`Chapter ${c.code}: ${c.title}`}
                className={`sky-replay-dot${idx === chapterIndex ? ' is-active' : ''}`}
                onClick={() => setChapterIndex(idx)}
              />
            ))}
          </div>

          {chapterIndex < CHAPTERS.length - 1 ? (
            <button
              type="button"
              className="button button-primary"
              onClick={() => setChapterIndex((i) => Math.min(CHAPTERS.length - 1, i + 1))}
            >
              Next →
            </button>
          ) : (
            <button type="button" className="button button-primary" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
