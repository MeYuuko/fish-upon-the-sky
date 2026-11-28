import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import GlassFolder from './GlassFolder.jsx';
import BrandIcon from './BrandIcon.jsx';

const BRAND_VAULT_ICONS = new Set([
  'folder',
  'image',
  'link',
  'pin',
  'sheet',
  'sparkles',
  'check',
  'arrowUpRight',
  'external',
]);

function VaultIcon({ name, size = 16 }) {
  if (BRAND_VAULT_ICONS.has(name)) {
    return <BrandIcon name={name} size={size} strokeWidth={1.85} />;
  }
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.85,
    strokeLinecap: 'square',
    strokeLinejoin: 'miter',
    'aria-hidden': 'true',
  };
  const paths = {
    arrowUpRight: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    external: <><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    folderPlus: <><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4l2 2.5h7A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5V6.5Z" /><path d="M12 11v6M9 14h6" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 15-5-5-8 8" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    maximize: <><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></>,
    minimize: <><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" /></>,
    pencil: <path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    sheet: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 12h6M9 16h6M12 9v9" /></>,
    sparkles: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
    trash: <><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>,
    x: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const FOLDER_ARTS = ['cobalt', 'citrus', 'abyss', 'waterfall', 'twilight'];

const DRAWER_TABS = [
  { id: 'photos', label: 'Photos' },
  { id: 'sheet', label: 'Expense sheet' },
  { id: 'places', label: 'Places' },
  { id: 'notes', label: 'Highlights' },
];

export function parseSheetEmbed(rawUrl, mode = 'preview') {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return null;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

  const isGoogle =
    parsed.hostname.includes('docs.google.com') &&
    parsed.pathname.includes('/spreadsheets/');

  if (isGoogle) {
    if (parsed.pathname.includes('/pubhtml')) {
      const pubUrl = new URL(parsed.toString());
      if (!pubUrl.searchParams.has('widget')) pubUrl.searchParams.set('widget', 'true');
      if (!pubUrl.searchParams.has('headers')) pubUrl.searchParams.set('headers', 'false');
      return {
        isGoogleSheet: true,
        sourceLabel: 'Google Sheets (Published)',
        embedUrl: pubUrl.toString(),
        originalUrl: trimmed,
      };
    }

    const idMatch = parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch) {
      const docId = idMatch[1];
      let gid = parsed.searchParams.get('gid');
      if (!gid && parsed.hash) {
        const hashMatch = parsed.hash.match(/gid=(\d+)/);
        if (hashMatch) gid = hashMatch[1];
      }
      const gidParam = gid ? `&gid=${encodeURIComponent(gid)}` : '';
      const embedUrl =
        mode === 'edit'
          ? `https://docs.google.com/spreadsheets/d/${docId}/edit?rm=minimal&embedded=true${gidParam}`
          : `https://docs.google.com/spreadsheets/d/${docId}/preview?rm=minimal${gidParam}`;

      return {
        isGoogleSheet: true,
        sourceLabel: 'Google Sheets',
        embedUrl,
        originalUrl: trimmed,
      };
    }
  }

  let sourceLabel = 'Web Sheet';
  if (parsed.hostname.includes('airtable.com')) sourceLabel = 'Airtable';
  else if (parsed.hostname.includes('onedrive') || parsed.hostname.includes('office.com')) sourceLabel = 'Excel Online';
  else if (parsed.hostname.includes('notion.')) sourceLabel = 'Notion';

  return {
    isGoogleSheet: false,
    sourceLabel,
    embedUrl: parsed.toString(),
    originalUrl: trimmed,
  };
}

