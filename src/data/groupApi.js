export function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizePoll(row, voteBuckets) {
  const data = row.data && typeof row.data === 'object' ? row.data : {};
  const today = todayKey();
  const deadlineDate = typeof data.deadlineDate === 'string' ? data.deadlineDate : '';
  const status = deadlineDate && deadlineDate < today ? 'Closed' : 'Voting';

  return {
    id: row.id,
    title: data.title || '',
    detail: data.detail || '',
    deadline: data.deadline || '',
    deadlineDate,
    options: Array.isArray(data.options) ? data.options : [],
    placeOptions: Array.isArray(data.placeOptions) ? data.placeOptions : [],
    budgetOptions: Array.isArray(data.budgetOptions) ? data.budgetOptions : [],
    status,
    votes: voteBuckets?.votes ?? {},
    placeVotes: voteBuckets?.placeVotes ?? {},
    budgetVotes: voteBuckets?.budgetVotes ?? {},
  };
}

function normalizeOuting(row) {
  const data = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    sheetUrl: '',
    albumUrl: '',
    photos: [],
    places: [],
    notes: [],
    ...data,
    id: row.id,
  };
}

export async function loadAll(client) {
  const [profilesRes, pollsRes, votesRes, outingsRes, busyRes] = await Promise.all([
    client.from('member_profiles').select('member_id, data'),
    client.from('polls').select('id, data, created_at').order('created_at', { ascending: false }),
    client.from('poll_votes').select('poll_id, member_id, kind, option'),
    client.from('outings').select('id, data, created_at').order('created_at', { ascending: false }),
    client.from('busy_days').select('member_id, day'),
  ]);

  for (const res of [profilesRes, pollsRes, votesRes, outingsRes, busyRes]) {
    if (res.error) throw res.error;
  }

  const profiles = {};
  for (const row of profilesRes.data || []) {
    profiles[row.member_id] = row.data && typeof row.data === 'object' ? row.data : {};
  }

  const votesByPoll = {};
  for (const row of votesRes.data || []) {
    if (!votesByPoll[row.poll_id]) {
      votesByPoll[row.poll_id] = { votes: {}, placeVotes: {}, budgetVotes: {} };
    }
    const bucket = votesByPoll[row.poll_id][row.kind];
    if (!bucket) continue;
    if (!bucket[row.member_id]) bucket[row.member_id] = [];
    bucket[row.member_id].push(row.option);
  }

  const polls = (pollsRes.data || []).map((row) => normalizePoll(row, votesByPoll[row.id]));
  const outings = (outingsRes.data || []).map(normalizeOuting);

  const busyDays = {};
  for (const row of busyRes.data || []) {
    if (!busyDays[row.member_id]) busyDays[row.member_id] = [];
    busyDays[row.member_id].push(row.day);
  }

  return { profiles, polls, outings, busyDays };
}

export async function saveProfile(client, memberId, data) {
  const { error } = await client.from('member_profiles').upsert(
    {
      member_id: memberId,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'member_id' },
  );
  if (error) throw error;
}

export async function createPoll(client, poll, outing, memberId) {
  const { id, votes: _v, placeVotes: _pv, budgetVotes: _bv, status: _s, ...pollData } = poll;
  const { error: pollErr } = await client.from('polls').insert({
    id,
    data: pollData,
    created_by: memberId,
  });
  if (pollErr) throw pollErr;

  if (outing) {
    const { id: outingId, ...outingData } = outing;
    const { error: outingErr } = await client.from('outings').insert({
      id: outingId,
      data: outingData,
      created_by: memberId,
      updated_at: new Date().toISOString(),
    });
    if (outingErr) throw outingErr;
  }
}

export async function setVote(client, { pollId, memberId, kind, option, selected }) {
  if (selected) {
    const { error } = await client.from('poll_votes').upsert(
      { poll_id: pollId, member_id: memberId, kind, option },
      { onConflict: 'poll_id,member_id,kind,option', ignoreDuplicates: true },
    );
    if (error) throw error;
    return;
  }
  const { error } = await client
    .from('poll_votes')
    .delete()
    .match({ poll_id: pollId, member_id: memberId, kind, option });
  if (error) throw error;
}

export async function saveOuting(client, outing, memberId) {
  const { id, ...data } = outing;
  const { error } = await client.from('outings').upsert(
    {
      id,
      data,
      created_by: memberId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function setBusyDay(client, memberId, day, busy) {
  if (busy) {
    const { error } = await client.from('busy_days').upsert(
      { member_id: memberId, day },
      { onConflict: 'member_id,day', ignoreDuplicates: true },
    );
    if (error) throw error;
    return;
  }
  const { error } = await client.from('busy_days').delete().match({ member_id: memberId, day });
  if (error) throw error;
}

export async function addBusyDays(client, memberId, days) {
  const unique = Array.from(new Set(days)).filter(Boolean);
  if (unique.length === 0) return;
  const rows = unique.map((day) => ({ member_id: memberId, day }));
  const { error } = await client
    .from('busy_days')
    .upsert(rows, { onConflict: 'member_id,day', ignoreDuplicates: true });
  if (error) throw error;
}

const REALTIME_TABLES = ['member_profiles', 'polls', 'poll_votes', 'outings', 'busy_days'];

export function subscribeGroup(client, onTableChange) {
  const channel = client.channel(`group-sync-${Date.now()}`);
  for (const table of REALTIME_TABLES) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      onTableChange?.(table);
    });
  }
  channel.subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
