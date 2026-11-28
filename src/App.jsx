import { Fragment, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ClerkAuthRoot, { SessionExitButton } from './auth/ClerkAuthRoot.jsx';
import { AuthLayout } from './auth/AuthEntry.jsx';
import {
  clerkPublishableKey,
  googleClientId,
  hasGoogleOAuth,
  hasSupabaseConfiguration,
} from './auth/auth-config.js';
import {
  GOOGLE_CALENDAR_SCOPE,
  buildGoogleCalendarEventUrl,
  createGoogleCalendarEvent,
  downloadGroupIcsFile,
  fetchGoogleCalendarEvents,
  requestGoogleOAuthToken,
  revokeGoogleToken,
} from './auth/google-auth.js';
import { fetchCurrentMemberId, getGoogleSupabase } from './data/supabaseClient.js';
import { todayKey } from './data/groupApi.js';
import { useGroupData } from './data/useGroupData.js';
import WelcomeReveal from './components/GlassLogoReveal.jsx';
import MyTasksHero from './components/MyTasksHero.jsx';
import TripVaultView from './components/TripVaultView.jsx';
import BeamWordmarkFooter from './components/BeamWordmarkFooter.jsx';
import LiquidGlassTabBar from './components/LiquidGlassTabBar.jsx';
import FishesView from './components/FishesView.jsx';
import logo from '../Logo/Logo.svg';

const people = [
  { id: 'bao', name: 'Bảo', color: 'blue' },
  { id: 'hang', name: 'Hằng', color: 'lemon' },
  { id: 'diem', name: 'Diễm', color: 'cream' },
  { id: 'quynh', name: 'Quỳnh', color: 'sky' },
  { id: 'quoc-anh', name: 'Quốc Anh', color: 'cream' },
  { id: 'thu', name: 'Thư', color: 'lemon' },
  { id: 'thien', name: 'Thiên', color: 'blue' },
];

const navItems = [
  { id: 'home', label: 'My tasks', icon: 'home' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'outings', label: 'Outings', icon: 'spark' },
  { id: 'vault', label: 'Vault', icon: 'folder' },
  { id: 'members', label: 'Fishes', icon: 'people' },
];

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v10h13V9M9 19v-6h6v6" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="3" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></>,
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
    folder: <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4l2 2.5h7A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5V6.5Z" />,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3.5 9h17M16 14h.01M6 5V3.5h11" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    heart: <path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1Z" />,
    moon: <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" {...common}>{paths[name]}</svg>;
}

function DotRule() {
  return <span className="dot-rule" aria-hidden="true"><i /><span /><i /></span>;
}

function Avatar({ person, small = false }) {
  return <span className={`avatar avatar-${person.color}${small ? ' avatar-small' : ''}`} title={person.name}>{person.name.slice(0, 1)}</span>;
}

function SectionHeading({ kicker, title, action, onAction }) {
  return <div className="section-heading">
    <div><span className="eyebrow">{kicker}</span><h2>{title}</h2></div>
    {action && <button className="text-button" onClick={onAction}>{action}<Icon name="arrow" size={17} /></button>}
  </div>;
}

function VoteCard({ poll, currentMemberId, onToggleVote }) {
  const isClosed = poll.status === 'Closed';
  const memberVotes = poll.votes?.[currentMemberId] ?? [];
  const responded = Object.values(poll.votes ?? {}).filter((votes) => votes.length > 0).length;
  const renderIdeaGroup = (label, options, voteKey) => options?.length > 0 && <div className="vote-idea-group"><span className="vote-idea-label">{label}</span><div className="vote-chip-list">{options.map((option) => {
    const selected = (poll[voteKey]?.[currentMemberId] ?? []).includes(option);
    const count = Object.values(poll[voteKey] ?? {}).filter((votes) => votes.includes(option)).length;
    return <button type="button" key={option} className={`vote-chip${selected ? ' is-selected' : ''}`} aria-pressed={selected} disabled={isClosed} onClick={() => onToggleVote(poll.id, option, voteKey)}>{option}<strong>{count}</strong></button>;
  })}</div></div>;
  return <article className="vote-card">
    <div className="vote-card-top">
      <span className={`status ${isClosed ? 'status-closed' : 'status-voting'}`}><span /> {isClosed ? 'Vote closed' : 'Vote open'}</span>
      <span className="deadline"><Icon name="clock" size={15} /> {isClosed ? 'Closed' : 'Closes'} {poll.deadline}</span>
    </div>
    <h3>{poll.title}</h3>
    <p>{poll.detail}</p>
    <div className="vote-options" role="group" aria-label={`Vote for dates for ${poll.title}`}>
      {poll.options.map((option) => {
        const voters = Object.values(poll.votes ?? {}).filter((votes) => votes.includes(option.id)).length;
        const selected = memberVotes.includes(option.id);
        return <button key={option.id} type="button" className={`vote-option${selected ? ' is-selected' : ''}`} aria-pressed={selected} disabled={isClosed} onClick={() => onToggleVote(poll.id, option.id, 'votes')}>
          <span className="vote-check"><Icon name="check" size={14} /></span>
          <span>{option.label}</span>
          <strong>{voters}</strong>
        </button>;
      })}
    </div>
    {renderIdeaGroup('Place ideas', poll.placeOptions, 'placeVotes')}
    {renderIdeaGroup('Budget ideas', poll.budgetOptions, 'budgetVotes')}
    <div className="vote-foot"><span>{responded} of {people.length} members have responded</span><span>{isClosed ? 'Voting has closed' : 'Reminder before the deadline'}</span></div>
  </article>;
}

