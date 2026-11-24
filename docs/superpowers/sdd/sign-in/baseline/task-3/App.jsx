import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const people = [
  { id: 'bao', name: 'Bảo', color: 'blue' },
  { id: 'hang', name: 'Hằng', color: 'lemon' },
  { id: 'diem', name: 'Diễm', color: 'cream' },
  { id: 'quynh', name: 'Quỳnh', color: 'sky' },
  { id: 'quoc-anh', name: 'Quốc Anh', color: 'cream' },
  { id: 'thu', name: 'Thư', color: 'lemon' },
  { id: 'thien', name: 'Thiên', color: 'blue' },
];

const initialPolls = [
  {
    id: 'market-stroll',
    title: 'Market stroll & tea',
    detail: 'A slow afternoon, good snacks, no rushing.',
    status: 'Voting',
    deadline: 'Fri, Nov 27',
    placeOptions: ['Old Quarter', 'West Lake', 'Let the group pick'],
    budgetOptions: ['Under ₫300k', '₫300k–₫500k', 'Keep it flexible'],
    options: [
      { id: 'dec-5', label: 'Sat, Dec 5 · 4:00 PM' },
      { id: 'dec-6', label: 'Sun, Dec 6 · 3:00 PM' },
      { id: 'dec-12', label: 'Sat, Dec 12 · 4:00 PM' },
    ],
    votes: { bao: ['dec-5'], hang: ['dec-5', 'dec-6'], diem: ['dec-6'], quynh: ['dec-5'], 'quoc-anh': [], thu: ['dec-12'], thien: [] },
    placeVotes: { bao: ['Old Quarter'], hang: ['Old Quarter'], diem: ['West Lake'], quynh: ['Old Quarter'], 'quoc-anh': [], thu: ['Let the group pick'], thien: [] },
    budgetVotes: { bao: ['Under ₫300k'], hang: ['Under ₫300k'], diem: ['₫300k–₫500k'], quynh: ['Under ₫300k'], 'quoc-anh': [], thu: ['Keep it flexible'], thien: [] },
  },
];

const initialOutings = [
  { id: 'river-picnic', title: 'Riverside picnic', date: 'Sat, Nov 14', place: 'West Lake', status: 'Done', sheetUrl: '' },
  { id: 'market-stroll', title: 'Market stroll & tea', date: 'Vote closes Nov 27', place: 'Choosing together', status: 'Planning', sheetUrl: '' },
  { id: 'winter-day', title: 'A little winter day out', date: 'Date to be decided', place: 'Open for ideas', status: 'Idea', sheetUrl: '' },
];

const navItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'outings', label: 'Outings', icon: 'spark' },
  { id: 'money', label: 'Money', icon: 'wallet' },
  { id: 'members', label: 'Members', icon: 'people' },
];

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="m3.5 10 8.5-7 8.5 7" /><path d="M5.5 9v10h13V9M9 19v-6h6v6" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="16" rx="3" /><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" /><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></>,
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
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

function Avatar({ person, small = false }) {
  return <span className={`avatar avatar-${person.color}${small ? ' avatar-small' : ''}`} title={person.name}>{person.name.slice(0, 1)}</span>;
}

function AvatarStack({ count = people.length }) {
  return <div className="avatar-stack" aria-label={`${count} group members`}>
    {people.slice(0, 5).map((person) => <Avatar key={person.id} person={person} small />)}
    <span className="avatar-more">+{Math.max(0, count - 5)}</span>
  </div>;
}

function SectionHeading({ kicker, title, action, onAction }) {
  return <div className="section-heading">
    <div><span className="eyebrow">{kicker}</span><h2>{title}</h2></div>
    {action && <button className="text-button" onClick={onAction}>{action}<Icon name="arrow" size={17} /></button>}
  </div>;
}

