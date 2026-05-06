import type React from "react";

type IconProps = { style?: React.CSSProperties; className?: string };

export const Pict: Record<string, React.FC<IconProps>> = {
  GPU: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="7" width="20" height="10" rx="1.5"/>
      <circle cx="8" cy="12" r="2.4"/>
      <circle cx="15" cy="12" r="1.6"/>
      <line x1="19" y1="10" x2="21" y2="10"/>
      <line x1="19" y1="14" x2="21" y2="14"/>
    </svg>
  ),
  CPU: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="5" y="5" width="14" height="14" rx="1"/>
      <rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="2" x2="9" y2="5"/>
      <line x1="15" y1="2" x2="15" y2="5"/>
      <line x1="9" y1="19" x2="9" y2="22"/>
      <line x1="15" y1="19" x2="15" y2="22"/>
      <line x1="19" y1="9" x2="22" y2="9"/>
      <line x1="19" y1="15" x2="22" y2="15"/>
      <line x1="2" y1="9" x2="5" y2="9"/>
      <line x1="2" y1="15" x2="5" y2="15"/>
    </svg>
  ),
  RAM: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="7" width="20" height="10" rx="1"/>
      <line x1="6" y1="7" x2="6" y2="17"/>
      <line x1="10" y1="7" x2="10" y2="17"/>
      <line x1="14" y1="7" x2="14" y2="17"/>
      <line x1="18" y1="7" x2="18" y2="17"/>
      <line x1="2" y1="19" x2="22" y2="19"/>
    </svg>
  ),
  HDD: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="6" width="18" height="12" rx="1.5"/>
      <circle cx="7" cy="15" r="1"/>
      <line x1="11" y1="15" x2="19" y2="15"/>
    </svg>
  ),
  MOBO: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="3" width="18" height="18" rx="1.5"/>
      <rect x="7" y="7" width="6" height="6"/>
      <circle cx="17" cy="8" r="1.2"/>
      <circle cx="17" cy="13" r="1.2"/>
      <line x1="7" y1="17" x2="17" y2="17"/>
    </svg>
  ),
  Box: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M21 8 12 3 3 8v8l9 5 9-5z"/>
      <path d="M3 8l9 5 9-5"/>
      <line x1="12" y1="13" x2="12" y2="21"/>
    </svg>
  ),
  Zap: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Layers: (p) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
};

export default Pict;