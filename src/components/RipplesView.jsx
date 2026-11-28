import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BrandIcon from './BrandIcon.jsx';
import { compressImageFile, getPreferredImageFormat } from '../data/images.js';
import {
  BubbleLayer,
  PondSurface,
  RippleBurst,
  TideWave,
  haptic,
  useBubbles,
} from './PondEffects.jsx';

const ECHO_EMOJIS = ['✦', '🌊', '🍋', '🔥', '🫶', '📸'];

function depthClass(createdAt) {
  const ts = new Date(createdAt).getTime();
  if (Number.isNaN(ts)) return 'depth-surface';
  const ageHours = Math.max(0, (Date.now() - ts) / 3600000);
  if (ageHours < 24) return 'depth-surface';
  if (ageHours < 72) return 'depth-shallow';
  if (ageHours < 168) return 'depth-mid';
  return 'depth-deep';
}

const BRAND_RIPPLE_ICONS = {
  ripple: 'futs-wave',
  camera: 'futs-image',
  calendar: 'futs-calendar',
  pin: 'futs-compass',
  folder: 'futs-folder',
  check: 'futs-check-badge',
  send: 'futs-paper-plane',
  upload: 'futs-download',
  arrow: 'futs-arrow-launch',
};

function RippleIcon({ name, size = 16 }) {
  if (BRAND_RIPPLE_ICONS[name]) {
    return <BrandIcon name={BRAND_RIPPLE_ICONS[name]} size={size} strokeWidth={1.8} />;
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
    ripple: (
      <>
        <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="9.8" strokeDasharray="3 2.5" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.6-2h3.8l1.6 2h2A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-9Z" />
        <circle cx="12" cy="13" r="3.4" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.2" />
      </>
    ),
    folder: (
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4l2 2.5h7A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5V6.5Z" />
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M10 11v6M14 11v6" />
        <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    plus: <path d="M12 5v14M5 12h14" />,
    flip: (
      <>
        <path d="M3 10a9 9 0 0 1 15.5-5.3L21 7" />
        <path d="M21 3v4h-4" />
        <path d="M21 14a9 9 0 0 1-15.5 5.3L3 17" />
        <path d="M3 21v-4h4" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function useIsTouchCameraDevice() {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
    const uaTouch = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent || '');
    const iPadDesktopUa = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
    return coarse || uaTouch || iPadDesktopUa;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(pointer: coarse)');
    const update = () => {
      const uaTouch = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent || '');
      const iPadDesktopUa = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
      setIsTouch(mql.matches || uaTouch || iPadDesktopUa);
    };
    mql.addEventListener?.('change', update);
    return () => mql.removeEventListener?.('change', update);
  }, []);

  return isTouch;
}

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