function VoteCard({ poll, currentMemberId, onToggleVote }) {
  const memberVotes = poll.votes?.[currentMemberId] ?? [];
  const responded = Object.values(poll.votes ?? {}).filter((votes) => votes.length > 0).length;
  const renderIdeaGroup = (label, options, voteKey) => options?.length > 0 && <div className="vote-idea-group"><span className="vote-idea-label">{label}</span><div className="vote-chip-list">{options.map((option) => {
    const selected = (poll[voteKey]?.[currentMemberId] ?? []).includes(option);
    const count = Object.values(poll[voteKey] ?? {}).filter((votes) => votes.includes(option)).length;
    return <button type="button" key={option} className={`vote-chip${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={() => onToggleVote(poll.id, option, voteKey)}>{option}<strong>{count}</strong></button>;
  })}</div></div>;
  return <article className="vote-card">
    <div className="vote-card-top">
      <span className="status status-voting"><span /> Vote open</span>
      <span className="deadline"><Icon name="clock" size={15} /> Closes {poll.deadline}</span>
    </div>
    <h3>{poll.title}</h3>
    <p>{poll.detail}</p>
    <div className="vote-options" role="group" aria-label={`Vote for dates for ${poll.title}`}>
      {poll.options.map((option) => {
        const voters = Object.values(poll.votes ?? {}).filter((votes) => votes.includes(option.id)).length;
        const selected = memberVotes.includes(option.id);
        return <button key={option.id} className={`vote-option${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={() => onToggleVote(poll.id, option.id, 'votes')}>
          <span className="vote-check"><Icon name="check" size={14} /></span>
          <span>{option.label}</span>
          <strong>{voters}</strong>
        </button>;
      })}
    </div>
    {renderIdeaGroup('Place ideas', poll.placeOptions, 'placeVotes')}
    {renderIdeaGroup('Budget ideas', poll.budgetOptions, 'budgetVotes')}
    <div className="vote-foot"><span>{responded} of 7 members have responded</span><span>Reminder before the deadline</span></div>
  </article>;
}

function NewPollModal({ onClose, onCreate, reduceMotion }) {
  const [title, setTitle] = useState('A little afternoon together');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDates, setSelectedDates] = useState(['2026-12-05']);
  const [placeOptions, setPlaceOptions] = useState('Old Quarter\nWest Lake\nLet the group pick');
  const [budgetOptions, setBudgetOptions] = useState('Under ₫300k\n₫300k–₫500k\nKeep it flexible');
  const monthStart = new Date(2026, 11 + monthOffset, 1);
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
    if (!title.trim() || selectedDates.length === 0) return;
    const selectedOptions = selectedDates.map((id) => {
      const [selectedYear, selectedMonth, selectedDay] = id.split('-').map(Number);
      const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
      return { id, label: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · 4:00 PM` };
    });
    onCreate({
      id: `poll-${Date.now()}`,
      title: title.trim(),
      detail: 'Pick the time that works best for you.',
      status: 'Voting',
      deadline: 'Nov 27',
      options: selectedOptions,
      placeOptions: placeOptions.split('\n').map((item) => item.trim()).filter(Boolean),
      budgetOptions: budgetOptions.split('\n').map((item) => item.trim()).filter(Boolean),
      votes: {},
      placeVotes: {},
      budgetVotes: {},
    });
  };
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <motion.form className="poll-modal" onSubmit={submit} initial={{ opacity: 0, y: reduceMotion ? 0 : 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: 0.98 }} transition={{ duration: 0.22 }}>
      <div className="modal-heading"><div><span className="eyebrow">Start with the calendar</span><h2>Make a new plan</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={onClose}><Icon name="close" /></button></div>
      <label className="field-label" htmlFor="poll-title">What are we planning?</label>
      <input id="poll-title" className="text-input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={64} required />
      <div className="field-label field-label-row"><span>Pick possible dates</span><span className="field-hint">Select every day that could work</span></div>
      <div className="poll-calendar">
        <div className="poll-calendar-toolbar"><button type="button" className="icon-button" aria-label="Previous month" onClick={() => setMonthOffset((value) => value - 1)}>‹</button><strong>{monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong><button type="button" className="icon-button" aria-label="Next month" onClick={() => setMonthOffset((value) => value + 1)}>›</button></div>
        <div className="calendar-grid calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid poll-calendar-days">{monthCells.map((day, index) => {
          if (!day) return <span className="calendar-empty" key={`pad-${index}`} />;
          const option = choices.find((choice) => choice.day === day);
          const selected = selectedDates.includes(option.id);
          return <button type="button" key={option.id} className={`poll-calendar-day${selected ? ' is-selected' : ''}`} aria-pressed={selected} aria-label={`${option.label}${selected ? ', selected' : ''}`} onClick={() => toggleDate(option.id)}><span>{day}</span>{selected && <i />}</button>;
        })}</div>
        <div className="selected-date-note"><Icon name="clock" size={15} /><span>Selected dates are offered at 4:00 PM; you can choose more than one.</span></div>
      </div>
      <div className="modal-two-col">
        <label className="field-label">Place ideas <span className="field-hint">One per line</span><textarea className="text-input textarea" value={placeOptions} onChange={(event) => setPlaceOptions(event.target.value)} rows="3" /></label>
        <label className="field-label">Budget ideas <span className="field-hint">One per line</span><textarea className="text-input textarea" value={budgetOptions} onChange={(event) => setBudgetOptions(event.target.value)} rows="3" /></label>
      </div>
      <div className="modal-actions"><p><Icon name="people" size={16} /> Everyone in Fish Upon The Sky can vote and edit</p><button className="button button-primary" type="submit">Open this vote <Icon name="arrow" size={17} /></button></div>
    </motion.form>
  </motion.div>;
}

function HomeView({ polls, outings, onNewPoll, onVote, currentMemberId, goTo }) {
  const openPoll = polls.find((poll) => poll.status === 'Voting');
  const nextOuting = outings.find((outing) => outing.status !== 'Done');
  const sheetMissing = outings.filter((outing) => outing.status === 'Done' && !outing.sheetUrl).length;
  return <>
    <motion.section className="welcome-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
      <div className="welcome-copy"><span className="eyebrow">A little plan, a lot of sky</span><h1>Make room for<br /><span>the good stuff.</span></h1><p>Dates, ideas, little jobs and shared costs—all in one place for the seven of you.</p><button className="button button-primary" onClick={onNewPoll}>Plan the next outing <Icon name="arrow" size={17} /></button></div>
      <div className="welcome-art" aria-hidden="true"><div className="sun-disc" /><div className="sky-line sky-line-one" /><div className="sky-line sky-line-two" /><div className="fish-shape"><span /><i /></div><span className="art-sticker sticker-small">GOOD<br />PLANS</span><span className="art-caption">FISH UPON<br />THE SKY</span></div>
      <div className="welcome-stats"><span><strong>07</strong> people</span><span className="stat-divider" /><span><strong>01</strong> shared plan</span><AvatarStack /></div>
    </motion.section>

    <div className="home-content-grid">
      <section className="home-main-column">
        <SectionHeading kicker="Your little to-do list" title="My tasks" action="See outings" onAction={() => goTo('outings')} />
        <div className="task-list">
          {openPoll && <button className="task-row" onClick={() => goTo('outings')}><span className="task-icon task-icon-blue"><Icon name="calendar" /></span><span className="task-copy"><strong>Vote on {openPoll.title}</strong><small>Choose the dates that work for you</small></span><span className="task-meta">Due {openPoll.deadline}<Icon name="arrow" size={16} /></span></button>}
          {sheetMissing > 0 && <button className="task-row" onClick={() => goTo('money')}><span className="task-icon task-icon-lemon"><Icon name="link" /></span><span className="task-copy"><strong>Add the expense sheet</strong><small>Riverside picnic · link not added yet</small></span><span className="task-meta">Whenever you’re ready<Icon name="arrow" size={16} /></span></button>}
          <button className="task-row" onClick={() => goTo('calendar')}><span className="task-icon task-icon-cream"><Icon name="calendar" /></span><span className="task-copy"><strong>Mark your busy days</strong><small>Help everyone find a date that fits</small></span><span className="task-meta">Open calendar<Icon name="arrow" size={16} /></span></button>
        </div>
        <div className="home-note"><span className="note-spark"><Icon name="spark" /></span><div><strong>One thing at a time.</strong><p>We’ll keep the unfinished bits here, so no one has to hunt for them.</p></div></div>
      </section>

      <aside className="home-side-column">
        <section className="up-next-card">
          <div className="card-topline"><span className="eyebrow">Coming together</span><span className="status status-planning"><span /> {nextOuting?.status ?? 'Open'}</span></div>
          <h3>{nextOuting?.title ?? 'Your next little adventure'}</h3>
          <p className="muted-copy">{nextOuting?.date ?? 'Pick a date together'} · {nextOuting?.place ?? 'Somewhere good'}</p>
          <div className="up-next-art" aria-hidden="true"><span className="art-sun" /><span className="art-hill art-hill-back" /><span className="art-hill art-hill-front" /><span className="tiny-fish">✦</span></div>
          <button className="text-button" onClick={() => goTo('outings')}>Open outing <Icon name="arrow" size={17} /></button>
        </section>
        <section className="birthday-card"><div className="birthday-icon"><Icon name="heart" /></div><div><span className="eyebrow">A good thing to remember</span><h3>Birthday dates</h3><p>Add them to member profiles and we’ll keep the next one in sight.</p></div><button className="round-arrow" aria-label="Open members" onClick={() => goTo('members')}><Icon name="arrow" size={17} /></button></section>
      </aside>
    </div>
    {openPoll && <section className="poll-section"><SectionHeading kicker="A decision in progress" title="Pick a time that works" action="All outings" onAction={() => goTo('outings')} /><VoteCard poll={openPoll} currentMemberId={currentMemberId} onToggleVote={onVote} /></section>}
  </>;
}

function CalendarView({ onNewPoll, currentMemberId, busyDays, setBusyDays }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const start = new Date(2026, 10 + monthOffset, 1);
  const year = start.getFullYear();
  const month = start.getMonth();
  const firstWeekday = (start.getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const dayCells = [...Array(firstWeekday).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  const todayBusy = busyDays[currentMemberId] ?? [];
  const toggleBusy = (dayKey) => setBusyDays((old) => {
    const current = old[currentMemberId] ?? [];
    const next = current.includes(dayKey) ? current.filter((d) => d !== dayKey) : [...current, dayKey];
    return { ...old, [currentMemberId]: next };
  });
  const title = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return <section className="page-section calendar-page">
    <div className="page-title-row"><div><span className="eyebrow">All seven schedules, one view</span><h1>Find a day that fits.</h1><p>Tap a date to mark yourself busy. The group can build a plan around everyone’s free time.</p></div><button className="button button-primary" onClick={onNewPoll}><Icon name="plus" size={18} /> Open a new vote</button></div>
    <div className="calendar-layout">
      <section className="calendar-card">
        <div className="calendar-toolbar"><button className="icon-button" aria-label="Previous month" onClick={() => setMonthOffset((value) => value - 1)}>‹</button><h2>{title}</h2><button className="icon-button" aria-label="Next month" onClick={() => setMonthOffset((value) => value + 1)}>›</button></div>
        <div className="calendar-grid calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid calendar-days">{dayCells.map((day, index) => {
          if (!day) return <span className="calendar-empty" key={`empty-${index}`} />;
          const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isBusy = todayBusy.includes(dayKey);
          const hasIdea = [5, 6, 12, 19].includes(day) && month === 11;
          return <button key={dayKey} className={`calendar-day${isBusy ? ' is-busy' : ''}${hasIdea ? ' has-idea' : ''}`} aria-label={`${title} ${day}${isBusy ? ', marked busy' : ''}`} aria-pressed={isBusy} onClick={() => toggleBusy(dayKey)}><span>{day}</span>{hasIdea && <i />}</button>;
        })}</div>
        <div className="calendar-legend"><span><i className="legend-busy" /> Your busy day</span><span><i className="legend-idea" /> Possible outing date</span><span>Tap a date to update yours</span></div>
      </section>
      <aside className="availability-card"><span className="eyebrow">A quick check-in</span><h2>Mark the days you can’t make.</h2><p>We’ll keep this prototype local to your browser. Everyone can try the flow by selecting a member below.</p><label className="field-label" htmlFor="member-switch">Editing as</label><MemberSelect id="member-switch" currentMemberId={currentMemberId} /><div className="availability-tip"><Icon name="spark" /><span>The best date is the one with room for everyone.</span></div></aside>
    </div>
  </section>;
}

function MemberSelect({ id = 'member-select', currentMemberId, onChange }) {
  return <select id={id} className="text-input member-select" value={currentMemberId} onChange={(event) => onChange?.(event.target.value)}>
    {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
  </select>;
}

function OutingsView({ polls, outings, onNewPoll, currentMemberId, onVote, goTo, onStatusChange }) {
  return <section className="page-section">
    <div className="page-title-row"><div><span className="eyebrow">Ideas turn into good days</span><h1>Outings & plans.</h1><p>From the first idea to the little checklist that gets everyone out the door.</p></div><button className="button button-primary" onClick={onNewPoll}><Icon name="plus" size={18} /> New outing poll</button></div>
    {polls.length > 0 && <div className="outings-polls"><SectionHeading kicker="Open decisions" title="Help choose what works" /><div className="poll-grid">{polls.map((poll) => <VoteCard key={poll.id} poll={poll} currentMemberId={currentMemberId} onToggleVote={onVote} />)}</div></div>}
    <SectionHeading kicker="The group’s story" title="Every plan has a place" />
    <div className="outing-list">{outings.map((outing) => <article className="outing-row" key={outing.id}><span className={`outing-marker marker-${outing.status.toLowerCase()}`}><Icon name={outing.status === 'Done' ? 'check' : 'spark'} size={18} /></span><div className="outing-main"><div className="outing-title-line"><h3>{outing.title}</h3><label className="sr-only" htmlFor={`status-${outing.id}`}>Update status for {outing.title}</label><select id={`status-${outing.id}`} className={`status-select status-${outing.status.toLowerCase()}`} value={outing.status} onChange={(event) => onStatusChange(outing.id, event.target.value)}><option>Idea</option><option>Planning</option><option>Confirmed</option><option>Done</option></select></div><p>{outing.date} <span>·</span> {outing.place}</p></div><button className="text-button" onClick={() => goTo('money')}>Expense sheet <Icon name="arrow" size={17} /></button></article>)}</div>
    <div className="soft-callout"><span className="callout-illustration"><Icon name="heart" size={23} /></span><div><strong>Small plans count too.</strong><p>Keep even the “maybe sometime” ideas here until the right day appears.</p></div></div>
  </section>;
}

function MoneyView({ outings, sheetUrls, onSheetChange, onSheetSave }) {
  return <section className="page-section">
    <div className="page-title-row"><div><span className="eyebrow">One sheet for each outing</span><h1>Money, kept simple.</h1><p>Each plan has its own expense sheet. Add its link here so the whole group can find it later.</p></div><div className="money-stamp">NO<br />SURPRISE<br />SPLITS</div></div>
    <div className="money-intro"><div className="money-intro-icon"><Icon name="wallet" size={25} /></div><div><strong>The outing’s sheet does the math.</strong><p>Keep detailed costs in the group’s separate sheet. This page only keeps the link and its status.</p></div></div>
    <div className="expense-list">{outings.map((outing) => {
      const value = sheetUrls[outing.id] ?? outing.sheetUrl;
      const added = Boolean(value);
      return <article className="expense-row" key={outing.id}>
        <div className="expense-heading"><div><span className="eyebrow">{outing.date}</span><h3>{outing.title}</h3></div><span className={`sheet-status${added ? ' added' : ''}`}><i />{added ? 'Sheet added' : 'Not added'}</span></div>
        <p className="muted-copy">{outing.place}</p>
        {added ? <div className="sheet-link-row"><span className="sheet-link-name"><Icon name="link" size={17} /> Expense sheet attached</span><a className="button button-secondary" href={value} target="_blank" rel="noreferrer">Open sheet <Icon name="arrow" size={16} /></a><button className="quiet-button" onClick={() => onSheetChange(outing.id, '')}>Edit link</button></div> : <form className="sheet-form" onSubmit={(event) => { event.preventDefault(); onSheetSave(outing.id); }}><label className="sr-only" htmlFor={`expense-link-${outing.id}`}>Expense sheet URL for {outing.title}</label><input id={`expense-link-${outing.id}`} className="text-input" type="url" placeholder="Paste the shared sheet link" value={sheetUrls[outing.id] ?? ''} onChange={(event) => onSheetChange(outing.id, event.target.value)} /><button className="button button-secondary" type="submit" disabled={!(sheetUrls[outing.id] ?? '').trim()}><Icon name="link" size={16} /> Add sheet link</button></form>}
      </article>;
    })}</div>
  </section>;
}

function MembersView({ members, setMembers, currentMemberId, setCurrentMemberId }) {
  const updatePerson = (id, key, value) => setMembers((current) => current.map((person) => person.id === id ? { ...person, [key]: value } : person));
  return <section className="page-section">
    <div className="page-title-row"><div><span className="eyebrow">Seven good humans</span><h1>The people behind the plans.</h1><p>Nicknames are optional. Add a birthday or useful note when you want the group to remember it.</p></div><div className="member-count"><strong>07</strong><span>members<br />one group</span></div></div>
    <div className="profile-note"><Icon name="edit" /><span>Prototype mode: everyone can try editing a profile. Changes stay in this browser only.</span><label className="profile-editor">Preview as <MemberSelect currentMemberId={currentMemberId} onChange={setCurrentMemberId} /></label></div>
    <div className="member-grid">{members.map((person) => <article className="member-card" key={person.id}>
      <div className="member-card-top"><Avatar person={person} /><span className="member-card-spark"><Icon name="spark" size={17} /></span></div>
      <label className="field-label" htmlFor={`nickname-${person.id}`}>Display nickname</label><input id={`nickname-${person.id}`} className="text-input" placeholder="Choose your own" value={person.nickname} onChange={(event) => updatePerson(person.id, 'nickname', event.target.value)} />
      <h3>{person.name}</h3>
      <div className="profile-fields"><label className="field-label" htmlFor={`birthday-${person.id}`}>Birthday<input id={`birthday-${person.id}`} className="text-input" type="text" placeholder="Add a date" value={person.birthday ?? ''} onChange={(event) => updatePerson(person.id, 'birthday', event.target.value)} /></label><label className="field-label" htmlFor={`contact-${person.id}`}>Contact<input id={`contact-${person.id}`} className="text-input" type="text" placeholder="Add a contact" value={person.contact ?? ''} onChange={(event) => updatePerson(person.id, 'contact', event.target.value)} /></label><label className="field-label" htmlFor={`food-${person.id}`}>Dietary notes<input id={`food-${person.id}`} className="text-input" type="text" placeholder="Allergies or preferences" value={person.foodNotes ?? ''} onChange={(event) => updatePerson(person.id, 'foodNotes', event.target.value)} /></label></div>
      <div className="member-card-foot"><span><i /> Can edit group plans</span><span className="member-quiet">No login in prototype</span></div>
    </article>)}</div>
  </section>;
}

function Sticker({ type, className = '' }) {
  if (type === 'smile') return <svg className={`sticker-svg ${className}`} viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="33" fill="var(--palette-citrus)" stroke="var(--palette-cream)" strokeWidth="5" /><circle cx="29" cy="32" r="3" fill="var(--color-text)" /><circle cx="51" cy="32" r="3" fill="var(--color-text)" /><path d="M25 46c8 12 22 12 30 0" fill="none" stroke="var(--color-text)" strokeWidth="4" strokeLinecap="round" /></svg>;
  if (type === 'flower') return <svg className={`sticker-svg ${className}`} viewBox="0 0 80 80" aria-hidden="true"><g fill="var(--palette-cream)" stroke="var(--palette-amalfi)" strokeWidth="2.5">{Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="40" cy="20" rx="8" ry="15" transform={`rotate(${i * 45} 40 40)`} />)}</g><circle cx="40" cy="40" r="10" fill="var(--palette-citrus)" stroke="var(--palette-amalfi)" strokeWidth="2.5" /></svg>;
  return <svg className={`sticker-svg ${className}`} viewBox="0 0 80 80" aria-hidden="true"><path d="M40 5 47 24 67 14 58 34 77 40 58 47 68 66 47 58 40 77 33 58 13 68 23 47 4 40 23 33 13 14 33 23Z" fill="var(--palette-citrus)" stroke="var(--palette-cream)" strokeWidth="4" strokeLinejoin="round" /><circle cx="40" cy="40" r="8" fill="var(--palette-amalfi)" /></svg>;
}

function StickerSlapFooter({ onNavigate, onNewPoll, reduceMotion }) {
  const reveal = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 };
  return <motion.footer className="sticker-footer" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }} whileInView={reveal} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
    <div className="footer-cream-frame">
      <div className="footer-topline"><span>GOOD COMPANY</span><span className="footer-line" /><span>EST. EVERY PLAN</span></div>
      <div className="footer-cream-content"><div><span className="eyebrow">A note from Fish Upon The Sky</span><h2>Make the next one<br /><em>happen.</em></h2></div><button className="footer-sticker-button" onClick={onNewPoll}><Sticker type="star" className="button-sticker" /><span>Start a little plan</span><Icon name="arrow" size={17} /></button></div>
      <div className="footer-decor footer-decor-left"><Sticker type="flower" /></div><div className="footer-decor footer-decor-right"><Sticker type="smile" /></div>
    </div>
    <div className="footer-blue-panel">
      <div className="footer-columns"><div className="footer-brand"><div className="footer-script">Fish Upon<br />The Sky</div><p>Good plans, shared lightly.</p></div><div className="footer-column"><span>FIND YOUR WAY</span>{navItems.map((item) => <button key={item.id} onClick={() => onNavigate(item.id)}>{item.label}</button>)}</div><div className="footer-column"><span>THE GROUP</span><p>Seven people<br />One very full calendar</p><button onClick={() => onNavigate('members')}>Meet the crew <Icon name="arrow" size={14} /></button></div><div className="footer-column footer-contact"><span>GOT A LITTLE IDEA?</span><button onClick={onNewPoll}>Turn it into a plan <Icon name="arrow" size={14} /></button><div className="footer-mini-stickers"><Sticker type="star" /><Sticker type="flower" /></div></div></div>
      <div className="footer-wordmark-wrap"><span className="footer-wordmark">Fish Upon The Sky</span><span className="footer-wordmark-note">THE PLAN IS BETTER TOGETHER</span></div>
      <div className="footer-bottom"><span>Built for the good days and the getting-there.</span><span>FISH UPON THE SKY · 7 MEMBERS</span></div>
    </div>
  </motion.footer>;
}

function App() {
  const reduceMotion = useReducedMotion();
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('home');
  const [showPollModal, setShowPollModal] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState('bao');
  const [busyDays, setBusyDays] = useState({});
  const [members, setMembers] = useState(people.map((person) => ({ ...person, nickname: '', birthday: '', foodNotes: '' })));
  const [polls, setPolls] = useState(initialPolls);
  const [outings, setOutings] = useState(initialOutings);
  const [sheetUrls, setSheetUrls] = useState({});
  const currentMember = useMemo(() => members.find((person) => person.id === currentMemberId) ?? members[0], [members, currentMemberId]);

  const toggleVote = (pollId, optionId, voteKey = 'votes') => setPolls((current) => current.map((poll) => {
    if (poll.id !== pollId) return poll;
    const personVotes = poll[voteKey]?.[currentMemberId] ?? [];
    const nextVotes = personVotes.includes(optionId) ? personVotes.filter((value) => value !== optionId) : [...personVotes, optionId];
    return { ...poll, [voteKey]: { ...poll[voteKey], [currentMemberId]: nextVotes } };
  }));
  const createPoll = (poll) => {
    setPolls((current) => [poll, ...current]);
    setOutings((current) => [{ id: poll.id, title: poll.title, date: 'Vote closes Nov 27', place: 'Choosing together', status: 'Planning', sheetUrl: '' }, ...current]);
    setShowPollModal(false);
    setActiveTab('outings');
  };
  const changeSheet = (outingId, value) => setSheetUrls((current) => ({ ...current, [outingId]: value }));
  const saveSheet = (outingId) => {
    setOutings((current) => current.map((outing) => outing.id === outingId ? { ...outing, sheetUrl: sheetUrls[outingId]?.trim() ?? '' } : outing));
  };
  const changeOutingStatus = (outingId, status) => setOutings((current) => current.map((outing) => outing.id === outingId ? { ...outing, status } : outing));

  const titleByTab = { home: `Good morning, ${currentMember.nickname || currentMember.name}.`, calendar: 'The shared calendar', outings: 'Plans in motion', money: 'The little money list', members: 'Your people' };
  const subtitleByTab = { home: 'Your group has a few things to line up.', calendar: 'Make space for a date that works for everyone.', outings: 'Ideas, votes, and the next good day out.', money: 'Each outing keeps its own expense sheet.', members: 'Seven people, one shared plan.' };

  return <div className={`app-shell${theme === 'dark' ? ' theme-dark' : ''}`}>
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => setActiveTab('home')} aria-label="Fish Upon The Sky home"><span className="brand-fish">F</span><span><strong>Fish Upon<br />The Sky</strong><small>GROUP SPACE</small></span></button>
      <span className="nav-caption">YOUR LITTLE CORNER</span>
      <nav className="side-nav" aria-label="Main navigation">{navItems.map((item) => <button key={item.id} className={`nav-item${activeTab === item.id ? ' is-active' : ''}`} onClick={() => setActiveTab(item.id)}><Icon name={item.icon} size={19} /><span>{item.label}</span>{item.id === 'outings' && polls.some((poll) => poll.status === 'Voting') && <i className="nav-notice" />}</button>)}</nav>
      <div className="sidebar-bottom"><span className="nav-caption">PLAYING AS</span><label className="sr-only" htmlFor="sidebar-member">Choose a member for this prototype</label><MemberSelect id="sidebar-member" currentMemberId={currentMemberId} onChange={setCurrentMemberId} /><div className="prototype-tag"><span /> Prototype · sample data</div></div>
    </aside>

    <div className="app-main">
      <header className="topbar"><div className="topbar-context"><span className="crumb">FISH UPON THE SKY <i>/</i> {activeTab.toUpperCase()}</span><h2>{titleByTab[activeTab]}</h2><p>{subtitleByTab[activeTab]}</p></div><div className="topbar-actions"><button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} /></button><div className="topbar-member" title={`Editing as ${currentMember.name}`}><Avatar person={currentMember} small /><span>{currentMember.nickname || currentMember.name}</span></div><button className="button button-primary topbar-new" onClick={() => setShowPollModal(true)}><Icon name="plus" size={18} /> New outing poll</button></div></header>
      <main className="page-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={activeTab} className="page-view" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }} transition={{ duration: reduceMotion ? 0.01 : 0.22 }}>
            {activeTab === 'home' && <HomeView polls={polls} outings={outings} onNewPoll={() => setShowPollModal(true)} onVote={toggleVote} currentMemberId={currentMemberId} goTo={setActiveTab} />}
            {activeTab === 'calendar' && <CalendarView onNewPoll={() => setShowPollModal(true)} currentMemberId={currentMemberId} busyDays={busyDays} setBusyDays={setBusyDays} />}
            {activeTab === 'outings' && <OutingsView polls={polls} outings={outings} onNewPoll={() => setShowPollModal(true)} currentMemberId={currentMemberId} onVote={toggleVote} goTo={setActiveTab} onStatusChange={changeOutingStatus} />}
            {activeTab === 'money' && <MoneyView outings={outings} sheetUrls={sheetUrls} onSheetChange={changeSheet} onSheetSave={saveSheet} />}
            {activeTab === 'members' && <MembersView members={members} setMembers={setMembers} currentMemberId={currentMemberId} setCurrentMemberId={setCurrentMemberId} />}
          </motion.div>
        </AnimatePresence>
        <StickerSlapFooter onNavigate={setActiveTab} onNewPoll={() => setShowPollModal(true)} reduceMotion={reduceMotion} />
      </main>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">{navItems.map((item) => <button key={item.id} className={activeTab === item.id ? 'is-active' : ''} onClick={() => setActiveTab(item.id)}><Icon name={item.icon} size={19} /><span>{item.label}</span></button>)}</nav>
    <AnimatePresence>{showPollModal && <NewPollModal onClose={() => setShowPollModal(false)} onCreate={createPoll} reduceMotion={reduceMotion} />}</AnimatePresence>
  </div>;
}

export default App;
