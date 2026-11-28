import { lazy, Suspense, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import DuotoneTeamRoster from './DuotoneTeamRoster.jsx';
import groupPhoto from '../assets/photos/group.jpg';

const FishProfileView = lazy(() => import('./FishProfileView.jsx'));

export default function FishesView({
  members = [],
  outings = [],
  currentMemberId,
  onUpdateMember,
  onNewPoll,
  onNavigate,
  onOpenReplay,
}) {
  const reduceMotion = useReducedMotion();
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const selectedMember = useMemo(
    () => members.find((person) => person.id === selectedMemberId) || null,
    [members, selectedMemberId],
  );

  const rosterMembers = useMemo(
    () =>
      members.map((person) => {
        const displayName = person.nickname && person.nickname !== person.name
          ? `${person.name} (${person.nickname})`
          : person.name;
        return {
          id: person.id,
          name: displayName,
          role: person.role || 'Fish Upon The Sky',
          craft: person.craft || 'Fish',
          bio: person.bio || 'Part of the seven-member private sky.',
          photo: person.customPhoto || person.defaultPhoto,
          focus: person.focus || '50% 24%',
        };
      }),
    [members],
  );

  const openMemberProfile = (memberOrId) => {
    const id = typeof memberOrId === 'string' ? memberOrId : memberOrId?.id;
    if (!id) return;
    setSelectedMemberId(id);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const closeMemberProfile = () => {
    setSelectedMemberId(null);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const scrollToOurSky = () => {
    const el = document.getElementById('our-sky');
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const doneCount = outings.filter((o) => o.status === 'Done').length;

  return (
    <section className="page-section fishes-page">
      <AnimatePresence mode="wait" initial={false}>
        {selectedMember ? (
          <Suspense fallback={<div className="lazy-fallback" role="status">Opening profile…</div>}>
            <FishProfileView
              key={`profile-${selectedMember.id}`}
              member={selectedMember}
              members={members}
              currentMemberId={currentMemberId}
              onSelectMember={openMemberProfile}
              onBack={closeMemberProfile}
              onUpdateMember={onUpdateMember}
            />
          </Suspense>
        ) : (
          <motion.div
            key="fishes-roster"
            className="fishes-roster-wrap"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.24 }}
          >
            <DuotoneTeamRoster
              members={rosterMembers}
              eyebrow="07 FISHES"
              title={'The\nFishes'}
              intro="Seven friends, one shared sky. Hover to bring colour back, or click any fish to open their personal space."
              cta={{ label: 'Our sky', href: '#our-sky' }}
              onCtaClick={scrollToOurSky}
              onMemberSelect={openMemberProfile}
              preset="mp174"
              columns={3}
              driftSeconds={10}
              height="min(80svh, 720px)"
              stretch={1}
              fontFamily="var(--font-display)"
              labels={{
                pause: 'Pause',
                play: 'Play',
                team: 'The Fishes',
                memberLink: 'View fish',
              }}
              clickFollowsLink={false}
            />

            <section
              id="our-sky"
              className="our-sky-section"
              aria-labelledby="our-sky-heading"
            >
              <div className="our-sky-photo-col">
                <figure className="our-sky-photo-frame">
                  <img
                    src={groupPhoto}
                    alt="Fish Upon The Sky — all seven group members together"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              </div>

              <div className="our-sky-copy-col">
                <span className="eyebrow">OUR SKY · 07 MEMBERS</span>
                <h2 id="our-sky-heading">A little plan, a lot of sky.</h2>
                <p className="our-sky-lead">
                  Fish Upon The Sky is our private corner for seven friends—built to settle weekend dates without
                  losing decisions inside chat threads, keep every busy schedule visible, and fold photos, maps, and
                  expense sheets into one calm vault.
                </p>

                <div className="our-sky-stats">
                  <div className="our-sky-stat">
                    <strong>07</strong>
                    <span>Fishes in the pond</span>
                  </div>
                  <div className="our-sky-stat">
                    <strong>{String(outings.length).padStart(2, '0')}</strong>
                    <span>Trips &amp; plans tracked</span>
                  </div>
                  <div className="our-sky-stat">
                    <strong>{String(doneCount).padStart(2, '0')}</strong>
                    <span>Memories archived</span>
                  </div>
                </div>

                <div className="our-sky-roster-pills" aria-label="Open a member profile">
                  {members.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      className="our-sky-chip"
                      onClick={() => openMemberProfile(person.id)}
                    >
                      <i aria-hidden="true" />
                      <span>{person.nickname || person.name}</span>
                    </button>
                  ))}
                </div>

                <div className="our-sky-actions">
                  <button type="button" className="button button-primary" onClick={() => onNavigate?.('vault')}>
                    Open Trip Vault
                  </button>
                  <button type="button" className="button button-secondary" onClick={onNewPoll}>
                    Plan next outing
                  </button>
                  {onOpenReplay && (
                    <button type="button" className="button button-secondary" onClick={onOpenReplay}>
                      Sky Replay
                    </button>
                  )}
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
