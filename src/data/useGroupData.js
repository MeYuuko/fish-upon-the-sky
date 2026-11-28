import { useCallback, useEffect, useRef, useState } from 'react';
import { buildMemberProfiles, serializeMemberProfile } from './fishProfiles.js';
import {
  addBusyDays as apiAddBusyDays,
  createPoll as apiCreatePoll,
  loadAll,
  saveOuting as apiSaveOuting,
  saveProfile as apiSaveProfile,
  setBusyDay as apiSetBusyDay,
  setVote as apiSetVote,
  subscribeGroup,
} from './groupApi.js';
import { uploadImage } from './images.js';

const SAMPLE_POLLS = [
  {
    id: 'poll-weekend-gathering',
    title: 'Weekend coffee & catch up',
    detail: 'Pick the time that works best for you.',
    deadline: 'Sun, Nov 30',
    deadlineDate: '2026-11-30',
    options: [
      { id: '2026-11-29', label: 'Sat, Nov 29 · 4:00 PM' },
      { id: '2026-11-30', label: 'Sun, Nov 30 · 4:00 PM' },
    ],
    placeOptions: ['West Lake', 'Old Quarter', 'Let the group pick'],
    budgetOptions: ['Under ₫300k', '₫300k–₫500k'],
    status: 'Voting',
    votes: {
      bao: ['2026-11-29'],
      hang: ['2026-11-29', '2026-11-30'],
      diem: ['2026-11-29'],
      quynh: ['2026-11-29'],
    },
    placeVotes: { bao: ['West Lake'], hang: ['West Lake'] },
    budgetVotes: { bao: ['Under ₫300k'] },
  },
];

const SAMPLE_OUTINGS = [
  {
    id: 'outing-west-lake',
    title: 'Hồ Tây Sunset & Coffee',
    date: 'Sat, Nov 29',
    place: 'Hồ Tây, Hà Nội',
    status: 'Confirmed',
    sheetUrl: '',
    albumUrl: '',
    photos: [],
    places: [{ id: 'pl-1', name: 'Trấn Vũ Coffee', category: 'Cafe', addedBy: 'Hằng' }],
    notes: [{ id: 'nt-1', text: 'Hẹn nhau lúc 16:30 đón hoàng hôn.', author: 'Bảo', createdAt: 'Nov 27' }],
  },
  {
    id: 'outing-bavi',
    title: 'Chuyến đi Ba Vì cuối năm',
    date: 'Dec 14 – 15',
    place: 'Vườn quốc gia Ba Vì',
    status: 'Planning',
    sheetUrl: '',
    albumUrl: '',
    photos: [],
    places: [{ id: 'pl-2', name: 'Đồi Thông', category: 'Camping', addedBy: 'Thiên' }],
    notes: [{ id: 'nt-2', text: 'Mang áo ấm vì trên đồi gió lạnh.', author: 'Quỳnh', createdAt: 'Nov 26' }],
  },
  {
    id: 'outing-memory',
    title: 'Kỷ niệm 1 năm Fish Upon The Sky',
    date: 'Oct 20',
    place: 'Hà Nội',
    status: 'Done',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview',
    albumUrl: '',
    photos: [],
    places: [{ id: 'pl-3', name: 'Home Studio', category: 'Dinner', addedBy: 'Diễm' }],
    notes: [{ id: 'nt-3', text: 'Buổi tối nấu ăn cùng nhau siêu vui!', author: 'Thư', createdAt: 'Oct 21' }],
  },
];

const SAMPLE_BUSY_DAYS = {
  bao: ['2026-11-28'],
  hang: ['2026-11-27', '2026-11-28'],
  diem: ['2026-11-30'],
};

