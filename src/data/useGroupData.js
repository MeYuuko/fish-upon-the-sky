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

export function useGroupData(client, currentMemberId, people) {
  const [members, setMembers] = useState(() => buildMemberProfiles(people, {}));
  const [polls, setPolls] = useState([]);
  const [outings, setOutings] = useState([]);
  const [busyDays, setBusyDays] = useState({});
  const [loading, setLoading] = useState(true);
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
        if (typeof resolvedPatch.customPhoto === 'string' && resolvedPatch.customPhoto.startsWith('data:')) {
          resolvedPatch.customPhoto = await uploadImage(
            client,
            `profiles/${memberId}`,
            resolvedPatch.customPhoto,
            { maxWidth: 900, quality: 0.85 },
          );
        }

        if (Array.isArray(resolvedPatch.books)) {
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

      setPolls((current) =>
        current.map((poll) =>
          poll.id === pollId
            ? { ...poll, [voteKey]: { ...poll[voteKey], [currentMemberId]: nextVotes } }
            : poll,
        ),
      );

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

      setPolls((current) => [poll, ...current]);
      setOutings((current) => [newOuting, ...current]);

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
      setOutings((current) => current.map((t) => (t.id === tripId ? rawNext : t)));

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
      setOutings((current) => [newTrip, ...current]);
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

      setBusyDays((old) => ({ ...old, [currentMemberId]: nextList }));

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
      setBusyDays((old) => ({ ...old, [currentMemberId]: merged }));

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