function dateKeyFromIso(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function HudCorners() {
  return (
    <div className="ripples-hud-corners" aria-hidden="true">
      <span>+</span>
      <span>+</span>
      <span>+</span>
      <span>+</span>
    </div>
  );
}

export function DropRippleModal({ outings = [], onClose, onSubmit, reduceMotion = false }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [place, setPlace] = useState('');
  const [tripId, setTripId] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [dragging, setDragging] = useState(false);

  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    try {
      const dataUrl = await compressImageFile(file, { maxWidth: 1200, quality: 0.82 });
      setPreviewUrl(dataUrl);
    } catch (err) {
      setError(err?.message || 'Could not process this photo.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!previewUrl || sending) return;
    setSending(true);
    setError('');
    try {
      const created = await onSubmit?.({
        imageUrl: previewUrl,
        caption,
        place,
        tripId,
      });
      if (created) {
        onClose?.();
      } else {
        setError('Could not send ripple. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Could not send ripple.');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <motion.form
        className="poll-modal ripple-composer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drop-ripple-title"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.22 }}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">Sky surface · 07 fishes</span>
            <h2 id="drop-ripple-title">Drop a ripple</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            <RippleIcon name="close" size={18} />
          </button>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        <div
          className={`ripple-dropzone${previewUrl ? ' has-preview' : ''}${dragging ? ' is-dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          {previewUrl ? (
            <div className="ripple-preview-frame">
              <img src={previewUrl} alt="Ripple preview" />
              <button
                type="button"
                className="quiet-button ripple-retake-btn"
                onClick={() => setPreviewUrl('')}
              >
                Replace photo
              </button>
            </div>
          ) : (
            <div className="ripple-dropzone-empty">
              <span className="ripple-dropzone-mark">
                <RippleIcon name="ripple" size={24} />
              </span>
              <strong>Send a frame across the pond</strong>
              <p>Capture right now or drop an image from your library.</p>
              <div className="ripple-source-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => cameraRef.current?.click()}
                >
                  <RippleIcon name="camera" size={17} /> Take photo
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => galleryRef.current?.click()}
                >
                  <RippleIcon name="upload" size={17} /> Choose photo
                </button>
              </div>
            </div>
          )}
        </div>

        <label className="field-label" htmlFor="ripple-caption">
          Caption <span className="field-hint">Optional · 120 chars</span>
        </label>
        <input
          id="ripple-caption"
          className="text-input"
          placeholder="Golden hour by the lake, iced matcha, or a quick wave…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={120}
        />

        <div className="modal-two-col">
          <label className="field-label" htmlFor="ripple-place">
            Where are you?
            <input
              id="ripple-place"
              className="text-input"
              placeholder="Hồ Tây, Phố cổ, Home Studio…"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              maxLength={60}
            />
          </label>
          <label className="field-label" htmlFor="ripple-trip">
            Also keep in Trip Vault
            <select
              id="ripple-trip"
              className="text-input"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
            >
              <option value="">Just on Ripples</option>
              {outings.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="gcal-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <p>
            <RippleIcon name="ripple" size={15} /> Visible live to all 7 fishes
          </p>
          <button
            type="submit"
            className="button button-primary"
            disabled={!previewUrl || sending}
          >
            {sending ? 'Sending…' : 'Send ripple'} <RippleIcon name="arrow" size={16} />
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export function LatestRippleWidget({
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
          All ripples ({String(totalCount).padStart(2, '0')}) <RippleIcon name="arrow" size={17} />
        </button>
      </div>

      <article className="home-ripple-card">
        <HudCorners />
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
                decoding="async"
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
                      <RippleIcon name="pin" size={13} /> {latestRipple.place}
                    </span>
                  </>
                )}
              </div>

              <p className="home-ripple-caption">
                {latestRipple.caption || 'Shared a quiet frame from the day.'}
              </p>

              <div className="home-ripple-actions">
                <div className="ripple-echo-row" role="group" aria-label="Quick bubbles">
                  {ECHO_EMOJIS.slice(0, 3).map((emoji) => {
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
                  <RippleIcon name="camera" size={16} /> Drop a ripple
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
              <RippleIcon name="camera" size={16} /> Drop a ripple
            </button>
          </div>
        )}
      </article>
    </section>
  );
}

function LiveRippleCamera({ outings = [], onCreateRipple }) {
  const [facingMode, setFacingMode] = useState('environment');
  const [capturedUrl, setCapturedUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [place, setPlace] = useState('');
  const [tripId, setTripId] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [shutterPulse, setShutterPulse] = useState(0);
  const [retrySeed, setRetrySeed] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const nativeCamRef = useRef(null);
  const libraryRef = useRef(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  useEffect(() => {
    if (capturedUrl) {
      stopStream();
      return undefined;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live viewfinder is unavailable on this browser. Use Native Camera or Library below.');
      return undefined;
    }

    let cancelled = false;
    setCameraError('');
    setCameraReady(false);

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.name === 'NotAllowedError'
            ? 'Camera permission was blocked. Allow camera access or pick a photo below.'
            : 'Could not open the live camera. You can still capture or upload below.';
        setCameraError(msg);
      }
    };

    startCamera();

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopStream();
      } else if (!cancelled && !capturedUrl) {
        setRetrySeed((s) => s + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      stopStream();
    };
  }, [facingMode, capturedUrl, retrySeed]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const side = Math.min(vw, vh);
    const sx = Math.floor((vw - side) / 2);
    const sy = Math.floor((vh - side) / 2);
    const target = Math.min(1200, side);

    const canvas = document.createElement('canvas');
    canvas.width = target;
    canvas.height = target;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(target, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sx, sy, side, side, 0, 0, target, target);
    const { contentType } = getPreferredImageFormat(false);
    setCapturedUrl(canvas.toDataURL(contentType, 0.82));
    setShutterPulse(Date.now());
    haptic(12);
  };

  const handleFilePick = async (file) => {
    if (!file) return;
    setCameraError('');
    try {
      const dataUrl = await compressImageFile(file, { maxWidth: 1200, quality: 0.82 });
      setCapturedUrl(dataUrl);
    } catch (err) {
      setCameraError(err?.message || 'Could not load that image.');
    }
  };

  const handleRetake = () => {
    setCapturedUrl('');
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!capturedUrl || sending) return;
    setSending(true);
    try {
      const created = await onCreateRipple?.({
        imageUrl: capturedUrl,
        caption,
        place,
        tripId,
      });
      if (created) {
        setDropping(true);
        haptic(16);
        window.setTimeout(() => {
          setCapturedUrl('');
          setCaption('');
          setPlace('');
          setTripId('');
          setDropping(false);
        }, 450);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="ripple-live-card" aria-label="Live ripple camera">
      <HudCorners />
      <input
        ref={nativeCamRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          handleFilePick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          handleFilePick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="ripple-live-stage">
        <RippleBurst trigger={shutterPulse} tone="citrus" />
        {capturedUrl ? (
          <img
            src={capturedUrl}
            alt="Captured ripple preview"
            className={`ripple-live-media${dropping ? ' is-dropping' : ''}`}
          />
        ) : cameraError ? (
          <div className="ripple-live-fallback">
            <span className="ripple-dropzone-mark">
              <RippleIcon name="ripple" size={24} />
            </span>
            <strong>Camera unavailable</strong>
            <p>{cameraError}</p>
            <div className="ripple-source-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => nativeCamRef.current?.click()}
              >
                <RippleIcon name="camera" size={16} /> Native Camera
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => libraryRef.current?.click()}
              >
                <RippleIcon name="upload" size={16} /> Library
              </button>
              <button
                type="button"
                className="quiet-button"
                onClick={() => setRetrySeed((s) => s + 1)}
              >
                Retry live cam
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`ripple-live-media${facingMode === 'user' ? ' is-mirrored' : ''}`}
            />
            <span className="ripple-live-pill">
              <i aria-hidden="true" />
              {facingMode === 'environment' ? 'REAR · LIVE' : 'FRONT · LIVE'}
            </span>
          </>
        )}
      </div>

      {!capturedUrl ? (
        <div className="ripple-live-controls">
          <button
            type="button"
            className="ripple-cam-side-btn"
            onClick={() => libraryRef.current?.click()}
            aria-label="Upload photo from library"
            title="Upload photo"
          >
            <RippleIcon name="upload" size={20} />
          </button>

          <button
            type="button"
            className="ripple-shutter-btn pond-shutter"
            onClick={handleCapture}
            disabled={!cameraReady}
            aria-label="Take ripple photo"
          >
            <span />
          </button>

          <button
            type="button"
            className="ripple-cam-side-btn"
            onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
            aria-label="Flip camera"
            title="Flip camera"
          >
            <RippleIcon name="flip" size={20} />
          </button>
        </div>
      ) : (
        <form className="ripple-live-review-form" onSubmit={handleSend}>
          <input
            className="text-input"
            placeholder="Add a caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={120}
          />
          <div className="ripple-live-review-meta">
            <input
              className="text-input"
              placeholder="Where are you?"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              maxLength={60}
            />
            {outings.length > 0 && (
              <select
                className="text-input"
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                aria-label="Also keep in Trip Vault"
              >
                <option value="">Just on Ripples</option>
                {outings.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    Vault: {trip.title}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="ripple-live-review-actions">
            <button type="button" className="button button-secondary" onClick={handleRetake}>
              Retake
            </button>
            <button type="submit" className="button button-primary" disabled={sending}>
              {sending ? 'Sending…' : 'Send ripple'} <RippleIcon name="send" size={16} />
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function PondCalendarModal({
  monthLabel,
  dayCells,
  year,
  month,
  ripplesByDay,
  onPrevMonth,
  onNextMonth,
  onSelectRipple,
  onClose,
  reduceMotion,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <motion.section
        className="poll-modal pond-calendar-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pond-calendar-title"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.22 }}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">Archive by day</span>
            <h2 id="pond-calendar-title">Tide Calendar</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            <RippleIcon name="close" size={18} />
          </button>
        </div>

        <div className="calendar-toolbar">
          <button
            type="button"
            className="icon-button"
            aria-label="Previous month"
            onClick={onPrevMonth}
          >
            ‹
          </button>
          <h3>{monthLabel}</h3>
          <button
            type="button"
            className="icon-button"
            aria-label="Next month"
            onClick={onNextMonth}
          >
            ›
          </button>
        </div>

        <div className="calendar-grid calendar-weekdays">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="calendar-grid ripples-calendar-days">
          {dayCells.map((day, idx) => {
            if (!day) return <span className="calendar-empty" key={`pad-${idx}`} />;
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayRipples = ripplesByDay[key] ?? [];
            const lead = dayRipples[0];
            return (
              <button
                key={key}
                type="button"
                disabled={!lead}
                className={`ripples-cal-day${lead ? ' has-ripple' : ''}`}
                onClick={() => {
                  if (!lead) return;
                  onSelectRipple?.(lead.id);
                  onClose?.();
                }}
                aria-label={
                  lead
                    ? `${monthLabel} ${day}: ${dayRipples.length} ripple(s)`
                    : `${monthLabel} ${day}: no ripples`
                }
              >
                {lead && (
                  <img
                    src={lead.imageUrl}
                    alt=""
                    className="ripples-cal-thumb"
                    loading="lazy"
                  />
                )}
                <span className="ripples-cal-num">{day}</span>
                {dayRipples.length > 1 && (
                  <strong className="ripples-cal-badge">{dayRipples.length}</strong>
                )}
              </button>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}

export default function RipplesView({
  ripples = [],
  members = [],
  outings = [],
  currentMemberId,
  onOpenComposer,
  onCreateRipple,
  onDeleteRipple,
  onToggleReaction,
  onAddNote,
  onDeleteNote,
  onSaveToVault,
  onOpenVault,
}) {
  const reduceMotion = useReducedMotion();
  const isTouchDevice = useIsTouchCameraDevice();
  const [showCalendar, setShowCalendar] = useState(false);
  const [memberFilter, setMemberFilter] = useState('all');
  const [selectedId, setSelectedId] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [vaultTripId, setVaultTripId] = useState(() => outings[0]?.id || '');
  const [savedNotice, setSavedNotice] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);
  const [freshId, setFreshId] = useState('');
  const [tideWave, setTideWave] = useState(null);

  const spotlightRef = useRef(null);
  const knownIdsRef = useRef(null);

  const { bubbles, spawnBubble } = useBubbles();

  useEffect(() => {
    if (!vaultTripId && outings[0]?.id) {
      setVaultTripId(outings[0].id);
    }
  }, [outings, vaultTripId]);

  const memberMap = useMemo(() => {
    const map = {};
    for (const m of members) map[m.id] = m;
    return map;
  }, [members]);

  useEffect(() => {
    if (knownIdsRef.current === null) {
      knownIdsRef.current = new Set(ripples.map((r) => r.id));
      return;
    }
    const newOnes = ripples.filter((r) => !knownIdsRef.current.has(r.id));
    if (newOnes.length === 0) return;

    newOnes.forEach((r) => knownIdsRef.current.add(r.id));
    const newest = newOnes[0];
    setFreshId(newest.id);
    haptic(14);

    if (newest.memberId !== currentMemberId) {
      const sender = memberMap[newest.memberId];
      setTideWave({
        id: newest.id,
        name: sender?.nickname || sender?.name || 'A fish',
      });
    }

    const timer = window.setTimeout(() => {
      setFreshId((cur) => (cur === newest.id ? '' : cur));
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [ripples, currentMemberId, memberMap]);

  const filteredRipples = useMemo(() => {
    if (memberFilter === 'all') return ripples;
    return ripples.filter((r) => r.memberId === memberFilter);
  }, [ripples, memberFilter]);

  const spotlightRipple = useMemo(() => {
    if (filteredRipples.length === 0) return null;
    return filteredRipples.find((r) => r.id === selectedId) || filteredRipples[0];
  }, [filteredRipples, selectedId]);

  const countsByMember = useMemo(() => {
    const counts = {};
    for (const r of ripples) {
      counts[r.memberId] = (counts[r.memberId] || 0) + 1;
    }
    return counts;
  }, [ripples]);

  const focusRipple = (rippleId) => {
    setSelectedId(rippleId);
    window.setTimeout(() => {
      spotlightRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }, 40);
  };

  const handleSendNote = (event) => {
    event.preventDefault();
    if (!spotlightRipple || !noteInput.trim()) return;
    onAddNote?.(spotlightRipple.id, noteInput);
    setNoteInput('');
  };

  const handleKeepInVault = async () => {
    if (!spotlightRipple || !vaultTripId) return;
    await onSaveToVault?.(spotlightRipple, vaultTripId);
    const targetTrip = outings.find((o) => o.id === vaultTripId);
    setSavedNotice(`Kept in "${targetTrip?.title || 'Trip Vault'}"`);
    window.setTimeout(() => setSavedNotice(''), 2500);
  };

  // Pond Calendar calculations
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const dayCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  const ripplesByDay = useMemo(() => {
    const map = {};
    for (const r of filteredRipples) {
      const key = dateKeyFromIso(r.createdAt);
      if (!key.startsWith(monthPrefix)) continue;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return map;
  }, [filteredRipples, monthPrefix]);

  const spotlightSender = spotlightRipple ? memberMap[spotlightRipple.memberId] : null;
  const isOwner = spotlightRipple?.memberId === currentMemberId;

  return (
    <section className="page-section ripples-page pond-page">
      <PondSurface reduceMotion={reduceMotion} />
      <BubbleLayer bubbles={bubbles} />
      <TideWave wave={tideWave} onDone={() => setTideWave(null)} />

      <div className="page-title-row">
        <div>
          <span className="eyebrow">Pond ripples · Live</span>
          <h1>Ripples</h1>
          <p>Drop a frame into the pond — the other six feel the ripple in real time. Older frames sink slowly; keepers rise into Trip Vault.</p>
        </div>

        <div className="ripples-head-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setShowCalendar(true)}
          >
            <RippleIcon name="calendar" size={17} /> Tide Calendar
          </button>

          {!isTouchDevice && (
            <button type="button" className="button button-primary" onClick={onOpenComposer}>
              <RippleIcon name="camera" size={18} /> Drop a ripple
            </button>
          )}
        </div>
      </div>

      {isTouchDevice && (
        <LiveRippleCamera outings={outings} onCreateRipple={onCreateRipple} />
      )}

      <div className="ripples-filter-strip" role="group" aria-label="Filter ripples by member">
        <button
          type="button"
          className={`ripples-filter-chip${memberFilter === 'all' ? ' is-active' : ''}`}
          aria-pressed={memberFilter === 'all'}
          onClick={() => setMemberFilter('all')}
        >
          <span>All</span>
          <strong>{String(ripples.length).padStart(2, '0')}</strong>
        </button>
        {members.map((person) => {
          const count = countsByMember[person.id] || 0;
          const active = memberFilter === person.id;
          return (
            <button
              key={person.id}
              type="button"
              className={`ripples-filter-chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => setMemberFilter(person.id)}
            >
              <span className={`avatar avatar-${person.color} avatar-small`} aria-hidden="true">
                {(person.nickname || person.name).slice(0, 1)}
              </span>
              <span>{person.nickname || person.name}</span>
              <strong>{String(count).padStart(2, '0')}</strong>
            </button>
          );
        })}
      </div>

      {filteredRipples.length === 0 ? (
        <div className="soft-callout ripples-empty-state">
          <span className="callout-illustration">
            <RippleIcon name="ripple" size={23} />
          </span>
          <div>
            <strong>No ripples here yet</strong>
            <p>
              {isTouchDevice
                ? 'Use the live camera above to drop what you’re seeing right now.'
                : 'Tap “Drop a ripple” to share what you’re seeing right now.'}
            </p>
          </div>
          {!isTouchDevice && (
            <button type="button" className="button button-primary" onClick={onOpenComposer}>
              <RippleIcon name="camera" size={16} /> Drop a ripple
            </button>
          )}
        </div>
      ) : (
        <>
            {spotlightRipple && (
              <article ref={spotlightRef} className="ripples-spotlight-card">
                <HudCorners />
                <div className="ripples-spotlight-media">
                  <motion.img
                    key={spotlightRipple.id}
                    src={spotlightRipple.imageUrl}
                    alt={spotlightRipple.caption || 'Selected sky ripple'}
                    initial={
                      reduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 18,
                            scale: 1.04,
                            filter: 'blur(14px) saturate(0.55) brightness(0.8)',
                          }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: 'blur(0px) saturate(1) brightness(1)',
                    }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>

                <div className="ripples-spotlight-panel">
                  <div className="ripples-spotlight-top">
                    <div className="ripples-sender-meta">
                      <span className={`avatar avatar-${spotlightSender?.color || 'blue'}`}>
                        {(spotlightSender?.nickname || spotlightSender?.name || 'F').slice(0, 1)}
                      </span>
                      <div>
                        <strong>{spotlightSender?.nickname || spotlightSender?.name || 'Fish'}</strong>
                        <span>
                          {formatRelativeTime(spotlightRipple.createdAt)}
                          {spotlightRipple.place ? ` · ${spotlightRipple.place}` : ''}
                        </span>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        className="quiet-button ripples-delete-btn"
                        onClick={() => onDeleteRipple?.(spotlightRipple.id)}
                        title="Remove this ripple"
                      >
                        <RippleIcon name="trash" size={15} /> Remove
                      </button>
                    )}
                  </div>

                  <p className="ripples-spotlight-caption">
                    {spotlightRipple.caption || 'A quiet frame shared with the pond.'}
                  </p>

                  <div className="ripples-echo-section">
                    <span className="ripples-sub-label">Bubbles</span>
                    <div className="ripple-echo-row" role="group" aria-label="Bubble reactions">
                      {ECHO_EMOJIS.map((emoji) => {
                        const list = spotlightRipple.reactions?.[emoji] ?? [];
                        const active = list.includes(currentMemberId);
                        const names = list
                          .map((id) => memberMap[id]?.nickname || memberMap[id]?.name || id)
                          .join(', ');
                        return (
                          <button
                            key={emoji}
                            type="button"
                            className={`ripple-echo-chip${active ? ' is-active' : ''}`}
                            aria-pressed={active}
                            title={names ? `${emoji} ${names}` : `Send a bubble ${emoji}`}
                            onClick={(event) => {
                              if (!active) {
                                const rect = event.currentTarget.getBoundingClientRect();
                                spawnBubble(emoji, rect.left + rect.width / 2, rect.top);
                                haptic(8);
                              }
                              onToggleReaction?.(spotlightRipple.id, emoji);
                            }}
                          >
                            <span>{emoji}</span>
                            {list.length > 0 && <strong>{list.length}</strong>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="ripples-notes-section">
                    <span className="ripples-sub-label">
                      Float notes ({String(spotlightRipple.notes?.length || 0).padStart(2, '0')})
                    </span>
                    <div className="ripples-notes-list">
                      {(spotlightRipple.notes ?? []).length === 0 ? (
                        <p className="ripples-notes-empty">Leave a quick note for {spotlightSender?.nickname || spotlightSender?.name || 'the sender'}.</p>
                      ) : (
                        spotlightRipple.notes.map((note) => {
                          const author = memberMap[note.memberId];
                          const canDelete = note.memberId === currentMemberId;
                          return (
                            <div key={note.id} className="ripples-note-item">
                              <div>
                                <strong>{author?.nickname || author?.name || 'Fish'}</strong>
                                <span>{note.text}</span>
                              </div>
                              {canDelete && (
                                <button
                                  type="button"
                                  className="icon-button ripples-note-del"
                                  aria-label="Delete note"
                                  onClick={() => onDeleteNote?.(spotlightRipple.id, note.id)}
                                >
                                  <RippleIcon name="close" size={13} />
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form className="ripples-note-form" onSubmit={handleSendNote}>
                      <input
                        className="text-input"
                        placeholder="Write a quick reply…"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        maxLength={140}
                      />
                      <button
                        type="submit"
                        className="button button-secondary"
                        disabled={!noteInput.trim()}
                      >
                        Send
                      </button>
                    </form>
                  </div>

                  {outings.length > 0 && (
                    <div className="ripples-vault-bridge">
                      <span className="ripples-sub-label">Keep in Trip Vault</span>
                      <div className="ripples-vault-controls">
                        <select
                          className="text-input"
                          value={vaultTripId}
                          onChange={(e) => setVaultTripId(e.target.value)}
                          aria-label="Select Trip Vault folder"
                        >
                          {outings.map((trip) => (
                            <option key={trip.id} value={trip.id}>
                              {trip.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={handleKeepInVault}
                        >
                          <RippleIcon name="folder" size={16} /> Keep
                        </button>
                        <button
                          type="button"
                          className="quiet-button"
                          onClick={onOpenVault}
                        >
                          Open Vault →
                        </button>
                      </div>
                      {savedNotice && (
                        <p className="ripples-saved-notice" role="status">
                          <RippleIcon name="check" size={14} /> {savedNotice}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )}

            <div className="ripples-grid" aria-label="All ripples">
              {filteredRipples.map((ripple) => {
                const sender = memberMap[ripple.memberId];
                const isSelected = spotlightRipple?.id === ripple.id;
                const reactionTotal = Object.values(ripple.reactions ?? {}).reduce(
                  (sum, arr) => sum + arr.length,
                  0,
                );
                const isFresh = ripple.id === freshId;
                return (
                  <button
                    key={ripple.id}
                    type="button"
                    className={`ripples-grid-card ${depthClass(ripple.createdAt)}${isSelected ? ' is-selected' : ''}${isFresh ? ' is-fresh' : ''}`}
                    onClick={() => focusRipple(ripple.id)}
                  >
                    <div className="ripples-grid-media">
                      <img
                        src={ripple.imageUrl}
                        alt={ripple.caption || 'Group ripple'}
                        loading="lazy"
                        decoding="async"
                      />
                      {isFresh && <RippleBurst trigger={freshId} tone="sea" />}
                      <span className="ripples-grid-time">{formatRelativeTime(ripple.createdAt)}</span>
                      {reactionTotal > 0 && (
                        <span className="ripples-grid-echoes">🫧 {reactionTotal}</span>
                      )}
                    </div>
                    <div className="ripples-grid-foot">
                      <div className="ripples-grid-sender">
                        <span className={`avatar avatar-${sender?.color || 'blue'} avatar-small`}>
                          {(sender?.nickname || sender?.name || 'F').slice(0, 1)}
                        </span>
                        <strong>{sender?.nickname || sender?.name || 'Fish'}</strong>
                      </div>
                      {ripple.caption && <p>{ripple.caption}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
      )}

      <AnimatePresence>
        {showCalendar && (
          <PondCalendarModal
            monthLabel={monthLabel}
            dayCells={dayCells}
            year={year}
            month={month}
            ripplesByDay={ripplesByDay}
            onPrevMonth={() => setMonthOffset((v) => v - 1)}
            onNextMonth={() => setMonthOffset((v) => v + 1)}
            onSelectRipple={focusRipple}
            onClose={() => setShowCalendar(false)}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
