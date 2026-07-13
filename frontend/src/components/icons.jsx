/* Minimal single-stroke icons. currentColor so they inherit text color. */
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconFunnel = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />
  </svg>
);
export const IconStamp = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 9V7a4 4 0 0 1 8 0v2M4 20h16M6 20v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
  </svg>
);
export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </svg>
);
export const IconLock = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);
export const IconMega = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 10v4a1 1 0 0 0 1 1h3l6 4V5L8 9H5a1 1 0 0 0-1 1Z" />
    <path d="M18 8a5 5 0 0 1 0 8" />
  </svg>
);
export const IconUp = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 19V6m-6 6 6-6 6 6" />
  </svg>
);
export const IconDown = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 5v13m6-6-6 6-6-6" />
  </svg>
);
export const IconDownload = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 4v10m-4-4 4 4 4-4M5 19h14" />
  </svg>
);
export const IconUpload = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 16V6m-4 4 4-4 4 4M5 19h14" />
  </svg>
);
export const IconRefresh = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M20 11a8 8 0 1 0-.5 4M20 5v6h-6" />
  </svg>
);
export const IconSend = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m21 4-9 16-2-7-7-2 18-7Z" />
  </svg>
);
export const IconMail = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const IconClick = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 3v4M3 5h4M6 17l3.5 3.5M12 3l7 18 2-7 7-2-16-9Z" />
  </svg>
);
export const IconBell = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" />
  </svg>
);
