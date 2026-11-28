import { useMemo } from 'react';
import BrandIcon from './BrandIcon.jsx';

const QUICK_ECHOES = ['✦', '🌊', '🍋'];

function formatRelativeTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LatestRippleWidget({
  latestRipple,
  totalCount = 0,
  members = [],
  currentMemberId,
  onToggleReaction,
  onOpenRipples,
  onDropRipple,
}) {
  const sender = useMemo(() => {
    if (!latestRipple) return null;
    return members.find((m) => m.id === latestRipple.memberId) || null;
  }, [latestRipple, members]);

  return (
    <section className="home-ripple-section" aria-labelledby="home-ripple-heading">
      <div className="studio-section-bar">
        <div>
          <span className="eyebrow">Pond surface · Live</span>
          <h2 id="home-ripple-heading">Latest sky ripple</h2>
        </div>
        <span className="dot-rule" aria-hidden="true">
          <i />
          <span />
          <i />
        </span>
        <button type="button" className="text-button" onClick={onOpenRipples}>
          All ripples ({String(totalCount).padStart(2, '0')}) <BrandIcon name="futs-arrow-launch" size={17} />
        </button>
      </div>

      <article className="home-ripple-card">
        <div className="ripples-hud-corners" aria-hidden="true">
          <span>+</span>
          <span>+</span>
          <span>+</span>
          <span>+</span>
        </div>

        {latestRipple ? (
          <>
            <button
              type="button"
              className="home-ripple-thumb"
              onClick={onOpenRipples}
              aria-label="Open full ripple stream"
            >
              <img
                src={latestRipple.imageUrl}
                alt={latestRipple.caption || 'Latest group ripple'}
                loading="lazy"
              />
            </button>
            <div className="home-ripple-body">
              <div className="home-ripple-meta">
                <span className={`avatar avatar-${sender?.color || 'blue'} avatar-small`}>
                  {(sender?.nickname || sender?.name || 'F').slice(0, 1)}
                </span>
                <strong>{sender?.nickname || sender?.name || 'Fish'}</strong>
                <span className="home-ripple-dot" aria-hidden="true">·</span>
                <span>{formatRelativeTime(latestRipple.createdAt)}</span>
                {latestRipple.place && (
                  <>
                    <span className="home-ripple-dot" aria-hidden="true">·</span>
                    <span className="home-ripple-place">
                      <BrandIcon name="futs-compass" size={13} /> {latestRipple.place}
                    </span>
                  </>
                )}
              </div>

              <p className="home-ripple-caption">
                {latestRipple.caption || 'Shared a quiet frame from the day.'}
              </p>

              <div className="home-ripple-actions">
                <div className="ripple-echo-row" role="group" aria-label="Quick bubbles">
                  {QUICK_ECHOES.map((emoji) => {
                    const list = latestRipple.reactions?.[emoji] ?? [];
                    const active = list.includes(currentMemberId);
                    return (
                      <button
                        key={emoji}
                        type="button"
                        className={`ripple-echo-chip${active ? ' is-active' : ''}`}
                        aria-pressed={active}
                        onClick={() => onToggleReaction?.(latestRipple.id, emoji)}
                      >
                        <span>{emoji}</span>
                        {list.length > 0 && <strong>{list.length}</strong>}
                      </button>
                    );
                  })}
                </div>
                <button type="button" className="button button-primary" onClick={onDropRipple}>
                  <BrandIcon name="futs-image" size={16} /> Drop a ripple
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="home-ripple-empty">
            <div>
              <strong>The pond surface is still</strong>
              <p>Be the first fish to drop a live photo for the other six.</p>
            </div>
            <button type="button" className="button button-primary" onClick={onDropRipple}>
              <BrandIcon name="futs-image" size={16} /> Drop a ripple
            </button>
          </div>
        )}
      </article>
    </section>
  );
}
