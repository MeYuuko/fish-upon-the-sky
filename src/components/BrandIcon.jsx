const ALIASES = {
  home: 'futs-home',
  calendar: 'futs-calendar',
  spark: 'futs-spark',
  sparkles: 'futs-spark',
  heart: 'futs-spark',
  ripple: 'futs-wave',
  ripples: 'futs-wave',
  wave: 'futs-wave',
  folder: 'futs-folder',
  people: 'futs-team',
  team: 'futs-team',
  image: 'futs-image',
  photo: 'futs-image',
  camera: 'futs-image',
  link: 'futs-link',
  check: 'futs-check-badge',
  verified: 'futs-check-badge',
  arrowUpRight: 'futs-arrow-launch',
  external: 'futs-arrow-launch',
  launch: 'futs-arrow-launch',
  send: 'futs-paper-plane',
  pin: 'futs-compass',
  compass: 'futs-compass',
  sheet: 'futs-document',
  document: 'futs-document',
  download: 'futs-download',
  share: 'futs-share',
  search: 'futs-search',
  chat: 'futs-chat',
  notes: 'futs-chat',
  fish: 'futs-fish',
  profile: 'futs-profile',
  settings: 'futs-settings',
  idea: 'futs-spark-idea',
};

const ICON_FILL = 'var(--icon-fill, rgba(1, 146, 198, 0.34))';
const ICON_ACCENT = 'var(--icon-accent, #F1FF62)';
const ICON_ACCENT_WASH = 'var(--icon-accent-wash, rgba(241, 255, 98, 0.35))';