export function useGroupData(client, currentMemberId, people) {
  const [members, setMembers] = useState(() => {
    try {
      const local = !client && localStorage.getItem('fish-local-profiles');
      if (local) return JSON.parse(local);
    } catch {}
    return buildMemberProfiles(people, {});
  });
  const [polls, setPolls] = useState(() => {
    try {
      const local = !client && localStorage.getItem('fish-local-polls');
      if (local) return JSON.parse(local);
    } catch {}
    return !client ? SAMPLE_POLLS : [];
  });
  const [outings, setOutings] = useState(() => {
    try {
      const local = !client && localStorage.getItem('fish-local-outings');
      if (local) return JSON.parse(local);
    } catch {}
    return !client ? SAMPLE_OUTINGS : [];
  });
  const [busyDays, setBusyDays] = useState(() => {
    try {
      const local = !client && localStorage.getItem('fish-local-busy');
      if (local) return JSON.parse(local);
    } catch {}
    return !client ? SAMPLE_BUSY_DAYS : {};
  });
  const [loading, setLoading] = useState(Boolean(client));
  const [syncError, setSyncError] = useState('');

  const stateRef = useRef({ members, polls, outings, busyDays });
  stateRef.current = { members, polls, outings, busyDays };

  const peopleRef = useRef(people);
  peopleRef.current = people;

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!client) return;
    if (!silent) setLoading(true);
    try {
      const data = await loadAll(client);
      setMembers(buildMemberProfiles(peopleRef.current, data.profiles));
      setPolls(data.polls);
      setOutings(data.outings);
      setBusyDays(data.busyDays);
    } catch (err) {
      setSyncError(err?.message || 'Không thể đồng bộ dữ liệu nhóm từ Supabase.');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (!client) return undefined;
    let active = true;
    let debounceTimer = null;

    refresh();

    const scheduleRefresh = () => {
      if (!active) return;
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        if (active) refresh({ silent: true });
      }, 300);
    };

    const unsubscribe = subscribeGroup(client, scheduleRefresh);
    const handleFocus = () => scheduleRefresh();
    window.addEventListener('focus', handleFocus);

    return () => {
      active = false;
      if (debounceTimer) window.clearTimeout(debounceTimer);
      window.removeEventListener('focus', handleFocus);
      unsubscribe();
    };
  }, [client, refresh]);

  const dismissError = useCallback(() => setSyncError(''), []);

  const saveLocal = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  };

  const updateMemberProfile = useCallback(
    async (memberId, patch) => {
      if (memberId !== currentMemberId) {
        return { ok: false, error: 'Chỉ chủ hồ sơ mới có quyền chỉnh sửa.' };
      }

      const prevMembers = stateRef.current.members;
      const target = prevMembers.find((p) => p.id === memberId);
      if (!target) {
        return { ok: false, error: 'Không tìm thấy hồ sơ thành viên.' };
      }

      let resolvedPatch = { ...patch };

      try {
        if (client && typeof resolvedPatch.customPhoto === 'string' && resolvedPatch.customPhoto.startsWith('data:')) {
          resolvedPatch.customPhoto = await uploadImage(
            client,
            `profiles/${memberId}`,
            resolvedPatch.customPhoto,
            { maxWidth: 900, quality: 0.85 },
          );
        }

        if (client && Array.isArray(resolvedPatch.books)) {
          resolvedPatch.books = await Promise.all(
            resolvedPatch.books.map(async (book) => {
              if (typeof book?.image === 'string' && book.image.startsWith('data:')) {
                const url = await uploadImage(client, `profiles/${memberId}`, book.image, {
                  maxWidth: 900,
                  quality: 0.82,
                });
                return { ...book, image: url };
              }
              return book;
            }),
          );
        }

        const updatedMember = {
          ...target,
          ...resolvedPatch,
          id: target.id,
          name: target.name,
          color: target.color,
        };
        const nextMembers = prevMembers.map((p) => (p.id === memberId ? updatedMember : p));
        setMembers(nextMembers);

        if (!client) {
          saveLocal('fish-local-profiles', nextMembers);
          return { ok: true };
        }

        await apiSaveProfile(client, memberId, serializeMemberProfile(updatedMember));
        return { ok: true };
      } catch (err) {
        const message = err?.message || 'Không thể lưu hồ sơ lên máy chủ.';
        setSyncError(message);
        refresh({ silent: true });
        return { ok: false, error: message };
      }
    },
    [client, currentMemberId, refresh],
  );

  const toggleVote = useCallback(
    async (pollId, optionId, voteKey = 'votes') => {
      const currentPoll = stateRef.current.polls.find((p) => p.id === pollId);
      if (!currentPoll || currentPoll.status === 'Closed') return;

      const personVotes = currentPoll[voteKey]?.[currentMemberId] ?? [];
      const selected = !personVotes.includes(optionId);
      const nextVotes = selected
        ? [...personVotes, optionId]
        : personVotes.filter((value) => value !== optionId);

      const nextPolls = stateRef.current.polls.map((poll) =>
        poll.id === pollId
          ? { ...poll, [voteKey]: { ...poll[voteKey], [currentMemberId]: nextVotes } }
          : poll,
      );
      setPolls(nextPolls);

      if (!client) {
        saveLocal('fish-local-polls', nextPolls);
        return;
      }

      try {
        await apiSetVote(client, {
          pollId,
          memberId: currentMemberId,
          kind: voteKey,
          option: optionId,
          selected,
        });
      } catch (err) {
        setSyncError(err?.message || 'Không thể lưu bình chọn. Đang tải lại...');
        refresh({ silent: true });
      }
    },
    [client, currentMemberId, refresh],
  );

  const createPoll = useCallback(
    async (poll) => {
      const newOuting = {
        id: poll.id,
        title: poll.title,
        date: `Vote closes ${poll.deadline}`,
        place: 'Choosing together',
        status: 'Planning',
        sheetUrl: '',
        albumUrl: '',
        photos: [],
        places: [],
        notes: [],
      };

      const nextPolls = [poll, ...stateRef.current.polls];
      const nextOutings = [newOuting, ...stateRef.current.outings];
      setPolls(nextPolls);
      setOutings(nextOutings);

      if (!client) {
        saveLocal('fish-local-polls', nextPolls);
        saveLocal('fish-local-outings', nextOutings);
        return;
      }

      try {
        await apiCreatePoll(client, poll, newOuting, currentMemberId);
      } catch (err) {
        setSyncError(err?.message || 'Không thể tạo bình chọn mới. Đang tải lại...');
        refresh({ silent: true });
      }
    },
    [client, currentMemberId, refresh],
  );

  const updateTrip = useCallback(
    async (tripId, updater) => {
      const currentTrip = stateRef.current.outings.find((t) => t.id === tripId);
      if (!currentTrip) return;

      const rawNext = typeof updater === 'function' ? updater(currentTrip) : updater;
      const nextOutings = stateRef.current.outings.map((t) => (t.id === tripId ? rawNext : t));
      setOutings(nextOutings);

      if (!client) {
        saveLocal('fish-local-outings', nextOutings);
        return;
      }

      try {
        let finalTrip = rawNext;
        if (Array.isArray(rawNext.photos) && rawNext.photos.some((p) => String(p?.url || '').startsWith('data:'))) {
          const uploadedPhotos = await Promise.all(
            rawNext.photos.map(async (photo) => {
              if (typeof photo?.url === 'string' && photo.url.startsWith('data:')) {
                const url = await uploadImage(client, `vault/${tripId}`, photo.url, {
                  maxWidth: 1600,
                  quality: 0.85,
                });
                return { ...photo, url };
              }
              return photo;
            }),
          );
          finalTrip = { ...rawNext, photos: uploadedPhotos };
          setOutings((current) => current.map((t) => (t.id === tripId ? finalTrip : t)));
        }

        await apiSaveOuting(client, finalTrip, currentMemberId);
      } catch (err) {
        setSyncError(err?.message || 'Không thể lưu cập nhật chuyến đi. Đang tải lại...');
        refresh({ silent: true });
      }
    },
    [client, currentMemberId, refresh],
  );

  const addPastTrip = useCallback(
    async (newTrip) => {
      const nextOutings = [newTrip, ...stateRef.current.outings];
      setOutings(nextOutings);

      if (!client) {
        saveLocal('fish-local-outings', nextOutings);
        return;
      }

      try {
        await apiSaveOuting(client, newTrip, currentMemberId);
      } catch (err) {
        setSyncError(err?.message || 'Không thể lưu kỷ niệm chuyến đi. Đang tải lại...');
        refresh({ silent: true });
      }
    },
    [client, currentMemberId, refresh],
  );

  const changeOutingStatus = useCallback(
    (outingId, status) => updateTrip(outingId, (outing) => ({ ...outing, status })),
    [updateTrip],
  );

  const toggleBusy = useCallback(
    async (dayKey) => {
      const currentList = stateRef.current.busyDays[currentMemberId] ?? [];
      const busy = !currentList.includes(dayKey);
      const nextList = busy
        ? [...currentList, dayKey]
        : currentList.filter((d) => d !== dayKey);

      const nextBusy = { ...stateRef.current.busyDays, [currentMemberId]: nextList };
      setBusyDays(nextBusy);

      if (!client) {
        saveLocal('fish-local-busy', nextBusy);
        return;
      }

      try {
        await apiSetBusyDay(client, currentMemberId, dayKey, busy);
      } catch (err) {
        setSyncError(err?.message || 'Không thể cập nhật ngày bận. Đang tải lại...');
        refresh({ silent: true });
      }
    },
    [client, currentMemberId, refresh],
  );

  const addBusyDays = useCallback(
    async (dayKeys) => {
      const currentList = stateRef.current.busyDays[currentMemberId] ?? [];
      const merged = Array.from(new Set([...currentList, ...dayKeys]));
      const nextBusy = { ...stateRef.current.busyDays, [currentMemberId]: merged };
      setBusyDays(nextBusy);

      if (!client) {
        saveLocal('fish-local-busy', nextBusy);
        return;
      }

      try {
        await apiAddBusyDays(client, currentMemberId, dayKeys);
      } catch (err) {
        setSyncError(err?.message || 'Không thể đồng bộ ngày bận từ Google Calendar.');
        refresh({ silent: true });
      }
    },
    [client, currentMemberId, refresh],
  );

  return {
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
  };
}
