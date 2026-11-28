import { useCallback, useEffect, useRef, useState } from 'react';
import { buildMemberProfiles, DEFAULT_FISH_PHOTOS, serializeMemberProfile } from './fishProfiles.js';
import groupPhoto from '../assets/photos/group.jpg';
import {
  addBusyDays as apiAddBusyDays,
  addRippleNote as apiAddRippleNote,
  createPoll as apiCreatePoll,
  createRipple as apiCreateRipple,
  deleteRipple as apiDeleteRipple,
  deleteRippleNote as apiDeleteRippleNote,
  loadAll,
  saveOuting as apiSaveOuting,
  savePoll as apiSavePoll,
  saveProfile as apiSaveProfile,
  setBusyDay as apiSetBusyDay,
  setRippleReaction as apiSetRippleReaction,
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

const nowMs = Date.now();
const SAMPLE_RIPPLES = [
  {
    id: 'ripple-sample-1',
    memberId: 'quoc-anh',
    imageUrl: groupPhoto,
    caption: 'Đủ 7 con cá trên một bầu trời — vẫn nhớ buổi chiều hôm đó.',
    place: 'Hồ Tây, Hà Nội',
    tripId: 'outing-west-lake',
    createdAt: new Date(nowMs - 1000 * 60 * 35).toISOString(),
    reactions: {
      '✦': ['bao', 'hang', 'thu'],
      '🌊': ['diem', 'quynh'],
      '🫶': ['thien'],
    },
    notes: [
      {
        id: 'rn-sample-1',
        memberId: 'hang',
        text: 'Tấm này ánh sáng đẹp quá trời!',
        createdAt: new Date(nowMs - 1000 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: 'ripple-sample-2',
    memberId: 'hang',
    imageUrl: DEFAULT_FISH_PHOTOS.hang,
    caption: 'Tìm được một góc sân vườn đầy nắng cho kèo cuối tuần này.',
    place: 'Quảng An, Tây Hồ',
    tripId: '',
    createdAt: new Date(nowMs - 1000 * 60 * 60 * 5).toISOString(),
    reactions: {
      '🍋': ['bao', 'quynh'],
      '📸': ['quoc-anh'],
    },
    notes: [],
  },
  {
    id: 'ripple-sample-3',
    memberId: 'thu',
    imageUrl: DEFAULT_FISH_PHOTOS.thu,
    caption: 'Sáng nay 5:30 mặt hồ yên như tờ, ai dậy sớm cùng không?',
    place: 'Đường Thanh Niên',
    tripId: '',
    createdAt: new Date(nowMs - 1000 * 60 * 60 * 26).toISOString(),
    reactions: {
      '🔥': ['thien', 'bao'],
    },
    notes: [],
  },
];

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
  const [ripples, setRipples] = useState(() => {
    try {
      const local = !client && localStorage.getItem('fish-local-ripples');
      if (local) return JSON.parse(local);
    } catch {}
    return !client ? SAMPLE_RIPPLES : [];
  });
  const [loading, setLoading] = useState(Boolean(client));
  const [syncError, setSyncError] = useState('');

  const stateRef = useRef({ members, polls, outings, busyDays, ripples });
  stateRef.current = { members, polls, outings, busyDays, ripples };

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
      setRipples(data.ripples ?? []);
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

  const finalizePoll = useCallback(
    async (pollId) => {
      const poll = stateRef.current.polls.find((p) => p.id === pollId);
      if (!poll) return;

      const countOptionVotes = (voteMap, key) =>
        Object.values(voteMap ?? {}).filter((list) => list.includes(key)).length;

      const sortedOptions = [...(poll.options ?? [])].sort(
        (a, b) => countOptionVotes(poll.votes, b.id) - countOptionVotes(poll.votes, a.id),
      );
      const winningOption = sortedOptions[0] || null;

      const sortedPlaces = [...(poll.placeOptions ?? [])].sort(
        (a, b) => countOptionVotes(poll.placeVotes, b) - countOptionVotes(poll.placeVotes, a),
      );
      const winningPlace = sortedPlaces[0] || 'Confirmed together';

      const closedPoll = { ...poll, closed: true, status: 'Closed' };
      const nextPolls = stateRef.current.polls.map((p) => (p.id === pollId ? closedPoll : p));
      setPolls(nextPolls);

      if (!client) {
        saveLocal('fish-local-polls', nextPolls);
      } else {
        try {
          await apiSavePoll(client, closedPoll, currentMemberId);
        } catch (err) {
          setSyncError(err?.message || 'Không thể chốt kèo lên máy chủ.');
          refresh({ silent: true });
        }
      }

      const matchingOuting = stateRef.current.outings.find((o) => o.id === pollId);
      if (matchingOuting) {
        await updateTrip(pollId, (prev) => ({
          ...prev,
          date: winningOption?.label || prev.date,
          place: winningPlace || prev.place,
          status: 'Confirmed',
        }));
      }
    },
    [client, currentMemberId, refresh, updateTrip],
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

  const saveRippleToVault = useCallback(
    async (ripple, tripId) => {
      if (!ripple || !tripId) return;
      const sender = stateRef.current.members.find((m) => m.id === ripple.memberId);
      const addedBy = sender?.nickname || sender?.name || 'Fish';
      const photoId = `ph-ripple-${ripple.id}`;

      await updateTrip(tripId, (prev) => {
        const existing = prev.photos ?? [];
        if (existing.some((p) => p.id === photoId)) return prev;
        return {
          ...prev,
          photos: [
            ...existing,
            {
              id: photoId,
              url: ripple.imageUrl,
              caption: ripple.caption || ripple.place || 'Sky Ripple',
              addedBy,
            },
          ],
        };
      });
    },
    [updateTrip],
  );

  const createRipple = useCallback(
    async ({ imageUrl, caption = '', place = '', tripId = '' }) => {
      if (!imageUrl) return null;
      const id = `ripple-${crypto.randomUUID()}`;
      const createdAt = new Date().toISOString();

      let finalUrl = imageUrl;
      try {
        if (client && String(imageUrl).startsWith('data:')) {
          finalUrl = await uploadImage(client, `ripples/${currentMemberId}`, imageUrl, {
            maxWidth: 1200,
            quality: 0.84,
          });
        }

        const newRipple = {
          id,
          memberId: currentMemberId,
          imageUrl: finalUrl,
          caption: caption.trim(),
          place: place.trim(),
          tripId: tripId || '',
          createdAt,
          reactions: {},
          notes: [],
        };

        const nextRipples = [newRipple, ...stateRef.current.ripples];
        setRipples(nextRipples);

        if (!client) {
          saveLocal('fish-local-ripples', nextRipples);
        } else {
          await apiCreateRipple(client, newRipple);
        }

        if (tripId) {
          await saveRippleToVault(newRipple, tripId);
        }

        return newRipple;
      } catch (err) {
        setSyncError(err?.message || 'Không thể gửi khoảnh khắc lên mặt hồ.');
        refresh({ silent: true });
        return null;
      }
    },
    [client, currentMemberId, refresh, saveRippleToVault],
  );

  const deleteRipple = useCallback(
    async (rippleId) => {
      const target = stateRef.current.ripples.find((r) => r.id === rippleId);
      if (!target || target.memberId !== currentMemberId) return;

      const nextRipples = stateRef.current.ripples.filter((r) => r.id !== rippleId);
      setRipples(nextRipples);

      if (!client) {
        saveLocal('fish-local-ripples', nextRipples);
        return;
      }

      try {
        await apiDeleteRipple(client, rippleId);
      } catch (err) {
        setSyncError(err?.message || 'Không thể xóa ảnh này.');
        refresh({ silent: true });
      }
    },
    [client, currentMemberId, refresh],
  );

  const toggleRippleReaction = useCallback(
    async (rippleId, emoji) => {
      const target = stateRef.current.ripples.find((r) => r.id === rippleId);
      if (!target) return;

      const currentList = target.reactions?.[emoji] ?? [];
      const selected = !currentList.includes(currentMemberId);
      const nextEmojiList = selected
        ? [...currentList, currentMemberId]
        : currentList.filter((id) => id !== currentMemberId);

      const nextReactions = { ...target.reactions };
      if (nextEmojiList.length > 0) nextReactions[emoji] = nextEmojiList;
      else delete nextReactions[emoji];

      const nextRipples = stateRef.current.ripples.map((r) =>
        r.id === rippleId ? { ...r, reactions: nextReactions } : r,
      );
      setRipples(nextRipples);

      if (!client) {
        saveLocal('fish-local-ripples', nextRipples);
        return;
      }

      try {
        await apiSetRippleReaction(client, {
          rippleId,
          memberId: currentMemberId,
          emoji,
          selected,
        });
      } catch (err) {
        setSyncError(err?.message || 'Không thể cập nhật cảm xúc.');
        refresh({ silent: true });
      }
    },
    [client, currentMemberId, refresh],
  );

  const addRippleNote = useCallback(
    async (rippleId, text) => {
      const trimmed = String(text || '').trim();
      if (!trimmed) return;

      const note = {
        id: `rn-${crypto.randomUUID()}`,
        rippleId,
        memberId: currentMemberId,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };

      const nextRipples = stateRef.current.ripples.map((r) =>
        r.id === rippleId ? { ...r, notes: [...(r.notes ?? []), note] } : r,
      );
      setRipples(nextRipples);

      if (!client) {
        saveLocal('fish-local-ripples', nextRipples);
        return;
      }

      try {
        await apiAddRippleNote(client, note);
      } catch (err) {
        setSyncError(err?.message || 'Không thể gửi ghi chú.');
        refresh({ silent: true });
      }
    },
    [client, currentMemberId, refresh],
  );

  const deleteRippleNote = useCallback(
    async (rippleId, noteId) => {
      const targetRipple = stateRef.current.ripples.find((r) => r.id === rippleId);
      const targetNote = targetRipple?.notes?.find((n) => n.id === noteId);
      if (!targetNote || targetNote.memberId !== currentMemberId) return;

      const nextRipples = stateRef.current.ripples.map((r) =>
        r.id === rippleId
          ? { ...r, notes: (r.notes ?? []).filter((n) => n.id !== noteId) }
          : r,
      );
      setRipples(nextRipples);

      if (!client) {
        saveLocal('fish-local-ripples', nextRipples);
        return;
      }

      try {
        await apiDeleteRippleNote(client, noteId);
      } catch (err) {
        setSyncError(err?.message || 'Không thể xóa ghi chú.');
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
    ripples,
    loading,
    syncError,
    dismissError,
    updateMemberProfile,
    toggleVote,
    createPoll,
    finalizePoll,
    updateTrip,
    addPastTrip,
    changeOutingStatus,
    toggleBusy,
    addBusyDays,
    createRipple,
    deleteRipple,
    toggleRippleReaction,
    addRippleNote,
    deleteRippleNote,
    saveRippleToVault,
  };
}