function renderGlyph(id, sw, showFill) {
  switch (id) {
    case 'futs-fish':
      return (
        <>
          {showFill && <polygon points="5,17 11,8 17,9 22,6 15,18 9,15" fill={ICON_FILL} />}
          {showFill && <polygon points="10,15 17,11 22,6 15,18" fill={ICON_ACCENT_WASH} />}
          <polygon points="2,11 6,13 4,17 5,13.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="5,17 11,8 17,9 22,6 15,18 9,15" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="9,15 17,11 22,6" fill="none" stroke="currentColor" strokeWidth={sw * 0.85} />
          <path d="M16.5 8.2 Q16.5 10.5 18.5 10.5 Q16.5 10.5 16.5 12.8 Q16.5 10.5 14.5 10.5 Q16.5 10.5 16.5 8.2 Z" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-paper-plane':
      return (
        <>
          {showFill && <polygon points="3,11 21,3 14,21 11,13" fill={ICON_FILL} />}
          {showFill && <polygon points="11,13 21,3 14,21" fill={ICON_ACCENT_WASH} />}
          <polygon points="3,11 21,3 14,21 11,13" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <line x1="11" y1="13" x2="21" y2="3" stroke="currentColor" strokeWidth={sw * 0.9} />
          <path d="M5 17.5 Q5 19.5 7 19.5 Q5 19.5 5 21.5 Q5 19.5 3 19.5 Q5 19.5 5 17.5 Z" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-spark':
      return (
        <>
          {showFill && <path d="M12 2.5 Q12 12 21.5 12 Q12 12 12 21.5 Q12 12 2.5 12 Q12 12 12 2.5 Z" fill={ICON_FILL} />}
          <path d="M12 2.5 Q12 12 21.5 12 Q12 12 12 21.5 Q12 12 2.5 12 Q12 12 12 2.5 Z" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <path d="M12 7.5 Q12 12 16.5 12 Q12 12 12 16.5 Q12 12 7.5 12 Q12 12 12 7.5 Z" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-constellation':
      return (
        <>
          <polyline points="3,19 7,15 11,17 13,11 17,13 19,7 21,4" fill="none" stroke="currentColor" strokeWidth={sw * 0.85} strokeDasharray="2 1.5" />
          <rect x="2" y="18" width="2.2" height="2.2" transform="rotate(45 3.1 19.1)" fill="currentColor" />
          <rect x="6" y="14" width="2.2" height="2.2" transform="rotate(45 7.1 15.1)" fill={showFill ? ICON_FILL : 'none'} stroke="currentColor" strokeWidth="1.2" />
          <rect x="10" y="16" width="2.2" height="2.2" transform="rotate(45 11.1 17.1)" fill="currentColor" />
          <rect x="12" y="10" width="2.4" height="2.4" transform="rotate(45 13.2 11.2)" fill={showFill ? ICON_FILL : 'none'} stroke="currentColor" strokeWidth="1.2" />
          <rect x="16" y="12" width="2.2" height="2.2" transform="rotate(45 17.1 13.1)" fill="currentColor" />
          <path d="M19 3.8 Q19 7 22.2 7 Q19 7 19 10.2 Q19 7 15.8 7 Q19 7 19 3.8 Z" fill={ICON_ACCENT} />
          <rect x="20" y="3" width="1.8" height="1.8" transform="rotate(45 20.9 3.9)" fill="currentColor" />
        </>
      );
    case 'futs-wave':
      return (
        <>
          {showFill && <polygon points="2,14 7,9 12,14 17,9 22,14 22,19 2,19" fill={ICON_FILL} />}
          <polyline points="2,12 7,7 12,12 17,7 22,12" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="2,17.5 7,12.5 12,17.5 17,12.5 22,17.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="17,5 18.5,6.5 17,8 15.5,6.5" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-cloud':
      return (
        <>
          {showFill && <polygon points="6,19 3,16 3,13 6,10 8,10 11,6 16,6 19,10 21,12 21,16 18,19" fill={ICON_FILL} />}
          <polygon points="6,19 3,16 3,13 6,10 8,10 11,6 16,6 19,10 21,12 21,16 18,19" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="11,6 13,12 19,10" fill="none" stroke="currentColor" strokeWidth={sw * 0.75} opacity="0.55" />
          <path d="M18.5 3.5 Q18.5 5.5 20.5 5.5 Q18.5 5.5 18.5 7.5 Q18.5 5.5 16.5 5.5 Q18.5 5.5 18.5 3.5 Z" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-compass':
      return (
        <>
          {showFill && <polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" fill={ICON_FILL} />}
          <polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="15.5,8.5 13,13 8.5,15.5 11,11" fill={ICON_ACCENT} stroke="currentColor" strokeWidth={sw * 0.85} strokeLinejoin="miter" />
        </>
      );
    case 'futs-prism':
      return (
        <>
          {showFill && <polygon points="12,2.5 20,8 17,20.5 7,20.5 4,8" fill={ICON_FILL} />}
          <polygon points="12,2.5 20,8 17,20.5 7,20.5 4,8" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="4,8 12,11 20,8" fill="none" stroke="currentColor" strokeWidth={sw * 0.85} />
          <line x1="12" y1="2.5" x2="12" y2="20.5" stroke="currentColor" strokeWidth={sw * 0.8} />
          <polygon points="12,8.5 14.5,11 12,13.5 9.5,11" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-team':
      return (
        <>
          {showFill && <polygon points="9,5 15,5 16,10 12,12 8,10" fill={ICON_FILL} />}
          {showFill && <polygon points="5,20 7,15 17,15 19,20" fill={ICON_FILL} />}
          <polygon points="9.5,4.5 14.5,4.5 15.5,9.5 12,11.5 8.5,9.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="5,20 7,14.5 17,14.5 19,20" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="2,19 3.5,15 6,15" fill="none" stroke="currentColor" strokeWidth={sw * 0.9} />
          <polyline points="22,19 20.5,15 18,15" fill="none" stroke="currentColor" strokeWidth={sw * 0.9} />
          <polygon points="12,16.2 13.5,17.7 12,19.2 10.5,17.7" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-profile':
      return (
        <>
          {showFill && <polygon points="6,3 20,3 20,18 17,21 4,21 4,5" fill={ICON_FILL} />}
          <polygon points="6,3 20,3 20,18 17,21 4,21 4,5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="10,7.5 14,7.5 14,11.5 10,11.5" fill="none" stroke="currentColor" strokeWidth={sw * 0.9} />
          <polyline points="7.5,17.5 9.5,14.5 14.5,14.5 16.5,17.5" fill="none" stroke="currentColor" strokeWidth={sw * 0.9} />
          <polygon points="17.5,5.5 19,7 17.5,8.5 16,7" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-chat':
      return (
        <>
          {showFill && <polygon points="5,4 21,4 21,15 18,18 9,18 4,21 4,7" fill={ICON_FILL} />}
          <polygon points="6,4 21,4 21,15 18,18 9,18 4,21 4,6" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <line x1="8" y1="9.5" x2="17" y2="9.5" stroke="currentColor" strokeWidth={sw * 0.9} />
          <line x1="8" y1="13" x2="13.5" y2="13" stroke="currentColor" strokeWidth={sw * 0.9} />
          <rect x="15.5" y="12" width="2.2" height="2.2" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-announcement':
      return (
        <>
          {showFill && <polygon points="4,10 10,10 18,5 18,17 10,13 4,13" fill={ICON_FILL} />}
          <polygon points="4,9.5 10,9.5 18,5 18,17 10,13.5 4,13.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="7,13.5 9,19.5 12,19.5 10.5,13.5" fill="none" stroke="currentColor" strokeWidth={sw * 0.9} strokeLinejoin="miter" />
          <path d="M20.5 7.5 Q20.5 10 23 10 Q20.5 10 20.5 12.5 Q20.5 10 18 10 Q20.5 10 20.5 7.5 Z" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-calendar':
      return (
        <>
          {showFill && <polygon points="3,9 21,9 21,18 18,21 3,21" fill={ICON_FILL} />}
          <polygon points="3,5 21,5 21,18 18,21 3,21" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <line x1="3" y1="9.5" x2="21" y2="9.5" stroke="currentColor" strokeWidth={sw * 0.9} />
          <line x1="8" y1="3" x2="8" y2="6.5" stroke="currentColor" strokeWidth={sw} />
          <line x1="16" y1="3" x2="16" y2="6.5" stroke="currentColor" strokeWidth={sw} />
          <rect x="13" y="13" width="4" height="4" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-target':
      return (
        <>
          {showFill && <polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" fill={ICON_FILL} />}
          <polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="10,7 14,7 17,10 17,14 14,17 10,17 7,14 7,10" fill="none" stroke="currentColor" strokeWidth={sw * 0.85} />
          <polygon points="12,9.5 14.5,12 12,14.5 9.5,12" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-trophy':
      return (
        <>
          {showFill && <polygon points="6,4 18,4 16,13 12,15.5 8,13" fill={ICON_FILL} />}
          <polygon points="6,4 18,4 16,13 12,15.5 8,13" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="6,6 3,6 3,10 7,11.5" fill="none" stroke="currentColor" strokeWidth={sw * 0.9} strokeLinejoin="miter" />
          <polyline points="18,6 21,6 21,10 17,11.5" fill="none" stroke="currentColor" strokeWidth={sw * 0.9} strokeLinejoin="miter" />
          <line x1="12" y1="15.5" x2="12" y2="20" stroke="currentColor" strokeWidth={sw} />
          <line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth={sw} />
          <path d="M12 6.5 Q12 9 14.2 9 Q12 9 12 11.5 Q12 9 9.8 9 Q12 9 12 6.5 Z" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-spark-idea':
      return (
        <>
          {showFill && <polygon points="8,4 16,4 19,8 19,12 15,16 9,16 5,12 5,8" fill={ICON_FILL} />}
          <polygon points="8,4 16,4 19,8 19,12 15,16 9,16 5,12 5,8" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <line x1="9" y1="19" x2="15" y2="19" stroke="currentColor" strokeWidth={sw} />
          <line x1="10.5" y1="21.5" x2="13.5" y2="21.5" stroke="currentColor" strokeWidth={sw * 0.9} />
          <path d="M12 6.8 Q12 10 15 10 Q12 10 12 13.2 Q12 10 9 10 Q12 10 12 6.8 Z" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-layers':
      return (
        <>
          {showFill && <polygon points="12,3 21,8 12,13 3,8" fill={ICON_FILL} />}
          <polygon points="12,3 21,8 12,13 3,8" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="3,12.5 12,17.5 21,12.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="3,17 12,22 21,17" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="12,6.2 14.5,8 12,9.8 9.5,8" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-palette':
      return (
        <>
          {showFill && <polygon points="4,4 14,4 14,20 4,20" fill={ICON_FILL} />}
          <rect x="4" y="4" width="9" height="16" fill="none" stroke="currentColor" strokeWidth={sw} />
          <polyline points="13,7 19,7 19,20 13,20" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <line x1="4" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth={sw * 0.85} />
          <line x1="4" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth={sw * 0.85} />
          <rect x="14.5" y="13.5" width="3" height="4.5" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-pen-tool':
      return (
        <>
          {showFill && <polygon points="12,3 19,13 15,17 9,17 5,13" fill={ICON_FILL} />}
          <polygon points="12,3 19,13 15,17 9,17 5,13" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <rect x="8.5" y="17" width="7" height="4" fill="none" stroke="currentColor" strokeWidth={sw} />
          <line x1="12" y1="3" x2="12" y2="10.5" stroke="currentColor" strokeWidth={sw * 0.9} />
          <polygon points="12,9.5 14,11.5 12,13.5 10,11.5" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-grid':
      return (
        <>
          {showFill && <rect x="3" y="3" width="8" height="8" fill={ICON_FILL} />}
          {showFill && <rect x="13" y="13" width="8" height="8" fill={ICON_FILL} />}
          <rect x="3" y="3" width="7.5" height="7.5" fill="none" stroke="currentColor" strokeWidth={sw} />
          <polygon points="13.5,3 19,3 21,5 21,10.5 13.5,10.5" fill={ICON_ACCENT} stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <rect x="3" y="13.5" width="7.5" height="7.5" fill="none" stroke="currentColor" strokeWidth={sw} />
          <rect x="13.5" y="13.5" width="7.5" height="7.5" fill="none" stroke="currentColor" strokeWidth={sw} />
        </>
      );
    case 'futs-slide':
      return (
        <>
          {showFill && <polygon points="3,4 19,4 21,6 21,16 3,16" fill={ICON_FILL} />}
          <polygon points="3,4 19,4 21,6 21,16 3,16" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <line x1="12" y1="16" x2="12" y2="20.5" stroke="currentColor" strokeWidth={sw} />
          <line x1="7.5" y1="20.5" x2="16.5" y2="20.5" stroke="currentColor" strokeWidth={sw} />
          <polyline points="6.5,12.5 10,9.5 13,11.5 17,7.5" fill="none" stroke="currentColor" strokeWidth={sw * 0.9} />
          <rect x="15.8" y="6.3" width="2.4" height="2.4" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-image':
      return (
        <>
          {showFill && <polygon points="3,18 9,11 13,15 16,12 21,18" fill={ICON_FILL} />}
          <polygon points="5,4 21,4 21,18 19,20 3,20 3,6" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="3.5,18 9,11.5 13,15.5 16,12.5 20.5,17.5" fill="none" stroke="currentColor" strokeWidth={sw * 0.9} strokeLinejoin="miter" />
          <path d="M16 6.5 Q16 8.5 18 8.5 Q16 8.5 16 10.5 Q16 8.5 14 8.5 Q16 8.5 16 6.5 Z" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-folder':
      return (
        <>
          {showFill && <polygon points="3,8 21,8 21,18 19,20 3,20" fill={ICON_FILL} />}
          <polygon points="3,5 10,5 12,8 21,8 21,18 19,20 3,20" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="15.5,11.5 18.5,11.5 18.5,14.5 15.5,14.5" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-document':
      return (
        <>
          {showFill && <polygon points="5,3 15,3 19,7 19,21 5,21" fill={ICON_FILL} />}
          <polygon points="5,3 15,3 19,7 19,21 5,21" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="15,3 19,7 15,7" fill={ICON_ACCENT} stroke="currentColor" strokeWidth={sw * 0.85} strokeLinejoin="miter" />
          <line x1="8" y1="11.5" x2="16" y2="11.5" stroke="currentColor" strokeWidth={sw * 0.9} />
          <line x1="8" y1="15.5" x2="14" y2="15.5" stroke="currentColor" strokeWidth={sw * 0.9} />
        </>
      );
    case 'futs-home':
      return (
        <>
          {showFill && <polygon points="12,3.5 20,10.5 20,20.5 4,20.5 4,10.5" fill={ICON_FILL} />}
          <polygon points="12,3.5 20,10.5 20,20.5 4,20.5 4,10.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <rect x="10" y="13.5" width="4" height="7" fill={ICON_ACCENT} stroke="currentColor" strokeWidth={sw * 0.85} />
        </>
      );
    case 'futs-search':
      return (
        <>
          {showFill && <polygon points="8,3 14,3 18,7 18,13 14,17 8,17 4,13 4,7" fill={ICON_FILL} />}
          <polygon points="8,3 14,3 18,7 18,13 14,17 8,17 4,13 4,7" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <line x1="16" y1="15" x2="21" y2="20" stroke="currentColor" strokeWidth={sw * 1.1} strokeLinecap="square" />
          <polygon points="11,7.5 13,9.5 11,11.5 9,9.5" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-arrow-launch':
      return (
        <>
          {showFill && <polygon points="6,6 19,5 18,18 14,14 8,20 4,16 10,10" fill={ICON_FILL} />}
          <polyline points="8,5 19,5 19,16" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <line x1="5" y1="19" x2="19" y2="5" stroke="currentColor" strokeWidth={sw} />
          <polygon points="6.5,14.5 9.5,17.5 6.5,20.5 3.5,17.5" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-download':
      return (
        <>
          {showFill && <polygon points="4,15 20,15 20,20 4,20" fill={ICON_FILL} />}
          <line x1="12" y1="3.5" x2="12" y2="14.5" stroke="currentColor" strokeWidth={sw} />
          <polyline points="7.5,10.5 12,15 16.5,10.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="4,15 4,20 20,20 20,15" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <rect x="10.5" y="16.8" width="3" height="1.6" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-share':
      return (
        <>
          <line x1="7.5" y1="11" x2="16.5" y2="6.5" stroke="currentColor" strokeWidth={sw * 0.9} />
          <line x1="7.5" y1="13" x2="16.5" y2="17.5" stroke="currentColor" strokeWidth={sw * 0.9} />
          <polygon points="6,9 9,12 6,15 3,12" fill={ICON_ACCENT} stroke="currentColor" strokeWidth={sw * 0.9} />
          <polygon points="18,3 21,6 18,9 15,6" fill={showFill ? ICON_FILL : 'none'} stroke="currentColor" strokeWidth={sw * 0.9} />
          <polygon points="18,15 21,18 18,21 15,18" fill={showFill ? ICON_FILL : 'none'} stroke="currentColor" strokeWidth={sw * 0.9} />
        </>
      );
    case 'futs-link':
      return (
        <>
          {showFill && <polygon points="9,12 12,9 15,12 12,15" fill={ICON_ACCENT} />}
          <polyline points="10.5,13.5 7,17 4.5,14.5 8,11 9.5,9.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="13.5,10.5 17,7 19.5,9.5 16,13 14.5,14.5" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <line x1="9.5" y1="14.5" x2="14.5" y2="9.5" stroke="currentColor" strokeWidth={sw} />
        </>
      );
    case 'futs-check-badge':
      return (
        <>
          {showFill && <polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" fill={ICON_FILL} />}
          <polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polyline points="8,12.5 11,15.5 16.5,9.5" fill="none" stroke="currentColor" strokeWidth={sw * 1.1} strokeLinejoin="miter" />
          <path d="M18.5 3.2 Q18.5 5 20.3 5 Q18.5 5 18.5 6.8 Q18.5 5 16.7 5 Q18.5 5 18.5 3.2 Z" fill={ICON_ACCENT} />
        </>
      );
    case 'futs-settings':
      return (
        <>
          {showFill && <polygon points="12,3.5 19.5,7.8 19.5,16.2 12,20.5 4.5,16.2 4.5,7.8" fill={ICON_FILL} />}
          <polygon points="12,3.5 19.5,7.8 19.5,16.2 12,20.5 4.5,16.2 4.5,7.8" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="miter" />
          <polygon points="12,8.5 15.5,12 12,15.5 8.5,12" fill={ICON_ACCENT} stroke="currentColor" strokeWidth={sw * 0.85} />
        </>
      );
    default:
      return null;
  }
}

export default function BrandIcon({
  name,
  size = 20,
  strokeWidth = 1.75,
  variant = 'duotone',
  className = '',
  ...rest
}) {
  const resolvedId = ALIASES[name] || name;
  const showFill = variant === 'duotone';

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className ? `brand-icon ${className}` : 'brand-icon'}
      {...rest}
    >
      {renderGlyph(resolvedId, strokeWidth, showFill)}
    </svg>
  );
}