function NewPollModal({ onClose, onCreate, reduceMotion }) {
  const today = todayKey();
  const now = new Date();
  const defaultDeadlineDate = (() => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const [title, setTitle] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDates, setSelectedDates] = useState([]);
  const [deadlineDate, setDeadlineDate] = useState(defaultDeadlineDate);
  const [placeOptions, setPlaceOptions] = useState('');
  const [budgetOptions, setBudgetOptions] = useState('');

  const monthStart = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const monthCells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const choices = monthCells.filter(Boolean).map((day) => {
    const date = new Date(year, month, day);
    const id = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { id, day, label: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · 4:00 PM` };
  });
  const toggleDate = (id) => setSelectedDates((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  const submit = (event) => {
    event.preventDefault();
    if (!title.trim() || selectedDates.length === 0 || !deadlineDate) return;
    const selectedOptions = [...selectedDates].sort().map((id) => {
      const [selectedYear, selectedMonth, selectedDay] = id.split('-').map(Number);
      const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
      return { id, label: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · 4:00 PM` };
    });
    const [dlYear, dlMonth, dlDay] = deadlineDate.split('-').map(Number);
    const dlObj = new Date(dlYear, dlMonth - 1, dlDay);
    const deadlineLabel = dlObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    onCreate({
      id: `poll-${crypto.randomUUID()}`,
      title: title.trim(),
      detail: 'Pick the time that works best for you.',
      status: deadlineDate < today ? 'Closed' : 'Voting',
      deadline: deadlineLabel,
      deadlineDate,
      options: selectedOptions,
      placeOptions: placeOptions.split('\n').map((item) => item.trim()).filter(Boolean),
      budgetOptions: budgetOptions.split('\n').map((item) => item.trim()).filter(Boolean),
      votes: {},
      placeVotes: {},
      budgetVotes: {},
    });
  };
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <motion.form className="poll-modal" role="dialog" aria-modal="true" aria-labelledby="new-poll-modal-title" onSubmit={submit} initial={{ opacity: 0, y: reduceMotion ? 0 : 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: 0.98 }} transition={{ duration: 0.22 }}>
      <div className="modal-heading"><div><span className="eyebrow">Start with the calendar</span><h2 id="new-poll-modal-title">Make a new plan</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={onClose}><Icon name="close" /></button></div>
      <label className="field-label" htmlFor="poll-title">What are we planning?</label>
      <input id="poll-title" className="text-input" placeholder="A little afternoon together" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={64} required />
      <label className="field-label" htmlFor="poll-deadline">Vote closes</label>
      <input id="poll-deadline" type="date" className="text-input" min={today} value={deadlineDate} onChange={(event) => setDeadlineDate(event.target.value)} required />
      <div className="field-label field-label-row"><span>Pick possible dates</span><span className="field-hint">Select every day that could work</span></div>
      <div className="poll-calendar">
        <div className="poll-calendar-toolbar"><button type="button" className="icon-button" aria-label="Previous month" onClick={() => setMonthOffset((value) => value - 1)}>‹</button><strong>{monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong><button type="button" className="icon-button" aria-label="Next month" onClick={() => setMonthOffset((value) => value + 1)}>›</button></div>
        <div className="calendar-grid calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid poll-calendar-days">{monthCells.map((day, index) => {
          if (!day) return <span className="calendar-empty" key={`pad-${index}`} />;
          const option = choices.find((choice) => choice.day === day);
          const selected = selectedDates.includes(option.id);
          const isPast = option.id < today;
          return <button type="button" key={option.id} disabled={isPast} className={`poll-calendar-day${selected ? ' is-selected' : ''}`} aria-pressed={selected} aria-label={`${option.label}${selected ? ', selected' : ''}`} onClick={() => toggleDate(option.id)}><span>{day}</span>{selected && <i />}</button>;
        })}</div>
        <div className="selected-date-note"><Icon name="clock" size={15} /><span>Selected dates are offered at 4:00 PM; you can choose more than one.</span></div>
      </div>
      <div className="modal-two-col">
        <label className="field-label">Place ideas <span className="field-hint">One per line</span><textarea className="text-input textarea" placeholder={'Old Quarter\nWest Lake\nLet the group pick'} value={placeOptions} onChange={(event) => setPlaceOptions(event.target.value)} rows="3" /></label>
        <label className="field-label">Budget ideas <span className="field-hint">One per line</span><textarea className="text-input textarea" placeholder={'Under ₫300k\n₫300k–₫500k\nKeep it flexible'} value={budgetOptions} onChange={(event) => setBudgetOptions(event.target.value)} rows="3" /></label>
      </div>
      <div className="modal-actions"><p><Icon name="people" size={16} /> Everyone in Fish Upon The Sky can vote and edit</p><button className="button button-primary" type="submit" disabled={!title.trim() || selectedDates.length === 0 || !deadlineDate}>Open this vote <Icon name="arrow" size={17} /></button></div>
    </motion.form>
  </motion.div>;
}

