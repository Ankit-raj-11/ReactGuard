import React from 'react';

const SvgIcon = ({ children, color = "currentColor", size = 24, strokeWidth = 2, opacity, style, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
    style={style}
    {...props}
  >
    {children}
  </svg>
);

export const Shield = (props) => <SvgIcon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></SvgIcon>;
export const Activity = (props) => <SvgIcon {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></SvgIcon>;
export const Database = (props) => <SvgIcon {...props}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></SvgIcon>;
export const Zap = (props) => <SvgIcon {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></SvgIcon>;
export const Clock = (props) => <SvgIcon {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></SvgIcon>;
export const Radio = (props) => <SvgIcon {...props}><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></SvgIcon>;
export const RotateCcw = (props) => <SvgIcon {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></SvgIcon>;
export const AlertTriangle = (props) => <SvgIcon {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></SvgIcon>;
export const CheckCircle = (props) => <SvgIcon {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></SvgIcon>;
export const Link = (props) => <SvgIcon {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></SvgIcon>;
export const Copy = (props) => <SvgIcon {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></SvgIcon>;
export const Wallet = (props) => <SvgIcon {...props}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></SvgIcon>;
export const ChevronRight = (props) => <SvgIcon {...props}><path d="m9 18 6-6-6-6"/></SvgIcon>;
export const TrendingDown = (props) => <SvgIcon {...props}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></SvgIcon>;
export const Play = (props) => <SvgIcon {...props} fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></SvgIcon>;
export const Cpu = (props) => <SvgIcon {...props}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></SvgIcon>;