function buildFolderFiles(trip) {
  const cards = [];
  const photos = trip.photos ?? [];
  const places = trip.places ?? [];
  const notes = trip.notes ?? [];

  if (notes.length > 0) {
    const latestNote = notes[notes.length - 1];
    cards.push({
      id: `note-${latestNote.id}`,
      name: latestNote.text,
      meta: `Note · ${latestNote.author}`,
      section: 'notes',
    });
  }

  if (places.length > 0) {
    const firstPlace = places[0];
    cards.push({
      id: `place-${firstPlace.id}`,
      name: firstPlace.name,
      meta: `${firstPlace.category || 'Spot'} · ${places.length} saved`,
      section: 'places',
    });
  }

  if (trip.sheetUrl) {
    cards.push({
      id: `sheet-${trip.id}`,
      name: 'Expense sheet',
      meta: 'Live preview',
      section: 'sheet',
    });
  }

  if (photos.length > 0) {
    photos.slice(-2).forEach((photo) => {
      cards.push({
        id: `photo-${photo.id}`,
        name: photo.caption || 'Trip memory',
        meta: photo.addedBy || 'Photo',
        image: photo.url || undefined,
        art: photo.url ? undefined : photo.art || 'waterfall',
        section: 'photos',
      });
    });
  } else if (trip.albumUrl) {
    cards.push({
      id: `album-${trip.id}`,
      name: 'Shared album',
      meta: 'Photo link',
      art: 'waterfall',
      section: 'photos',
    });
  }

  if (cards.length === 0) {
    cards.push({
      id: `empty-${trip.id}`,
      name: trip.place || 'Trip overview',
      meta: trip.status || 'Idea',
      section: 'sheet',
    });
  }

  return cards.slice(-4);
}