function HomeView({ polls, outings, members, onNewPoll, onVote, currentMemberId, currentMemberName, goTo }) {
  const openPoll = polls.find((poll) => poll.status === 'Voting');

  return (
    <div className="home-stack">
      <MyTasksHero
        memberName={currentMemberName}
        polls={polls}
        outings={outings}
        members={members}
        onNewPoll={onNewPoll}
        onNavigate={goTo}
      />

      {openPoll && (
        <section id="active-vote" className="studio-poll-section">
          <div className="studio-section-bar">
            <div>
              <span className="eyebrow">Open vote</span>
              <h2>Vote on the next outing</h2>
            </div>
            <DotRule />
            <button type="button" className="text-button" onClick={() => goTo('outings')}>
              All outings <Icon name="arrow" size={17} />
            </button>
          </div>
          <VoteCard poll={openPoll} currentMemberId={currentMemberId} onToggleVote={onVote} />
        </section>
      )}
    </div>
  );
}

function CalendarView({
  onNewPoll,
  currentMemberId,
  currentMemberName,
  currentUserEmail,
  googleAccessToken,
  onUpdateGoogleToken,
  onClearGoogleToken,
  busyDays,
  onToggleBusy,
  onAddBusyDays,
  polls,
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [gcalEvents, setGcalEvents] = useState([]);
  const [gcalConnecting, setGcalConnecting] = useState(false);
  const [gcalSyncing, setGcalSyncing] = useState(false);
  const [pushingKey, setPushingKey] = useState('');
  const [gcalStatus, setGcalStatus] = useState('');
  const [gcalError, setGcalError] = useState('');
  const [syncedEventIds, setSyncedEventIds] = useState({});
  const [showOauthNote, setShowOauthNote] = useState(false);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = start.getFullYear();
  const month = start.getMonth();
  const firstWeekday = (start.getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const dayCells = [...Array(firstWeekday).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  const todayBusy = busyDays[currentMemberId] ?? [];
  const title = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const ideaDates = new Set(
    polls
      .filter((p) => p.status === 'Voting')
      .flatMap((p) => (p.options || []).map((o) => o.id)),
  );

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const eventsByDay = gcalEvents.reduce((acc, ev) => {
    if (!ev.dateKey.startsWith(monthPrefix)) return acc;
    if (!acc[ev.dateKey]) acc[ev.dateKey] = [];
    acc[ev.dateKey].push(ev);
    return acc;
  }, {});

  const handleRevokedOrError = (err, fallback) => {
    if (err?.code === 'auth_revoked') {
      setGcalEvents([]);
      onClearGoogleToken?.();
      setGcalStatus('');
      setGcalError(err.message || 'Google Calendar access expired or was revoked. Please reconnect.');
      return;
    }
    setGcalError(err?.message || fallback);
  };

  const loadMonthFromGoogle = async (tokenToUse = googleAccessToken) => {
    if (!tokenToUse) return;
    setGcalSyncing(true);
    setGcalError('');
    try {
      const timeMin = new Date(year, month, 1).toISOString();
      const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const events = await fetchGoogleCalendarEvents(tokenToUse, timeMin, timeMax);
      setGcalEvents(events);
      setGcalStatus(`Synced ${events.length} Google Calendar ${events.length === 1 ? 'event' : 'events'} for ${title}.`);
    } catch (err) {
      handleRevokedOrError(err, 'Could not sync Google Calendar events.');
    } finally {
      setGcalSyncing(false);
    }
  };

  useEffect(() => {
    if (googleAccessToken) {
      loadMonthFromGoogle(googleAccessToken);
    }
  }, [googleAccessToken, monthOffset]);

  const handleConnectGoogleCalendar = async () => {
    setGcalError('');
    setGcalStatus('');
    if (!hasGoogleOAuth) {
      setShowOauthNote((prev) => !prev);
      return;
    }
    setGcalConnecting(true);
    try {
      const token = await requestGoogleOAuthToken({
        clientId: googleClientId,
        scope: GOOGLE_CALENDAR_SCOPE,
        prompt: 'consent',
        includeGrantedScopes: true,
      });
      if (!token.grantedAllScopes) {
        setGcalError('Google Calendar permission was not granted. Please allow calendar access to enable 2-way sync.');
        return;
      }
      onUpdateGoogleToken?.(token);
      setShowOauthNote(false);
    } catch (err) {
      if (err?.code === 'cancelled') {
        setGcalStatus('Google Calendar connection was cancelled.');
      } else {
        setGcalError(err?.message || 'Could not connect Google Calendar.');
      }
    } finally {
      setGcalConnecting(false);
    }
  };

  const handleDisconnectGoogleCalendar = () => {
    revokeGoogleToken(googleAccessToken);
    setGcalEvents([]);
    setGcalError('');
    setGcalStatus('Disconnected Google Calendar for this session.');
    onClearGoogleToken?.();
  };

  const handleApplyBusyDays = async () => {
    const monthEventKeys = Object.keys(eventsByDay);
    if (monthEventKeys.length === 0) {
      setGcalStatus('No busy events found in your Google Calendar for this month.');
      return;
    }
    await onAddBusyDays?.(monthEventKeys);
    setGcalStatus(`Marked ${monthEventKeys.length} day(s) busy from Google Calendar.`);
  };

  const upcomingOptions = polls.flatMap((poll) =>
    (poll.options || []).slice(0, 2).map((opt) => ({
      key: `${poll.id}-${opt.id}`,
      title: poll.title,
      dateKey: opt.id,
      label: opt.label,
      location: poll.placeOptions?.[0] || 'Fish Upon The Sky outing',
      details: poll.detail || 'Group outing planned on Fish Upon The Sky',
    })),
  ).slice(0, 3);

  const handlePushOuting = async (item) => {
    if (!googleAccessToken) {
      window.open(
        buildGoogleCalendarEventUrl({
          title: item.title,
          dateKey: item.dateKey,
          location: item.location,
          details: item.details,
        }),
        '_blank',
        'noopener,noreferrer',
      );
      return;
    }
    setPushingKey(item.key);
    setGcalError('');
    try {
      await createGoogleCalendarEvent(googleAccessToken, {
        title: item.title,
        dateKey: item.dateKey,
        location: item.location,
        description: item.details,
      });
      setSyncedEventIds((prev) => ({ ...prev, [item.key]: true }));
      setGcalStatus(`Added "${item.title}" to your Google Calendar.`);
      loadMonthFromGoogle(googleAccessToken);
    } catch (err) {
      handleRevokedOrError(err, 'Could not push event to Google Calendar.');
    } finally {
      setPushingKey('');
    }
  };

  return <section className="page-section calendar-page">
    <div className="page-title-row"><div><span className="eyebrow">All seven schedules, one view</span><h1>Group schedule</h1><p>Tap a date to mark yourself busy, or connect Google Calendar to sync automatically.</p></div><button className="button button-primary" onClick={onNewPoll}><Icon name="plus" size={18} /> Open a new vote</button></div>
    <div className="calendar-layout">
      <section className="calendar-card">
        <div className="calendar-toolbar"><button className="icon-button" aria-label="Previous month" onClick={() => setMonthOffset((value) => value - 1)}>‹</button><h2>{title}</h2><button className="icon-button" aria-label="Next month" onClick={() => setMonthOffset((value) => value + 1)}>›</button></div>
        <div className="calendar-grid calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid calendar-days">{dayCells.map((day, index) => {
          if (!day) return <span className="calendar-empty" key={`empty-${index}`} />;
          const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isBusy = todayBusy.includes(dayKey);
          const hasIdea = ideaDates.has(dayKey);
          const dayGcal = eventsByDay[dayKey] ?? [];
          const hasGcal = dayGcal.length > 0;
          return (
            <button
              key={dayKey}
              className={`calendar-day${isBusy ? ' is-busy' : ''}${hasIdea ? ' has-idea' : ''}${hasGcal ? ' has-gcal' : ''}`}
              aria-label={`${title} ${day}${isBusy ? ', marked busy' : ''}${hasGcal ? `, ${dayGcal.length} Google Calendar event` : ''}`}
              title={hasGcal ? dayGcal.map((e) => `${e.startTime}: ${e.title}`).join('\n') : undefined}
              aria-pressed={isBusy}
              onClick={() => onToggleBusy(dayKey)}
            >
              <span>{day}</span>
              {hasGcal && <b className="gcal-day-dot" aria-hidden="true" />}
              {hasIdea && <i />}
            </button>
          );
        })}</div>
        <div className="calendar-legend">
          <span><i className="legend-busy" /> Your busy day</span>
          <span><i className="legend-idea" /> Possible outing date</span>
          <span><i className="legend-gcal" /> Google Calendar</span>
        </div>
      </section>
      <aside className="availability-card">
        <span className="eyebrow">A quick check-in</span>
        <h2>Mark the days you can’t make.</h2>
        <p>Your availability stays linked to <strong>{currentMemberName}</strong>{currentUserEmail ? ` (${currentUserEmail})` : ''}.</p>

        <div className="gcal-panel">
          <div className="gcal-panel-head">
            <span className={`gcal-status-dot${googleAccessToken ? ' is-connected' : ''}`} aria-hidden="true" />
            <div>
              <strong>Google Calendar Sync</strong>
              <span>{googleAccessToken ? `Connected · ${currentUserEmail || 'Live 2-way API'}` : 'Ready to link & export'}</span>
            </div>
            {googleAccessToken && (
              <button
                type="button"
                className="quiet-button gcal-disconnect-btn"
                onClick={handleDisconnectGoogleCalendar}
              >
                Disconnect
              </button>
            )}
          </div>

          <div className="gcal-actions">
            {googleAccessToken ? (
              <>
                <button type="button" className="button button-primary gcal-btn" disabled={gcalSyncing} onClick={handleApplyBusyDays}>
                  {gcalSyncing ? 'Syncing…' : 'Sync busy days from Google'}
                </button>
                <button type="button" className="button button-secondary gcal-btn" disabled={gcalSyncing} onClick={() => loadMonthFromGoogle()}>
                  Refresh {title.split(' ')[0]} events
                </button>
              </>
            ) : (
              <button type="button" className="button button-secondary gcal-btn" disabled={gcalConnecting} onClick={handleConnectGoogleCalendar}>
                {hasGoogleOAuth ? (gcalConnecting ? 'Connecting…' : 'Connect Google Calendar (2-way)') : 'Enable 2-way OAuth sync'}
              </button>
            )}
            <button
              type="button"
              className="button button-secondary gcal-btn"
              onClick={() => downloadGroupIcsFile({ polls, busyDaysList: todayBusy, memberName: currentMemberName })}
            >
              Export .ics for Google Calendar
            </button>
          </div>

          {showOauthNote && !hasGoogleOAuth && (
            <p className="gcal-note">
              Add <code>VITE_GOOGLE_CLIENT_ID</code> in <code>.env</code> for automatic 2-way Calendar read/write. Quick add &amp; <code>.ics</code> export work right now below.
            </p>
          )}
          {gcalStatus && <p className="gcal-feedback" role="status">{gcalStatus}</p>}
          {gcalError && <p className="gcal-error" role="alert">{gcalError}</p>}

          {upcomingOptions.length > 0 && (
            <div className="gcal-outing-pushes">
              <span className="gcal-sub-label">Add group outings to Google Calendar</span>
              {upcomingOptions.map((item) => {
                const isPushing = pushingKey === item.key;
                return (
                  <div className="gcal-push-row" key={item.key}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.label}</span>
                    </div>
                    <button
                      type="button"
                      className="quiet-button gcal-push-btn"
                      disabled={isPushing}
                      onClick={() => handlePushOuting(item)}
                    >
                      {isPushing ? 'Adding…' : syncedEventIds[item.key] ? 'Synced ✓' : googleAccessToken ? 'Push →' : 'Add →'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="availability-tip"><Icon name="spark" /><span>The best date is the one with room for everyone.</span></div>
      </aside>
    </div>
  </section>;
}

function OutingsView({ polls, outings, onNewPoll, currentMemberId, onVote, goTo, onStatusChange }) {
  const openPolls = polls.filter((poll) => poll.status === 'Voting');

  return <section className="page-section">
    <div className="page-title-row"><div><span className="eyebrow">Plans &amp; votes</span><h1>Outings</h1><p>Track polls, confirmed dates, and trip archives in one place.</p></div><button className="button button-primary" onClick={onNewPoll}><Icon name="plus" size={18} /> New outing poll</button></div>
    {openPolls.length > 0 && <div className="outings-polls"><SectionHeading kicker="Open decisions" title="Help choose what works" /><div className="poll-grid">{openPolls.map((poll) => <VoteCard key={poll.id} poll={poll} currentMemberId={currentMemberId} onToggleVote={onVote} />)}</div></div>}
    <SectionHeading kicker="The group’s story" title="Every plan has a place" />
    {outings.length === 0 ? (
      <div className="soft-callout">
        <span className="callout-illustration"><Icon name="spark" size={23} /></span>
        <div>
          <strong>No outings planned yet</strong>
          <p>Start a poll so everyone can pick a date, place, and budget.</p>
        </div>
      </div>
    ) : (
      <div className="outing-list">{outings.map((outing) => <article className="outing-row" key={outing.id}><span className={`outing-marker marker-${outing.status.toLowerCase()}`}><Icon name={outing.status === 'Done' ? 'check' : 'spark'} size={18} /></span><div className="outing-main"><div className="outing-title-line"><h3>{outing.title}</h3><label className="sr-only" htmlFor={`status-${outing.id}`}>Update status for {outing.title}</label><select id={`status-${outing.id}`} className={`status-select status-${outing.status.toLowerCase()}`} value={outing.status} onChange={(event) => onStatusChange(outing.id, event.target.value)}><option>Idea</option><option>Planning</option><option>Confirmed</option><option>Done</option></select></div><p>{outing.date} <span>·</span> {outing.place}</p></div><button className="text-button" onClick={() => goTo('vault')}>Open vault <Icon name="arrow" size={17} /></button></article>)}</div>
    )}
    <div className="soft-callout"><span className="callout-illustration"><Icon name="heart" size={23} /></span><div><strong>Small plans count too.</strong><p>Keep even the “maybe sometime” ideas here until the right day appears.</p></div></div>
  </section>;
}

export function PlannerApp({
  client,
  currentMemberId,
  currentUserEmail = '',
  googleAccessToken = '',
  onUpdateGoogleToken,
  onClearGoogleToken,
  onSignOut,
  onSwitchMember,
  passwordResetNotice,
}) {
  const reduceMotion = useReducedMotion();
  const [showReveal, setShowReveal] = useState(true);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('fish-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    try {
      localStorage.setItem('fish-theme', theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);
  const [showPollModal, setShowPollModal] = useState(false);
  const didMountTabRef = useRef(false);

  const {
    members,
    polls,
    outings,
    busyDays,
    loading,
    syncError,
    dismissError,
    updateMemberProfile,
    toggleVote,
    createPoll,
    updateTrip,
    addPastTrip,
    changeOutingStatus,
    toggleBusy,
    addBusyDays,
  } = useGroupData(client, currentMemberId, people);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const navigateToTab = (tabId) => {
    setActiveTab(tabId);
    scrollToTop();
  };

  useEffect(() => {
    if (!didMountTabRef.current) {
      didMountTabRef.current = true;
      return;
    }
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [activeTab, reduceMotion]);

  const currentMember = members.find((person) => person.id === currentMemberId) || members[0];
  const displayName = currentMember.nickname || currentMember.name;
  const hasOpenPoll = polls.some((poll) => poll.status === 'Voting');
  const pendingTaskCount = (hasOpenPoll ? 1 : 0) + (outings.some((o) => o.status === 'Done' && !o.sheetUrl) ? 1 : 0) + 1;

  const navTabs = navItems.map((item) => {
    if (item.id === 'home') return { ...item, count: pendingTaskCount };
    if (item.id === 'outings') return { ...item, count: outings.length, notice: hasOpenPoll };
    if (item.id === 'vault') return { ...item, count: outings.length };
    if (item.id === 'members') return { ...item, count: members.length };
    return item;
  });

  const handleCreatePoll = async (poll) => {
    await createPoll(poll);
    setShowPollModal(false);
    setActiveTab('outings');
  };

  return <div className={`app-shell${theme === 'dark' ? ' theme-dark' : ''}`}>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <AnimatePresence>
      {showReveal && (
        <WelcomeReveal
          memberName={displayName}
          theme={theme}
          onDone={() => setShowReveal(false)}
        />
      )}
    </AnimatePresence>

    <header className="studio-header">
      <div className="studio-header-inner">
        <div className="header-left">
          <button type="button" className="brand-lockup" onClick={() => navigateToTab('home')} aria-label="Fish Upon The Sky home">
            <img className="brand-fish" src={logo} alt="" />
            <strong>Fish Upon The Sky</strong>
          </button>
        </div>

        <nav className="header-nav" aria-label="Main navigation">
          <LiquidGlassTabBar
            items={navTabs}
            activeId={activeTab}
            onChange={navigateToTab}
            variant="header"
            ariaLabel="Primary pages"
          />
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-button theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
          </button>

          <div className="topbar-member" title={currentUserEmail ? `Signed in as ${currentMember.name} (${currentUserEmail})` : `Signed in as ${currentMember.name}`}>
            <Avatar person={currentMember} small />
            <span>{displayName}</span>
          </div>

          {onSwitchMember && (
            <div className="topbar-dev-switch" title="Chuyển đổi thành viên (Local Dev)">
              <span className="dev-tag">DEV</span>
              <select
                className="topbar-dev-select"
                value={currentMemberId}
                onChange={(e) => onSwitchMember(e.target.value)}
                aria-label="Switch member"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="button" className="button button-primary topbar-new" onClick={() => setShowPollModal(true)}>
            <Icon name="plus" size={17} /> <span>New plan</span>
          </button>

          <SessionExitButton onExit={onSignOut} />
        </div>
      </div>
    </header>

    {passwordResetNotice && <p className="planner-reset-notice">{passwordResetNotice}</p>}
    {loading && <p className="planner-reset-notice" role="status">Syncing group data…</p>}
    {syncError && (
      <p
        className="planner-reset-notice"
        role="alert"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
      >
        <span>{syncError}</span>
        <button type="button" className="quiet-button" onClick={dismissError}>Dismiss</button>
      </p>
    )}

    <div className="app-main">
      <main id="main-content" tabIndex={-1} className="page-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            className="page-view"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'home' && (
              <HomeView
                polls={polls}
                outings={outings}
                members={members}
                onNewPoll={() => setShowPollModal(true)}
                onVote={toggleVote}
                currentMemberId={currentMemberId}
                currentMemberName={displayName}
                goTo={navigateToTab}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarView
                onNewPoll={() => setShowPollModal(true)}
                currentMemberId={currentMemberId}
                currentMemberName={displayName}
                currentUserEmail={currentUserEmail}
                googleAccessToken={googleAccessToken}
                onUpdateGoogleToken={onUpdateGoogleToken}
                onClearGoogleToken={onClearGoogleToken}
                busyDays={busyDays}
                onToggleBusy={toggleBusy}
                onAddBusyDays={addBusyDays}
                polls={polls}
              />
            )}
            {activeTab === 'outings' && (
              <OutingsView
                polls={polls}
                outings={outings}
                onNewPoll={() => setShowPollModal(true)}
                currentMemberId={currentMemberId}
                onVote={toggleVote}
                goTo={navigateToTab}
                onStatusChange={changeOutingStatus}
              />
            )}
            {activeTab === 'vault' && (
              <TripVaultView
                trips={outings}
                theme={theme}
                currentMemberName={displayName}
                onUpdateTrip={updateTrip}
                onAddPastTrip={addPastTrip}
              />
            )}
            {activeTab === 'members' && (
              <FishesView
                members={members}
                outings={outings}
                currentMemberId={currentMemberId}
                onUpdateMember={updateMemberProfile}
                onNewPoll={() => setShowPollModal(true)}
                onNavigate={navigateToTab}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <BeamWordmarkFooter
        onNavigate={navigateToTab}
        onNewPoll={() => setShowPollModal(true)}
        onScrollTop={scrollToTop}
      />
    </div>

    <nav className="mobile-nav" aria-label="Mobile navigation">
      <LiquidGlassTabBar
        items={navTabs}
        activeId={activeTab}
        onChange={navigateToTab}
        variant="dock"
        ariaLabel="Mobile navigation"
      />
    </nav>
    <AnimatePresence>{showPollModal && <NewPollModal onClose={() => setShowPollModal(false)} onCreate={handleCreatePoll} reduceMotion={reduceMotion} />}</AnimatePresence>
  </div>;
}

function MemberGate({
  client,
  currentUserEmail = '',
  onSignOut,
  passwordResetNotice,
  googleAccessToken,
  onUpdateGoogleToken,
  onClearGoogleToken,
}) {
  const [status, setStatus] = useState('loading');
  const [memberId, setMemberId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!client) return undefined;
    let active = true;
    setStatus('loading');
    setErrorMsg('');

    fetchCurrentMemberId(client)
      .then((resolvedId) => {
        if (!active) return;
        if (resolvedId && people.some((person) => person.id === resolvedId)) {
          setMemberId(resolvedId);
          setStatus('ready');
        } else {
          setMemberId(null);
          setStatus('unlinked');
        }
      })
      .catch((err) => {
        if (!active) return;
        setErrorMsg(err?.message || 'Không thể kiểm tra tài khoản thành viên.');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [client, retryCount]);

  if (status === 'loading') {
    return (
      <AuthLayout>
        <div className="auth-inner">
          <h1 id="auth-heading">Opening your planner</h1>
          <p className="auth-intro" role="status">Checking your member access…</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'error') {
    return (
      <AuthLayout>
        <div className="auth-inner">
          <h1 id="auth-heading">Không thể kết nối</h1>
          <p className="auth-intro" role="alert">{errorMsg}</p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="auth-primary" onClick={() => setRetryCount((c) => c + 1)}>
              Thử lại
            </button>
            <SessionExitButton onExit={onSignOut} />
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'unlinked') {
    return (
      <AuthLayout>
        <div className="auth-inner">
          {passwordResetNotice && <p className="auth-notice auth-success">{passwordResetNotice}</p>}
          <h1 id="auth-heading">Tài khoản chưa được liên kết</h1>
          <p className="auth-intro">
            {currentUserEmail
              ? `Tài khoản ${currentUserEmail} chưa nằm trong danh sách 7 thành viên.`
              : 'Tài khoản này chưa nằm trong danh sách 7 thành viên.'}{' '}
            Hãy nhờ trưởng nhóm thêm email hoặc Clerk user ID của bạn vào bảng <code>member_accounts</code> trên Supabase.
          </p>
          <SessionExitButton onExit={onSignOut} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <PlannerApp
      client={client}
      currentMemberId={memberId}
      currentUserEmail={currentUserEmail}
      googleAccessToken={googleAccessToken}
      onUpdateGoogleToken={onUpdateGoogleToken}
      onClearGoogleToken={onClearGoogleToken}
      onSignOut={onSignOut}
      passwordResetNotice={passwordResetNotice}
    />
  );
}

const DEV_LOGIN_ENABLED = import.meta.env.DEV;

export default function App() {
  const [googleSession, setGoogleSession] = useState(null);
  const [checkingGoogle, setCheckingGoogle] = useState(hasSupabaseConfiguration);
  const [googleAccessToken, setGoogleAccessToken] = useState('');
  const [devMemberId, setDevMemberId] = useState(() => {
    if (!DEV_LOGIN_ENABLED) return null;
    try {
      return localStorage.getItem('fish-dev-member') || null;
    } catch {
      return null;
    }
  });

  const handleDevLogin = (memberId) => {
    if (!DEV_LOGIN_ENABLED) return;
    setDevMemberId(memberId);
    try {
      localStorage.setItem('fish-dev-member', memberId);
    } catch {}
  };

  const handleDevSignOut = () => {
    setDevMemberId(null);
    try {
      localStorage.removeItem('fish-dev-member');
    } catch {}
  };

  useEffect(() => {
    if (!hasSupabaseConfiguration) return undefined;
    const supabase = getGoogleSupabase();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setGoogleSession(data?.session ?? null);
      setCheckingGoogle(false);
    }).catch(() => {
      if (!active) return;
      setCheckingGoogle(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setGoogleSession(session ?? null);
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (!hasSupabaseConfiguration) {
    return (
      <AuthLayout>
        <div className="auth-inner">
          <h1 id="auth-heading">Cần cấu hình Supabase</h1>
          <p className="auth-intro">
            Trang chưa được cấu hình. Thêm <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> vào <code>.env</code> hoặc biến môi trường Cloudflare Pages (xem <code>docs/GO-LIVE.md</code>).
          </p>
        </div>
      </AuthLayout>
    );
  }

  async function handleGoogleSignIn() {
    const supabase = getGoogleSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) throw error;
  }

  async function signOutGoogle() {
    if (googleAccessToken) revokeGoogleToken(googleAccessToken);
    setGoogleAccessToken('');
    await getGoogleSupabase().auth.signOut();
  }

  function updateGoogleToken({ accessToken }) {
    setGoogleAccessToken(accessToken || '');
  }

  function clearGoogleToken() {
    setGoogleAccessToken('');
  }

  if (DEV_LOGIN_ENABLED && devMemberId) {
    return (
      <PlannerApp
        client={null}
        currentMemberId={devMemberId}
        currentUserEmail={`${devMemberId}@fishuponthesky.local`}
        googleAccessToken={googleAccessToken}
        onUpdateGoogleToken={updateGoogleToken}
        onClearGoogleToken={clearGoogleToken}
        onSignOut={handleDevSignOut}
        onSwitchMember={handleDevLogin}
        passwordResetNotice={null}
      />
    );
  }

  if (checkingGoogle) {
    return (
      <AuthLayout>
        <div className="auth-inner">
          <h1 id="auth-heading">Opening your planner</h1>
          <p className="auth-intro" role="status">Checking your sign-in…</p>
        </div>
      </AuthLayout>
    );
  }

  if (googleSession) {
    return (
      <MemberGate
        client={getGoogleSupabase()}
        currentUserEmail={googleSession.user?.email || ''}
        onSignOut={signOutGoogle}
        googleAccessToken={googleAccessToken}
        onUpdateGoogleToken={updateGoogleToken}
        onClearGoogleToken={clearGoogleToken}
      />
    );
  }

  return (
    <ClerkAuthRoot
      publishableKey={clerkPublishableKey}
      googleAvailable={hasSupabaseConfiguration}
      onGoogleSignIn={handleGoogleSignIn}
      onDevLogin={DEV_LOGIN_ENABLED ? handleDevLogin : undefined}
      people={people}
      renderPlanner={(identity) => (
        <MemberGate
          {...identity}
          googleAccessToken={googleAccessToken}
          onUpdateGoogleToken={updateGoogleToken}
          onClearGoogleToken={clearGoogleToken}
        />
      )}
    />
  );
}
