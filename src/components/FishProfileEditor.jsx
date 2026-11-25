import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { compressPortraitFile } from '../data/fishProfiles.js';

const TABS = [
  { id: 'basic', label: 'Cơ bản' },
  { id: 'personal', label: 'Cá nhân & MXH' },
  { id: 'books', label: 'Hồ sơ (4 tờ)' },
  { id: 'letter', label: 'Lời nhắn' },
];

const ART_OPTIONS = [
  { value: 'sunrise', label: 'Bình minh' },
  { value: 'lamp', label: 'Đèn ấm' },
  { value: 'path', label: 'Lối nhỏ' },
  { value: 'days', label: 'Ngày mây' },
];

function EditorIcon({ name, size = 16 }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  };
  if (name === 'close') {
    return (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  }
  if (name === 'upload') {
    return (
      <svg {...common}>
        <path d="M12 15V4M7 9l5-5 5 5" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
    );
  }
  if (name === 'plus') {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }
  if (name === 'trash') {
    return (
      <svg {...common}>
        <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function buildInitialDraft(member) {
  const letterBody =
    member.letter?.body ||
    (Array.isArray(member.letter?.messages) ? member.letter.messages.join('\n\n') : '');
  return {
    displayFirst: member.displayFirst || member.name,
    displayLast: member.displayLast || member.nickname || member.craft || '',
    nickname: member.nickname || '',
    craft: member.craft || '',
    role: member.role || '',
    rolesText: (member.roles || []).join(', '),
    headline0: member.headline?.[0] || '',
    headline1: member.headline?.[1] || '',
    bio: member.bio || '',
    birthday: member.birthday || '',
    foodNotes: member.foodNotes || '',
    contact: member.contact || '',
    customPhoto: member.customPhoto || '',
    socials: (member.socials || []).map((s, idx) => ({
      id: s.id || `social-${idx}`,
      label: s.label || '',
      handle: s.handle || '',
      href: s.href || '',
    })),
    books: (member.books || []).map((b) => ({
      ...b,
      coverLine0: b.coverLines?.[0] || '',
      coverLine1: b.coverLines?.[1] || '',
      topicsText: (b.topics || []).join(', '),
      image: b.image || '',
    })),
    letter: {
      eyebrow: member.letter?.eyebrow || member.letter?.heading || 'Lời nhắn gửi nhóm',
      greeting: member.letter?.greeting || 'Gửi cả nhóm,',
      body: letterBody,
      seal: member.letter?.seal || member.name.slice(0, 4).toUpperCase(),
      signoff: member.letter?.signoff || `— ${member.name}`,
    },
  };
}

export default function FishProfileEditor({
  member,
  initialTab = 'basic',
  initialBookIdx = 0,
  onSave,
  onClose,
}) {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState(initialTab);
  const [activeBookIdx, setActiveBookIdx] = useState(initialBookIdx);
  const [draft, setDraft] = useState(() => buildInitialDraft(member));
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingSheetPhoto, setUploadingSheetPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(buildInitialDraft(member));
    setErrorMsg('');
  }, [member]);

  useEffect(() => {
    setTab(initialTab || 'basic');
    setActiveBookIdx(typeof initialBookIdx === 'number' ? initialBookIdx : 0);
  }, [initialTab, initialBookIdx]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const previewPhoto = draft.customPhoto || member.cutoutPhoto || member.defaultPhoto;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setUploadingPhoto(true);
    try {
      const compressed = await compressPortraitFile(file);
      setDraft((prev) => ({ ...prev, customPhoto: compressed }));
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể xử lý ảnh này.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const updateSocial = (idx, key, value) => {
    setDraft((prev) => ({
      ...prev,
      socials: prev.socials.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    }));
  };

  const addSocial = () => {
    setDraft((prev) => ({
      ...prev,
      socials: [
        ...prev.socials,
        { id: `social-${Date.now()}`, label: 'Instagram', handle: '', href: '' },
      ],
    }));
  };

  const removeSocial = (idx) => {
    setDraft((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== idx),
    }));
  };

  const updateBook = (idx, key, value) => {
    setDraft((prev) => ({
      ...prev,
      books: prev.books.map((book, i) => (i === idx ? { ...book, [key]: value } : book)),
    }));
  };

  const handleSheetPhotoUpload = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setUploadingSheetPhoto(true);
    try {
      const compressed = await compressPortraitFile(file, 560, 0.78);
      updateBook(idx, 'image', compressed);
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể xử lý ảnh tờ hồ sơ này.');
    } finally {
      setUploadingSheetPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setErrorMsg('');

    const parsedRoles = draft.rolesText
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const trimmedBody = draft.letter.body.trim();
    const parsedMessages = trimmedBody
      .split(/\n{2,}/)
      .map((m) => m.trim())
      .filter(Boolean);

    const patch = {
      displayFirst: draft.displayFirst.trim() || member.name,
      displayLast: draft.displayLast.trim() || draft.nickname.trim() || member.craft || 'Fish',
      nickname: draft.nickname.trim(),
      craft: draft.craft.trim() || 'Fish',
      role: draft.role.trim() || 'Fish Upon The Sky',
      roles: parsedRoles.length > 0 ? parsedRoles : [draft.craft.trim() || 'Fish'],
      headline: [draft.headline0.trim() || member.name, draft.headline1.trim()],
      bio: draft.bio.trim(),
      birthday: draft.birthday.trim(),
      foodNotes: draft.foodNotes.trim(),
      contact: draft.contact.trim(),
      customPhoto: draft.customPhoto,
      socials: draft.socials
        .map((s) => ({
          id: s.id,
          label: s.label.trim(),
          handle: s.handle.trim(),
          href: s.href.trim(),
        }))
        .filter((s) => s.label || s.handle || s.href),
      books: draft.books.map((b) => ({
        id: b.id,
        label: b.label.trim() || b.title,
        title: b.title.trim() || b.label,
        coverLines: [b.coverLine0.trim() || b.title, b.coverLine1.trim()],
        topics: b.topicsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        art: b.art,
        colors: b.colors,
        chapter: b.chapter.trim(),
        chapterTitle: b.chapterTitle.trim(),
        text: b.text.trim(),
        image: b.image || '',
      })),
      letter: {
        ...(member.letter || {}),
        eyebrow: draft.letter.eyebrow.trim() || 'Lời nhắn gửi nhóm',
        heading: draft.letter.eyebrow.trim() || 'Lời nhắn gửi nhóm',
        greeting: draft.letter.greeting.trim() || 'Gửi cả nhóm,',
        body: trimmedBody,
        messages: parsedMessages.length > 0 ? parsedMessages : [trimmedBody || 'Chưa có lời nhắn gửi nhóm.'],
        seal: (draft.letter.seal.trim() || member.name.slice(0, 4).toUpperCase()).slice(0, 5),
        signoff: draft.letter.signoff.trim() || `— ${member.name}`,
      },
    };

    setSaving(true);
    try {
      const result = await onSave(patch);
      if (result && result.ok === false) {
        setErrorMsg(result.error || 'Không thể lưu thay đổi.');
        return;
      }
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể lưu thay đổi.');
    } finally {
      setSaving(false);
    }
  };

  const activeBook = draft.books[activeBookIdx] || draft.books[0];

  const drawerMarkup = (
    <motion.div
      className="fpe-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.aside
        className="fpe-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fpe-dialog-title"
        initial={reduceMotion ? false : { x: '100%' }}
        animate={{ x: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { x: '100%' }}
        transition={{ duration: reduceMotion ? 0.01 : 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="fpe-header">
          <div>
            <span className="fpe-kicker">CHỈNH SỬA HỒ SƠ CÁ NHÂN</span>
            <h2 id="fpe-dialog-title">{member.name}</h2>
          </div>
          <button type="button" className="fpe-close" onClick={onClose} aria-label="Đóng trình chỉnh sửa">
            <EditorIcon name="close" size={18} />
          </button>
        </header>

        <div className="fpe-tabs" role="tablist" aria-label="Các mục chỉnh sửa">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`fpe-tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form className="fpe-form" onSubmit={handleSubmit}>
          <div className="fpe-scroll">
            {errorMsg && (
              <div className="fpe-error" role="alert">
                {errorMsg}
              </div>
            )}

            {tab === 'basic' && (
              <div className="fpe-section">
                <div className="fpe-photo-card">
                  <img
                    src={previewPhoto}
                    alt={`Ảnh tách nền của ${member.name}`}
                    className="fpe-photo-thumb fpe-photo-checker"
                  />
                  <div className="fpe-photo-controls">
                    <strong>Ảnh chân dung tách nền</strong>
                    <p>Mặc định dùng ảnh tách nền trong Picture/Cá nhân/Tách nền.</p>
                    <div className="fpe-photo-btns">
                      <label className="fpe-btn-secondary">
                        <EditorIcon name="upload" size={15} />
                        <span>{uploadingPhoto ? 'Đang xử lý...' : 'Tải ảnh mới'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          hidden
                        />
                      </label>
                      {draft.customPhoto && (
                        <button
                          type="button"
                          className="fpe-btn-ghost"
                          onClick={() => setDraft((p) => ({ ...p, customPhoto: '' }))}
                        >
                          <EditorIcon name="reset" size={15} />
                          <span>Khôi phục ảnh tách nền gốc</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Tên lớn dòng 1</span>
                    <input
                      className="text-input"
                      value={draft.displayFirst}
                      onChange={(e) => setDraft((p) => ({ ...p, displayFirst: e.target.value }))}
                      placeholder={member.name}
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Tên lớn dòng 2</span>
                    <input
                      className="text-input"
                      value={draft.displayLast}
                      onChange={(e) => setDraft((p) => ({ ...p, displayLast: e.target.value }))}
                      placeholder="VD: The Keeper"
                    />
                  </label>
                </div>

                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Biệt danh (Nickname)</span>
                    <input
                      className="text-input"
                      value={draft.nickname}
                      onChange={(e) => setDraft((p) => ({ ...p, nickname: e.target.value }))}
                      placeholder="Tên thân mật trong nhóm"
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Tag ngắn trên thẻ (Craft)</span>
                    <input
                      className="text-input"
                      value={draft.craft}
                      onChange={(e) => setDraft((p) => ({ ...p, craft: e.target.value }))}
                      placeholder="VD: Planner, Lens..."
                    />
                  </label>
                </div>

                <label className="fpe-field">
                  <span>Vai trò trong nhóm</span>
                  <input
                    className="text-input"
                    value={draft.role}
                    onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
                    placeholder="VD: Calendar & schedules"
                  />
                </label>

                <label className="fpe-field">
                  <span>Các nhãn vai trò (cách nhau bằng dấu phẩy)</span>
                  <input
                    className="text-input"
                    value={draft.rolesText}
                    onChange={(e) => setDraft((p) => ({ ...p, rolesText: e.target.value }))}
                    placeholder="Calendar Keeper, Lịch trình, Giữ nhịp"
                  />
                </label>

                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Câu tiêu đề (dòng 1)</span>
                    <input
                      className="text-input"
                      value={draft.headline0}
                      onChange={(e) => setDraft((p) => ({ ...p, headline0: e.target.value }))}
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Câu tiêu đề (dòng 2)</span>
                    <input
                      className="text-input"
                      value={draft.headline1}
                      onChange={(e) => setDraft((p) => ({ ...p, headline1: e.target.value }))}
                    />
                  </label>
                </div>

                <label className="fpe-field">
                  <span>Giới thiệu bản thân (Bio)</span>
                  <textarea
                    className="text-input fpe-textarea"
                    rows={3}
                    value={draft.bio}
                    onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Vài dòng về bản thân bạn trong nhóm..."
                  />
                </label>
              </div>
            )}

            {tab === 'personal' && (
              <div className="fpe-section">
                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Sinh nhật</span>
                    <input
                      className="text-input"
                      value={draft.birthday}
                      onChange={(e) => setDraft((p) => ({ ...p, birthday: e.target.value }))}
                      placeholder="VD: 14/08"
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Thông tin liên hệ</span>
                    <input
                      className="text-input"
                      value={draft.contact}
                      onChange={(e) => setDraft((p) => ({ ...p, contact: e.target.value }))}
                      placeholder="SĐT, Zalo, Instagram DM..."
                    />
                  </label>
                </div>

                <label className="fpe-field">
                  <span>Ghi chú ăn uống / dị ứng</span>
                  <textarea
                    className="text-input fpe-textarea"
                    rows={2}
                    value={draft.foodNotes}
                    onChange={(e) => setDraft((p) => ({ ...p, foodNotes: e.target.value }))}
                    placeholder="Món thích, đồ không ăn được hoặc lưu ý dị ứng..."
                  />
                </label>

                <div className="fpe-socials-head">
                  <div>
                    <strong>Mạng xã hội &amp; Liên kết</strong>
                    <p>Hiển thị thành hàng ngang ở góc dưới bên trái.</p>
                  </div>
                  <button type="button" className="fpe-btn-secondary" onClick={addSocial}>
                    <EditorIcon name="plus" size={14} />
                    <span>Thêm link</span>
                  </button>
                </div>

                <div className="fpe-social-list">
                  {draft.socials.map((item, idx) => (
                    <div key={item.id || idx} className="fpe-social-row">
                      <input
                        className="text-input"
                        value={item.label}
                        onChange={(e) => updateSocial(idx, 'label', e.target.value)}
                        placeholder="Nền tảng (Instagram...)"
                      />
                      <input
                        className="text-input"
                        value={item.handle}
                        onChange={(e) => updateSocial(idx, 'handle', e.target.value)}
                        placeholder="Tên hiển thị (@...)"
                      />
                      <input
                        className="text-input"
                        value={item.href}
                        onChange={(e) => updateSocial(idx, 'href', e.target.value)}
                        placeholder="URL (https://...)"
                      />
                      <button
                        type="button"
                        className="fpe-icon-del"
                        onClick={() => removeSocial(idx)}
                        aria-label={`Xóa liên kết ${item.label || idx + 1}`}
                      >
                        <EditorIcon name="trash" size={15} />
                      </button>
                    </div>
                  ))}
                  {draft.socials.length === 0 && (
                    <p className="fpe-empty-note">Chưa có liên kết nào. Nhấn “Thêm link” để bổ sung.</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'books' && activeBook && (
              <div className="fpe-section">
                <div className="fpe-book-pills" role="group" aria-label="Chọn tờ hồ sơ muốn sửa">
                  {draft.books.map((book, idx) => (
                    <button
                      key={book.id}
                      type="button"
                      className={`fpe-book-pill${activeBookIdx === idx ? ' is-active' : ''}`}
                      onClick={() => setActiveBookIdx(idx)}
                    >
                      0{idx + 1} · {book.label}
                    </button>
                  ))}
                </div>

                <div className="fpe-photo-card">
                  {activeBook.image ? (
                    <img
                      src={activeBook.image}
                      alt={activeBook.label}
                      className="fpe-photo-thumb"
                    />
                  ) : (
                    <div className="fpe-photo-thumb fpe-photo-checker" style={{ display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--color-muted)' }}>
                      Minh họa
                    </div>
                  )}
                  <div className="fpe-photo-controls">
                    <strong>Ảnh đính kèm (tùy chọn)</strong>
                    <p>Hiển thị trên tờ hồ sơ khi mở túi kẹp nhựa. Bỏ trống để dùng tranh MP174.</p>
                    <div className="fpe-photo-btns">
                      <label className="fpe-btn-secondary">
                        <EditorIcon name="upload" size={15} />
                        <span>{uploadingSheetPhoto ? 'Đang xử lý...' : 'Tải ảnh tờ này'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSheetPhotoUpload(activeBookIdx, e)}
                          disabled={uploadingSheetPhoto}
                          hidden
                        />
                      </label>
                      {activeBook.image && (
                        <button
                          type="button"
                          className="fpe-btn-ghost"
                          onClick={() => updateBook(activeBookIdx, 'image', '')}
                        >
                          <EditorIcon name="reset" size={15} />
                          <span>Dùng tranh minh họa mặc định</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Đề mục tờ hồ sơ</span>
                    <input
                      className="text-input"
                      value={activeBook.label}
                      onChange={(e) => updateBook(activeBookIdx, 'label', e.target.value)}
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Mã nhãn (tuỳ chọn)</span>
                    <input
                      className="text-input"
                      value={activeBook.title}
                      onChange={(e) => updateBook(activeBookIdx, 'title', e.target.value)}
                    />
                  </label>
                </div>

                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Chữ bìa dòng 1</span>
                    <input
                      className="text-input"
                      value={activeBook.coverLine0}
                      onChange={(e) => updateBook(activeBookIdx, 'coverLine0', e.target.value)}
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Chữ bìa dòng 2</span>
                    <input
                      className="text-input"
                      value={activeBook.coverLine1}
                      onChange={(e) => updateBook(activeBookIdx, 'coverLine1', e.target.value)}
                    />
                  </label>
                </div>

                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Từ khóa nổi bật (cách dấu phẩy)</span>
                    <input
                      className="text-input"
                      value={activeBook.topicsText}
                      onChange={(e) => updateBook(activeBookIdx, 'topicsText', e.target.value)}
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Họa tiết minh họa mặc định</span>
                    <select
                      className="text-input"
                      value={activeBook.art}
                      onChange={(e) => updateBook(activeBookIdx, 'art', e.target.value)}
                    >
                      {ART_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Nhãn phụ (VD: Trang 01)</span>
                    <input
                      className="text-input"
                      value={activeBook.chapter}
                      onChange={(e) => updateBook(activeBookIdx, 'chapter', e.target.value)}
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Tiêu đề tờ hồ sơ</span>
                    <input
                      className="text-input"
                      value={activeBook.chapterTitle}
                      onChange={(e) => updateBook(activeBookIdx, 'chapterTitle', e.target.value)}
                    />
                  </label>
                </div>

                <label className="fpe-field">
                  <span>Nội dung chi tiết</span>
                  <textarea
                    className="text-input fpe-textarea"
                    rows={4}
                    value={activeBook.text}
                    onChange={(e) => updateBook(activeBookIdx, 'text', e.target.value)}
                  />
                </label>
              </div>
            )}

            {tab === 'letter' && (
              <div className="fpe-section">
                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Nhãn đầu bức thư</span>
                    <input
                      className="text-input"
                      value={draft.letter.eyebrow}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, letter: { ...p.letter, eyebrow: e.target.value } }))
                      }
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Lời chào mở đầu</span>
                    <input
                      className="text-input"
                      value={draft.letter.greeting}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, letter: { ...p.letter, greeting: e.target.value } }))
                      }
                      placeholder="VD: Gửi 6 con cá,"
                    />
                  </label>
                </div>

                <label className="fpe-field">
                  <span>Lời nhắn tự viết (tách bằng 1 dòng trống để chạy nhiều lá thư liên tiếp)</span>
                  <textarea
                    className="text-input fpe-textarea"
                    rows={6}
                    value={draft.letter.body}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, letter: { ...p.letter, body: e.target.value } }))
                    }
                    placeholder="Viết vài lời nhắn nhủ cho nhóm..."
                  />
                </label>

                <div className="fpe-grid-2">
                  <label className="fpe-field">
                    <span>Chữ trên dấu sáp (tối đa 5 ký tự)</span>
                    <input
                      className="text-input"
                      maxLength={5}
                      value={draft.letter.seal}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, letter: { ...p.letter, seal: e.target.value } }))
                      }
                    />
                  </label>
                  <label className="fpe-field">
                    <span>Chữ ký</span>
                    <input
                      className="text-input"
                      value={draft.letter.signoff}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, letter: { ...p.letter, signoff: e.target.value } }))
                      }
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <footer className="fpe-footer">
            <button type="button" className="button button-secondary" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="button button-primary" disabled={saving || uploadingPhoto || uploadingSheetPhoto}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </footer>
        </form>
      </motion.aside>
    </motion.div>
  );

  if (typeof document !== 'undefined') {
    const portalTarget = document.querySelector('.app-shell') || document.body;
    return createPortal(drawerMarkup, portalTarget);
  }
  return drawerMarkup;
}