function TripDetailModal({
  trip,
  initialSection = 'photos',
  currentMemberName,
  onUpdateTrip,
  onClose,
  reduceMotion,
}) {
  const [section, setSection] = useState(initialSection);

  // Sheet states
  const [sheetInput, setSheetInput] = useState(trip.sheetUrl || '');
  const [isEditingSheet, setIsEditingSheet] = useState(!trip.sheetUrl);
  const [sheetMode, setSheetMode] = useState('preview');
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [sheetSavedFlash, setSheetSavedFlash] = useState(false);
  const [sheetError, setSheetError] = useState('');

  // Photo states
  const [albumInput, setAlbumInput] = useState(trip.albumUrl || '');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  // Place states
  const [placeName, setPlaceName] = useState('');
  const [placeCategory, setPlaceCategory] = useState('Spot');
  const [placeMapUrl, setPlaceMapUrl] = useState('');

  // Note states
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection, trip.id]);

  useEffect(() => {
    setSheetInput(trip.sheetUrl || '');
    setIsEditingSheet(!trip.sheetUrl);
    setSheetError('');
    setAlbumInput(trip.albumUrl || '');
  }, [trip.id, trip.sheetUrl, trip.albumUrl]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const parsedSheet = useMemo(
    () => parseSheetEmbed(trip.sheetUrl, sheetMode),
    [trip.sheetUrl, sheetMode],
  );

  const handleSaveSheet = (event) => {
    event.preventDefault();
    const trimmed = sheetInput.trim();
    if (!trimmed) {
      onUpdateTrip(trip.id, (prev) => ({ ...prev, sheetUrl: '' }));
      setIsEditingSheet(true);
      setSheetError('');
      return;
    }
    const valid = parseSheetEmbed(trimmed, sheetMode);
    if (!valid) {
      setSheetError('Please enter a valid http:// or https:// spreadsheet URL.');
      return;
    }
    setSheetError('');
    onUpdateTrip(trip.id, (prev) => ({ ...prev, sheetUrl: trimmed }));
    setIsEditingSheet(false);
    setSheetSavedFlash(true);
    window.setTimeout(() => setSheetSavedFlash(false), 1800);
  };

  const handleUploadFiles = (event) => {
    const fileList = Array.from(event.target.files || []);
    if (fileList.length === 0) return;
    setPhotoError('');

    fileList.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Only image files can be added to the trip gallery.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        if (!result) return;
        const cleanCaption =
          photoCaption.trim() || file.name.replace(/\.[^/.]+$/, '');
        onUpdateTrip(trip.id, (prev) => ({
          ...prev,
          photos: [
            ...(prev.photos ?? []),
            {
              id: `ph-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              url: result,
              caption: cleanCaption,
              addedBy: currentMemberName,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });

    setPhotoCaption('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveAlbum = (event) => {
    event.preventDefault();
    onUpdateTrip(trip.id, (prev) => ({ ...prev, albumUrl: albumInput.trim() }));
  };

  const handleRemovePhoto = (photoId) => {
    onUpdateTrip(trip.id, (prev) => ({
      ...prev,
      photos: (prev.photos ?? []).filter((p) => p.id !== photoId),
    }));
  };

  const handleAddPlace = (event) => {
    event.preventDefault();
    const name = placeName.trim();
    if (!name) return;
    onUpdateTrip(trip.id, (prev) => ({
      ...prev,
      places: [
        ...(prev.places ?? []),
        {
          id: `pl-${Date.now()}`,
          name,
          category: placeCategory,
          mapUrl: placeMapUrl.trim(),
          addedBy: currentMemberName,
        },
      ],
    }));
    setPlaceName('');
    setPlaceMapUrl('');
  };

  const handleRemovePlace = (placeId) => {
    onUpdateTrip(trip.id, (prev) => ({
      ...prev,
      places: (prev.places ?? []).filter((p) => p.id !== placeId),
    }));
  };

  const handleAddNote = (event) => {
    event.preventDefault();
    const text = noteText.trim();
    if (!text) return;
    onUpdateTrip(trip.id, (prev) => ({
      ...prev,
      notes: [
        ...(prev.notes ?? []),
        {
          id: `nt-${Date.now()}`,
          text,
          author: currentMemberName,
          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        },
      ],
    }));
    setNoteText('');
  };

  const handleRemoveNote = (noteId) => {
    onUpdateTrip(trip.id, (prev) => ({
      ...prev,
      notes: (prev.notes ?? []).filter((n) => n.id !== noteId),
    }));
  };

  const photos = trip.photos ?? [];
  const places = trip.places ?? [];
  const notes = trip.notes ?? [];

  return (
    <motion.div
      className="modal-backdrop vault-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <motion.div
        className="vault-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vault-modal-title"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 14, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="vault-modal-head">
          <div className="vault-modal-title-group">
            <div className="vault-modal-eyebrow-row">
              <span className="eyebrow">{trip.date}</span>
              <span className={`vault-status-badge status-${(trip.status || 'Idea').toLowerCase()}`}>
                {trip.status}
              </span>
              <span className="vault-editor-tag">Editing as {currentMemberName}</span>
            </div>
            <h2 id="vault-modal-title">{trip.title}</h2>
            <p className="vault-modal-place">
              <VaultIcon name="pin" size={14} />
              <span>{trip.place}</span>
            </p>
          </div>
          <button type="button" className="icon-button" aria-label="Close trip vault" onClick={onClose}>
            <VaultIcon name="x" size={18} />
          </button>
        </div>

        <div className="vault-drawer-tabs" role="tablist" aria-label="Trip archive sections">
          {DRAWER_TABS.map((tab) => {
            const active = section === tab.id;
            const badge =
              tab.id === 'photos'
                ? photos.length
                : tab.id === 'places'
                  ? places.length
                  : tab.id === 'notes'
                    ? notes.length
                    : trip.sheetUrl
                      ? 'Live'
                      : 'Empty';

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`vault-drawer-tab${active ? ' is-active' : ''}`}
                onClick={() => setSection(tab.id)}
              >
                {tab.id === 'photos' && <VaultIcon name="image" size={15} />}
                {tab.id === 'sheet' && <VaultIcon name="sheet" size={15} />}
                {tab.id === 'places' && <VaultIcon name="pin" size={15} />}
                {tab.id === 'notes' && <VaultIcon name="sparkles" size={15} />}
                <span>{tab.label}</span>
                <span className="vault-drawer-tab-count">{badge}</span>
              </button>
            );
          })}
        </div>

        <div className="vault-drawer-body">
          {section === 'photos' && (
            <div className="vault-section-stack">
              <div className="vault-upload-panel">
                <div className="vault-upload-copy">
                  <strong>Add trip photos</strong>
                  <p>Upload from your device to preview right inside this vault and on the glass folder cards.</p>
                </div>
                <div className="vault-upload-controls">
                  <input
                    className="text-input"
                    type="text"
                    placeholder="Optional caption before choosing files"
                    value={photoCaption}
                    onChange={(event) => setPhotoCaption(event.target.value)}
                  />
                  <input
                    ref={fileInputRef}
                    id="vault-photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleUploadFiles}
                  />
                  <label htmlFor="vault-photo-upload" className="button button-primary vault-upload-btn">
                    <VaultIcon name="upload" size={16} />
                    <span>Upload photos</span>
                  </label>
                </div>
                {photoError && <p className="vault-field-error">{photoError}</p>}
              </div>

              <form className="vault-inline-form" onSubmit={handleSaveAlbum}>
                <label className="sr-only" htmlFor="vault-album-url">Shared photo album URL</label>
                <input
                  id="vault-album-url"
                  className="text-input"
                  type="url"
                  placeholder="Paste Google Photos or Drive album link"
                  value={albumInput}
                  onChange={(event) => setAlbumInput(event.target.value)}
                />
                <button type="submit" className="button button-secondary">
                  <VaultIcon name="link" size={16} />
                  <span>{trip.albumUrl ? 'Update album' : 'Save album link'}</span>
                </button>
                {trip.albumUrl && (
                  <a
                    className="button button-secondary"
                    href={trip.albumUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Open album</span>
                    <VaultIcon name="external" size={15} />
                  </a>
                )}
              </form>

              {photos.length === 0 ? (
                <div className="vault-empty-box">
                  <VaultIcon name="image" size={22} />
                  <p>No photos uploaded yet. Choose pictures from your device or link the shared album above.</p>
                </div>
              ) : (
                <div className="vault-photo-grid">
                  {photos.map((photo) => (
                    <figure className="vault-photo-card" key={photo.id}>
                      <div className="vault-photo-media">
                        {photo.url ? (
                          <img src={photo.url} alt={photo.caption || trip.title} />
                        ) : (
                          <div className={`vault-photo-art vault-photo-art-${photo.art || 'cobalt'}`} />
                        )}
                        <button
                          type="button"
                          className="vault-photo-remove"
                          aria-label={`Remove ${photo.caption || 'photo'}`}
                          onClick={() => handleRemovePhoto(photo.id)}
                        >
                          <VaultIcon name="trash" size={14} />
                        </button>
                      </div>
                      <figcaption>
                        <strong>{photo.caption || 'Trip memory'}</strong>
                        <span>Added by {photo.addedBy || 'Group'}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'sheet' && (
            <div className="vault-section-stack">
              {(!parsedSheet || isEditingSheet) && (
                <form className="vault-sheet-editor" onSubmit={handleSaveSheet}>
                  <div className="vault-sheet-editor-head">
                    <div>
                      <strong>Attach expense sheet</strong>
                      <p>
                        Paste your Google Sheets, Excel Online, or Airtable URL to view and inspect the sheet
                        directly inside this planner.
                      </p>
                    </div>
                    {parsedSheet && (
                      <button
                        type="button"
                        className="quiet-button"
                        onClick={() => {
                          setSheetInput(trip.sheetUrl || '');
                          setIsEditingSheet(false);
                          setSheetError('');
                        }}
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                  <div className="vault-inline-form">
                    <label className="sr-only" htmlFor="vault-sheet-url">
                      Expense sheet link for {trip.title}
                    </label>
                    <input
                      id="vault-sheet-url"
                      className="text-input"
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={sheetInput}
                      onChange={(event) => setSheetInput(event.target.value)}
                    />
                    <button
                      type="submit"
                      className="button button-primary"
                      disabled={!sheetInput.trim()}
                    >
                      <VaultIcon name="sheet" size={16} />
                      <span>Save & view sheet</span>
                    </button>
                  </div>
                  {sheetError && <p className="vault-field-error">{sheetError}</p>}
                </form>
              )}

              {parsedSheet && (
                <div className="vault-sheet-viewer">
                  <div className="vault-sheet-toolbar">
                    <div className="vault-sheet-toolbar-left">
                      <span className="vault-sheet-badge">
                        <i aria-hidden="true" />
                        {parsedSheet.sourceLabel}
                      </span>
                      {sheetSavedFlash && (
                        <span className="vault-saved-pill">
                          <VaultIcon name="check" size={13} /> Saved
                        </span>
                      )}
                    </div>
                    <div className="vault-sheet-toolbar-actions">
                      {parsedSheet.isGoogleSheet && (
                        <div className="vault-mode-toggle" role="group" aria-label="Sheet view mode">
                          <button
                            type="button"
                            className={sheetMode === 'preview' ? 'is-active' : ''}
                            onClick={() => setSheetMode('preview')}
                          >
                            <VaultIcon name="eye" size={13} />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            className={sheetMode === 'edit' ? 'is-active' : ''}
                            onClick={() => setSheetMode('edit')}
                          >
                            <VaultIcon name="pencil" size={13} />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        className="vault-tool-btn"
                        onClick={() => setIsSheetExpanded((v) => !v)}
                      >
                        {isSheetExpanded ? <VaultIcon name="minimize" size={14} /> : <VaultIcon name="maximize" size={14} />}
                        <span>{isSheetExpanded ? 'Compact' : 'Expand'}</span>
                      </button>
                      <button
                        type="button"
                        className="vault-tool-btn"
                        onClick={() => setIsEditingSheet((v) => !v)}
                      >
                        <VaultIcon name="link" size={14} />
                        <span>Change link</span>
                      </button>
                      <a
                        className="vault-tool-btn vault-tool-link"
                        href={parsedSheet.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>Open tab</span>
                        <VaultIcon name="arrowUpRight" size={14} />
                      </a>
                    </div>
                  </div>

                  <div className={`vault-sheet-frame-wrap${isSheetExpanded ? ' is-expanded' : ''}`}>
                    <iframe
                      key={`${parsedSheet.embedUrl}-${sheetMode}`}
                      className="vault-sheet-frame"
                      src={parsedSheet.embedUrl}
                      title={`${trip.title} expense sheet`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>

                  <p className="vault-sheet-footnote">
                    Tip: For Google Sheets to load inline here, set Share access to{' '}
                    <strong>Anyone with the link</strong> (or File → Share → Publish to web). If your browser
                    blocks framing, use{' '}
                    <a href={parsedSheet.originalUrl} target="_blank" rel="noreferrer">
                      Open tab
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
          )}

          {section === 'places' && (
            <div className="vault-section-stack">
              <form className="vault-place-form" onSubmit={handleAddPlace}>
                <div className="vault-place-inputs">
                  <label className="sr-only" htmlFor="vault-place-name">Place name</label>
                  <input
                    id="vault-place-name"
                    className="text-input"
                    type="text"
                    placeholder="Spot, cafe, homestay..."
                    value={placeName}
                    onChange={(event) => setPlaceName(event.target.value)}
                    required
                  />
                  <label className="sr-only" htmlFor="vault-place-cat">Category</label>
                  <select
                    id="vault-place-cat"
                    className="text-input vault-cat-select"
                    value={placeCategory}
                    onChange={(event) => setPlaceCategory(event.target.value)}
                  >
                    <option value="Spot">Spot</option>
                    <option value="Food">Food</option>
                    <option value="Stay">Stay</option>
                  </select>
                </div>
                <div className="vault-inline-form">
                  <label className="sr-only" htmlFor="vault-place-map">Google Maps URL (optional)</label>
                  <input
                    id="vault-place-map"
                    className="text-input"
                    type="url"
                    placeholder="Optional Google Maps link"
                    value={placeMapUrl}
                    onChange={(event) => setPlaceMapUrl(event.target.value)}
                  />
                  <button type="submit" className="button button-primary" disabled={!placeName.trim()}>
                    <VaultIcon name="plus" size={16} />
                    <span>Add place</span>
                  </button>
                </div>
              </form>

              {places.length === 0 ? (
                <div className="vault-empty-box">
                  <VaultIcon name="pin" size={22} />
                  <p>No saved stops yet. Add restaurants, viewpoints, or stays for future reference.</p>
                </div>
              ) : (
                <ul className="vault-item-list">
                  {places.map((place) => (
                    <li className="vault-item-row" key={place.id}>
                      <span className="vault-item-chip">{place.category || 'Spot'}</span>
                      <div className="vault-item-main">
                        <strong>{place.name}</strong>
                        <span>Added by {place.addedBy || 'Group'}</span>
                      </div>
                      {place.mapUrl && (
                        <a
                          className="text-button"
                          href={place.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>Maps</span>
                          <VaultIcon name="arrowUpRight" size={15} />
                        </a>
                      )}
                      <button
                        type="button"
                        className="icon-button vault-row-delete"
                        aria-label={`Remove ${place.name}`}
                        onClick={() => handleRemovePlace(place.id)}
                      >
                        <VaultIcon name="trash" size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {section === 'notes' && (
            <div className="vault-section-stack">
              <form className="vault-inline-form" onSubmit={handleAddNote}>
                <label className="sr-only" htmlFor="vault-note-input">Trip highlight or memory</label>
                <input
                  id="vault-note-input"
                  className="text-input"
                  type="text"
                  placeholder={`Drop a highlight or memory as ${currentMemberName}...`}
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  maxLength={180}
                />
                <button type="submit" className="button button-primary" disabled={!noteText.trim()}>
                  <VaultIcon name="sparkles" size={16} />
                  <span>Save note</span>
                </button>
              </form>

              {notes.length === 0 ? (
                <div className="vault-empty-box">
                  <VaultIcon name="sparkles" size={22} />
                  <p>No highlights saved yet. Capture inside jokes, sunset timing, or what to bring next time.</p>
                </div>
              ) : (
                <ul className="vault-note-list">
                  {notes.map((note) => (
                    <li className="vault-note-card" key={note.id}>
                      <p>“{note.text}”</p>
                      <div className="vault-note-foot">
                        <span>
                          {note.author} · {note.createdAt || 'Saved'}
                        </span>
                        <button
                          type="button"
                          className="quiet-button"
                          aria-label="Delete highlight"
                          onClick={() => handleRemoveNote(note.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ArchivePastTripModal({ currentMemberName, onClose, onAddPastTrip, reduceMotion }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [albumUrl, setAlbumUrl] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    const trimmedPlace = place.trim() || 'Shared memory';
    onAddPastTrip({
      id: `trip-${Date.now()}`,
      title: title.trim(),
      date: date.trim() || 'Past trip',
      place: trimmedPlace,
      status: 'Done',
      sheetUrl: sheetUrl.trim(),
      albumUrl: albumUrl.trim(),
      photos: [],
      places: place.trim()
        ? [{ id: `pl-${Date.now()}`, name: trimmedPlace, category: 'Spot', mapUrl: '', addedBy: currentMemberName }]
        : [],
      notes: note.trim()
        ? [{ id: `nt-${Date.now()}`, text: note.trim(), author: currentMemberName, createdAt: 'Archived' }]
        : [],
    });
    onClose();
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <motion.form
        className="poll-modal"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.22 }}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">Past memories</span>
            <h2>Archive a trip</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            <VaultIcon name="x" size={18} />
          </button>
        </div>

        <label className="field-label">
          Trip title
          <input
            className="text-input"
            placeholder="e.g. Tam Dao weekend"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={60}
            required
          />
        </label>

        <div className="modal-two-col">
          <label className="field-label">
            Dates
            <input
              className="text-input"
              placeholder="e.g. Oct 12–13"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <label className="field-label">
            Main location
            <input
              className="text-input"
              placeholder="e.g. Vinh Phuc"
              value={place}
              onChange={(event) => setPlace(event.target.value)}
            />
          </label>
        </div>

        <div className="modal-two-col">
          <label className="field-label">
            Expense sheet link <span className="field-hint">Optional</span>
            <input
              className="text-input"
              type="url"
              placeholder="Google Sheets / web sheet URL"
              value={sheetUrl}
              onChange={(event) => setSheetUrl(event.target.value)}
            />
          </label>
          <label className="field-label">
            Album link <span className="field-hint">Optional</span>
            <input
              className="text-input"
              type="url"
              placeholder="Google Photos / Drive URL"
              value={albumUrl}
              onChange={(event) => setAlbumUrl(event.target.value)}
            />
          </label>
        </div>

        <label className="field-label">
          Highlight note <span className="field-hint">Optional</span>
          <textarea
            className="text-input textarea"
            rows={2}
            placeholder="Best moment from the trip..."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        <div className="modal-actions">
          <p>Added by {currentMemberName} · All 7 members can edit later</p>
          <button className="button button-primary" type="submit" disabled={!title.trim()}>
            <VaultIcon name="folderPlus" size={16} />
            <span>Create folder</span>
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function TripVaultView({
  trips,
  theme,
  currentMemberName,
  onUpdateTrip,
  onAddPastTrip,
}) {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState('all');
  const [activeTripState, setActiveTripState] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const openTrip = (tripId, section = 'photos') => {
    setActiveTripState({ tripId, section });
  };

  const activeTrip = activeTripState
    ? trips.find((t) => t.id === activeTripState.tripId) ?? null
    : null;

  const counts = useMemo(
    () => ({
      all: trips.length,
      done: trips.filter((t) => t.status === 'Done').length,
      planning: trips.filter((t) => t.status === 'Planning' || t.status === 'Confirmed').length,
      needsSheet: trips.filter((t) => !t.sheetUrl).length,
    }),
    [trips],
  );

  const visibleTrips = useMemo(() => {
    if (filter === 'done') return trips.filter((t) => t.status === 'Done');
    if (filter === 'planning') return trips.filter((t) => t.status === 'Planning' || t.status === 'Confirmed');
    if (filter === 'needs-sheet') return trips.filter((t) => !t.sheetUrl);
    return trips;
  }, [trips, filter]);

  const filterOptions = [
    { id: 'all', label: 'All trips', count: counts.all },
    { id: 'done', label: 'Done', count: counts.done },
    { id: 'planning', label: 'Planning', count: counts.planning },
    { id: 'needs-sheet', label: 'Needs sheet', count: counts.needsSheet },
  ];

  return (
    <section className="page-section vault-page">
      <motion.div
        className="page-title-row"
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <span className="eyebrow">TRIP ARCHIVE · 07 MEMBERS</span>
          <h1>Every trip, kept in one vault.</h1>
          <p>
            Photos, live expense sheets, saved stops, and highlight notes — folded into glass folders
            for the seven of you.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setShowArchiveModal(true)}
        >
          <VaultIcon name="folderPlus" size={18} />
          <span>Archive past trip</span>
        </button>
      </motion.div>

      <motion.div
        className="vault-filter-bar"
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.42, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="vault-filters" role="tablist" aria-label="Filter trip folders">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={filter === opt.id}
              className={`vault-filter-pill${filter === opt.id ? ' is-active' : ''}`}
              onClick={() => setFilter(opt.id)}
            >
              <span>{opt.label}</span>
              <sup>{String(opt.count).padStart(2, '0')}</sup>
            </button>
          ))}
        </div>

        <p className="vault-hint-copy">
          Click any glass folder to fan its files, click a card inside to inspect, or tap <strong>+</strong> to add.
        </p>
      </motion.div>

      <div className="vault-folder-grid">
        {visibleTrips.map((trip, index) => {
          const files = buildFolderFiles(trip);
          const photoCount = (trip.photos ?? []).length;
          const placeCount = (trip.places ?? []).length;
          const noteCount = (trip.notes ?? []).length;
          const totalItems = photoCount + placeCount + noteCount + (trip.sheetUrl ? 1 : 0) + (trip.albumUrl ? 1 : 0);

          return (
            <motion.article
              key={trip.id}
              className="vault-folder-card"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0.01 : 0.48,
                delay: reduceMotion ? 0 : 0.1 + index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="vault-folder-stage">
                <GlassFolder
                  label={trip.title}
                  meta={`${totalItems} ${totalItems === 1 ? 'item' : 'items'} · ${trip.date}`}
                  tone={theme}
                  art={FOLDER_ARTS[index % FOLDER_ARTS.length]}
                  seed={index * 7 + 3}
                  files={files}
                  action="add"
                  width={300}
                  appear={!reduceMotion}
                  appearDelay={index * 90}
                  onAddClick={() => openTrip(trip.id, trip.sheetUrl ? 'photos' : 'sheet')}
                  onFileSelect={(file) => openTrip(trip.id, file.section || 'photos')}
                />
              </div>

              <div className="vault-folder-footer">
                <div className="vault-folder-meta-top">
                  <span className="vault-folder-place">
                    <VaultIcon name="pin" size={13} />
                    <span>{trip.date} · {trip.place}</span>
                  </span>
                  <span className={`vault-status-badge status-${(trip.status || 'Idea').toLowerCase()}`}>
                    {trip.status}
                  </span>
                </div>

                <div className="vault-folder-stats">
                  <button
                    type="button"
                    className="vault-mini-stat"
                    onClick={() => openTrip(trip.id, 'photos')}
                  >
                    <VaultIcon name="image" size={13} />
                    <span>{photoCount} {photoCount === 1 ? 'photo' : 'photos'}</span>
                  </button>
                  <button
                    type="button"
                    className={`vault-mini-stat${trip.sheetUrl ? ' has-sheet' : ''}`}
                    onClick={() => openTrip(trip.id, 'sheet')}
                  >
                    <VaultIcon name="sheet" size={13} />
                    <span>{trip.sheetUrl ? 'View sheet' : 'Add sheet'}</span>
                  </button>
                  <button
                    type="button"
                    className="vault-mini-stat"
                    onClick={() => openTrip(trip.id, 'places')}
                  >
                    <VaultIcon name="pin" size={13} />
                    <span>{placeCount}</span>
                  </button>
                  <button
                    type="button"
                    className="vault-mini-stat"
                    onClick={() => openTrip(trip.id, 'notes')}
                  >
                    <VaultIcon name="sparkles" size={13} />
                    <span>{noteCount}</span>
                  </button>
                </div>

                <div className="vault-folder-actions">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => openTrip(trip.id, trip.sheetUrl ? 'sheet' : 'photos')}
                  >
                    <span>Open vault</span>
                    <VaultIcon name="arrowUpRight" size={16} />
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <AnimatePresence>
        {activeTrip && (
          <TripDetailModal
            trip={activeTrip}
            initialSection={activeTripState.section}
            currentMemberName={currentMemberName}
            onUpdateTrip={onUpdateTrip}
            onClose={() => setActiveTripState(null)}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showArchiveModal && (
          <ArchivePastTripModal
            currentMemberName={currentMemberName}
            onClose={() => setShowArchiveModal(false)}
            onAddPastTrip={onAddPastTrip}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
