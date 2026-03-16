// Unique inline SVG thumbnail previews for each SmartArt layout type
import React from "react";

export function SmartArtThumbnail({ layoutId, color }: { layoutId: string; color: string }) {
  const c = color;
  const c2 = color + "99"; // semi-transparent
  const s = 48; // thumbnail size

  switch (layoutId) {
    // ===== LIST =====
    case "basic-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="8" width="12" height="32" rx="2" fill={c}/><rect x="18" y="8" width="12" height="32" rx="2" fill={c2}/><rect x="34" y="8" width="12" height="32" rx="2" fill={c}/></svg>);
    case "lined-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="4" y="6" width="40" height="8" rx="1" fill={c}/><line x1="4" y1="18" x2="44" y2="18" stroke={c2} strokeWidth="1"/><rect x="4" y="20" width="40" height="8" rx="1" fill={c2}/><line x1="4" y1="32" x2="44" y2="32" stroke={c2} strokeWidth="1"/><rect x="4" y="34" width="40" height="8" rx="1" fill={c}/></svg>);
    case "vertical-block-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="4" y="2" width="40" height="12" rx="2" fill={c}/><rect x="4" y="18" width="40" height="12" rx="2" fill={c2}/><rect x="4" y="34" width="40" height="12" rx="2" fill={c}/></svg>);
    case "horizontal-bullet-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="8" cy="12" r="4" fill={c}/><rect x="16" y="9" width="28" height="6" rx="1" fill={c2}/><circle cx="8" cy="24" r="4" fill={c}/><rect x="16" y="21" width="28" height="6" rx="1" fill={c2}/><circle cx="8" cy="36" r="4" fill={c}/><rect x="16" y="33" width="28" height="6" rx="1" fill={c2}/></svg>);
    case "stacked-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="6" y="4" width="36" height="10" rx="2" fill={c} opacity="0.9"/><rect x="4" y="16" width="40" height="10" rx="2" fill={c}/><rect x="6" y="28" width="36" height="10" rx="2" fill={c} opacity="0.9"/><rect x="8" y="40" width="32" height="6" rx="2" fill={c2}/></svg>);
    case "grouped-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="20" height="8" rx="1" fill={c}/><rect x="4" y="12" width="16" height="5" rx="1" fill={c2}/><rect x="4" y="19" width="16" height="5" rx="1" fill={c2}/><rect x="26" y="2" width="20" height="8" rx="1" fill={c}/><rect x="28" y="12" width="16" height="5" rx="1" fill={c2}/><rect x="28" y="19" width="16" height="5" rx="1" fill={c2}/><rect x="2" y="28" width="20" height="8" rx="1" fill={c}/><rect x="4" y="38" width="16" height="5" rx="1" fill={c2}/></svg>);
    case "trapezoid-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="8,6 40,6 44,18 4,18" fill={c}/><polygon points="6,20 42,20 44,32 4,32" fill={c2}/><polygon points="4,34 44,34 46,46 2,46" fill={c}/></svg>);
    case "table-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="2" fill="none" stroke={c} strokeWidth="1.5"/><line x1="2" y1="14" x2="46" y2="14" stroke={c} strokeWidth="1"/><line x1="2" y1="26" x2="46" y2="26" stroke={c} strokeWidth="1"/><line x1="2" y1="38" x2="46" y2="38" stroke={c} strokeWidth="1"/><line x1="24" y1="2" x2="24" y2="46" stroke={c} strokeWidth="1"/><rect x="2" y="2" width="44" height="12" rx="2" fill={c}/></svg>);
    case "target-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="34" cy="24" r="14" fill={c2}/><circle cx="34" cy="24" r="9" fill={c} opacity="0.7"/><circle cx="34" cy="24" r="4" fill={c}/><rect x="2" y="10" width="18" height="6" rx="1" fill={c}/><line x1="20" y1="13" x2="28" y2="20" stroke={c} strokeWidth="1"/><rect x="2" y="21" width="18" height="6" rx="1" fill={c2}/><line x1="20" y1="24" x2="25" y2="24" stroke={c2} strokeWidth="1"/><rect x="2" y="32" width="18" height="6" rx="1" fill={c}/><line x1="20" y1="35" x2="28" y2="28" stroke={c} strokeWidth="1"/></svg>);
    case "tab-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="12" width="44" height="34" rx="2" fill={c2} opacity="0.3"/><rect x="2" y="2" width="14" height="10" rx="2" fill={c}/><rect x="17" y="2" width="14" height="10" rx="2" fill={c2}/><rect x="32" y="2" width="14" height="10" rx="2" fill={c} opacity="0.6"/><rect x="6" y="18" width="36" height="4" rx="1" fill={c2}/><rect x="6" y="26" width="28" height="4" rx="1" fill={c2}/><rect x="6" y="34" width="32" height="4" rx="1" fill={c2}/></svg>);

    // ===== PROCESS =====
    case "basic-process":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="14" width="10" height="20" rx="2" fill={c}/><polygon points="15,24 19,20 19,28" fill={c}/><rect x="20" y="14" width="10" height="20" rx="2" fill={c2}/><polygon points="33,24 37,20 37,28" fill={c2}/><rect x="38" y="14" width="10" height="20" rx="2" fill={c}/></svg>);
    case "accent-process":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="12" width="12" height="24" rx="2" fill={c}/><rect x="2" y="12" width="3" height="24" rx="1" fill={c} opacity="0.5"/><line x1="17" y1="24" x2="19" y2="24" stroke={c} strokeWidth="2"/><rect x="20" y="12" width="12" height="24" rx="2" fill={c2}/><rect x="20" y="12" width="3" height="24" rx="1" fill={c2} opacity="0.5"/><line x1="35" y1="24" x2="37" y2="24" stroke={c2} strokeWidth="2"/><rect x="38" y="12" width="10" height="24" rx="2" fill={c}/></svg>);
    case "alternating-flow":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="4" width="12" height="12" rx="2" fill={c}/><line x1="14" y1="10" x2="18" y2="10" stroke={c} strokeWidth="1"/><line x1="18" y1="10" x2="18" y2="30" stroke={c} strokeWidth="1"/><rect x="18" y="26" width="12" height="12" rx="2" fill={c2}/><line x1="30" y1="32" x2="34" y2="32" stroke={c2} strokeWidth="1"/><line x1="34" y1="32" x2="34" y2="10" stroke={c2} strokeWidth="1"/><rect x="34" y="4" width="12" height="12" rx="2" fill={c}/></svg>);
    case "continuous-block":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="14" width="44" height="20" rx="3" fill={c2} opacity="0.3"/><rect x="4" y="16" width="12" height="16" rx="2" fill={c}/><rect x="18" y="16" width="12" height="16" rx="2" fill={c2}/><rect x="32" y="16" width="12" height="16" rx="2" fill={c}/></svg>);
    case "chevron-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="2,12 12,12 16,24 12,36 2,36" fill={c}/><polygon points="16,12 28,12 32,24 28,36 16,36 20,24" fill={c2}/><polygon points="32,12 46,12 46,36 32,36 36,24" fill={c}/></svg>);
    case "upward-arrow":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="24,2 36,18 28,18 28,46 20,46 20,18 12,18" fill={c}/><rect x="16" y="30" width="16" height="5" rx="1" fill={c2}/><rect x="16" y="37" width="16" height="5" rx="1" fill={c} opacity="0.6"/></svg>);
    case "repeating-bending":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="4" width="10" height="10" rx="2" fill={c}/><line x1="12" y1="9" x2="18" y2="9" stroke={c} strokeWidth="1.5"/><rect x="18" y="4" width="10" height="10" rx="2" fill={c2}/><line x1="28" y1="9" x2="36" y2="9" stroke={c2} strokeWidth="1.5"/><line x1="36" y1="9" x2="36" y2="22" stroke={c2} strokeWidth="1.5"/><rect x="28" y="20" width="10" height="10" rx="2" fill={c}/><line x1="28" y1="25" x2="22" y2="25" stroke={c} strokeWidth="1.5"/><rect x="12" y="20" width="10" height="10" rx="2" fill={c2}/><line x1="12" y1="25" x2="6" y2="25" stroke={c2} strokeWidth="1.5"/><line x1="6" y1="25" x2="6" y2="38" stroke={c2} strokeWidth="1.5"/><rect x="2" y="36" width="10" height="10" rx="2" fill={c}/></svg>);
    case "step-down":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="4" width="14" height="10" rx="2" fill={c}/><rect x="16" y="16" width="14" height="10" rx="2" fill={c2}/><rect x="30" y="28" width="14" height="10" rx="2" fill={c}/><line x1="16" y1="14" x2="16" y2="16" stroke={c} strokeWidth="1.5"/><line x1="30" y1="26" x2="30" y2="28" stroke={c2} strokeWidth="1.5"/></svg>);
    case "gear-process":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="12" cy="20" r="8" fill={c} stroke={c} strokeWidth="2"/><rect x="8" y="16" width="8" height="8" rx="1" fill={c}/><circle cx="12" cy="20" r="3" fill="white"/><circle cx="28" cy="28" r="7" fill={c2} stroke={c2} strokeWidth="2"/><circle cx="28" cy="28" r="2.5" fill="white"/><circle cx="40" cy="18" r="6" fill={c} stroke={c} strokeWidth="2"/><circle cx="40" cy="18" r="2" fill="white"/></svg>);
    case "funnel-process":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="4,6 44,6 36,18 12,18" fill={c}/><polygon points="12,20 36,20 32,32 16,32" fill={c2}/><polygon points="16,34 32,34 28,46 20,46" fill={c}/></svg>);

    // ===== CYCLE =====
    case "basic-cycle":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="8" r="6" fill={c}/><circle cx="39" cy="20" r="6" fill={c2}/><circle cx="34" cy="38" r="6" fill={c}/><circle cx="14" cy="38" r="6" fill={c2}/><circle cx="9" cy="20" r="6" fill={c}/><path d="M30,8 L35,14" stroke={c} strokeWidth="1.5" fill="none" markerEnd="url(#arrow)"/><path d="M39,26 L36,32" stroke={c2} strokeWidth="1.5" fill="none"/><path d="M28,38 L20,38" stroke={c} strokeWidth="1.5" fill="none"/><path d="M10,32 L9,26" stroke={c2} strokeWidth="1.5" fill="none"/><path d="M13,14 L18,8" stroke={c} strokeWidth="1.5" fill="none"/></svg>);
    case "text-cycle":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke={c2} strokeWidth="2" strokeDasharray="4,3"/><rect x="14" y="2" width="20" height="8" rx="2" fill={c}/><rect x="34" y="30" width="14" height="8" rx="2" fill={c2}/><rect x="0" y="30" width="14" height="8" rx="2" fill={c}/></svg>);
    case "block-cycle":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="16" y="2" width="16" height="10" rx="2" fill={c}/><rect x="34" y="14" width="12" height="10" rx="2" fill={c2}/><rect x="30" y="34" width="16" height="10" rx="2" fill={c}/><rect x="2" y="34" width="16" height="10" rx="2" fill={c2}/><rect x="2" y="14" width="12" height="10" rx="2" fill={c}/><polygon points="32,7 36,10 32,13" fill={c2}/><polygon points="44,26 41,30 38,26" fill={c}/><polygon points="28,39 22,39 25,36" fill={c2}/><polygon points="10,30 7,26 4,30" fill={c}/><polygon points="12,13 16,10 12,7" fill={c2}/></svg>);
    case "nondirectional-cycle":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="none" stroke={c2} strokeWidth="3"/><circle cx="24" cy="6" r="5" fill={c}/><circle cx="40" cy="30" r="5" fill={c2}/><circle cx="8" cy="30" r="5" fill={c}/></svg>);
    case "continuous-cycle":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><path d="M24,6 A18,18 0 1,1 6,24" fill="none" stroke={c} strokeWidth="4"/><path d="M6,24 A18,18 0 0,1 24,6" fill="none" stroke={c2} strokeWidth="4"/><polygon points="24,2 28,8 20,8" fill={c}/></svg>);
    case "segmented-cycle":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><path d="M24,24 L24,6 A18,18 0 0,1 39,34 Z" fill={c}/><path d="M24,24 L39,34 A18,18 0 0,1 9,34 Z" fill={c2}/><path d="M24,24 L9,34 A18,18 0 0,1 24,6 Z" fill={c} opacity="0.6"/></svg>);
    case "gear-cycle":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="16" cy="20" r="10" fill={c}/><circle cx="16" cy="20" r="4" fill="white"/><circle cx="34" cy="20" r="8" fill={c2}/><circle cx="34" cy="20" r="3" fill="white"/><circle cx="24" cy="36" r="7" fill={c} opacity="0.7"/><circle cx="24" cy="36" r="2.5" fill="white"/></svg>);
    case "radial-cycle":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="24" r="8" fill={c}/><circle cx="24" cy="6" r="5" fill={c2}/><circle cx="40" cy="18" r="5" fill={c2}/><circle cx="40" cy="34" r="5" fill={c2}/><circle cx="24" cy="42" r="5" fill={c2}/><circle cx="8" cy="34" r="5" fill={c2}/><circle cx="8" cy="18" r="5" fill={c2}/><line x1="24" y1="16" x2="24" y2="11" stroke={c} strokeWidth="1.5"/><line x1="30" y1="19" x2="35" y2="18" stroke={c} strokeWidth="1.5"/><line x1="30" y1="29" x2="35" y2="34" stroke={c} strokeWidth="1.5"/><line x1="24" y1="32" x2="24" y2="37" stroke={c} strokeWidth="1.5"/><line x1="18" y1="29" x2="13" y2="34" stroke={c} strokeWidth="1.5"/><line x1="18" y1="19" x2="13" y2="18" stroke={c} strokeWidth="1.5"/></svg>);
    case "multidirectional-cycle":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="none" stroke={c2} strokeWidth="2"/><polygon points="24,2 28,8 20,8" fill={c}/><polygon points="42,24 36,28 36,20" fill={c}/><polygon points="24,46 20,40 28,40" fill={c}/><polygon points="6,24 12,20 12,28" fill={c}/><circle cx="24" cy="6" r="4" fill={c}/><circle cx="42" cy="24" r="4" fill={c2}/><circle cx="24" cy="42" r="4" fill={c}/><circle cx="6" cy="24" r="4" fill={c2}/></svg>);
    case "diverging-radial":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="24" r="10" fill={c}/><line x1="24" y1="14" x2="24" y2="6" stroke={c} strokeWidth="2"/><line x1="32" y1="18" x2="40" y2="10" stroke={c} strokeWidth="2"/><line x1="34" y1="24" x2="42" y2="24" stroke={c} strokeWidth="2"/><line x1="32" y1="30" x2="40" y2="38" stroke={c} strokeWidth="2"/><line x1="24" y1="34" x2="24" y2="42" stroke={c} strokeWidth="2"/><line x1="16" y1="30" x2="8" y2="38" stroke={c} strokeWidth="2"/><line x1="14" y1="24" x2="6" y2="24" stroke={c} strokeWidth="2"/><line x1="16" y1="18" x2="8" y2="10" stroke={c} strokeWidth="2"/></svg>);

    // ===== HIERARCHY =====
    case "org-chart":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="17" y="2" width="14" height="10" rx="2" fill={c}/><line x1="24" y1="12" x2="24" y2="16" stroke={c} strokeWidth="1.5"/><line x1="8" y1="16" x2="40" y2="16" stroke={c} strokeWidth="1.5"/><line x1="8" y1="16" x2="8" y2="20" stroke={c} strokeWidth="1.5"/><line x1="24" y1="16" x2="24" y2="20" stroke={c} strokeWidth="1.5"/><line x1="40" y1="16" x2="40" y2="20" stroke={c} strokeWidth="1.5"/><rect x="2" y="20" width="12" height="8" rx="1" fill={c2}/><rect x="18" y="20" width="12" height="8" rx="1" fill={c2}/><rect x="34" y="20" width="12" height="8" rx="1" fill={c2}/><line x1="8" y1="28" x2="8" y2="32" stroke={c2} strokeWidth="1"/><rect x="2" y="32" width="12" height="6" rx="1" fill={c} opacity="0.5"/><line x1="24" y1="28" x2="24" y2="32" stroke={c2} strokeWidth="1"/><rect x="18" y="32" width="12" height="6" rx="1" fill={c} opacity="0.5"/></svg>);
    case "hierarchy-tree":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="18" y="2" width="12" height="8" rx="2" fill={c}/><line x1="24" y1="10" x2="24" y2="14" stroke={c} strokeWidth="1.5"/><line x1="12" y1="14" x2="36" y2="14" stroke={c} strokeWidth="1.5"/><rect x="4" y="16" width="12" height="8" rx="1" fill={c2}/><rect x="32" y="16" width="12" height="8" rx="1" fill={c2}/><line x1="10" y1="24" x2="10" y2="28" stroke={c2} strokeWidth="1"/><rect x="2" y="28" width="8" height="6" rx="1" fill={c} opacity="0.5"/><rect x="12" y="28" width="8" height="6" rx="1" fill={c} opacity="0.5"/><line x1="38" y1="24" x2="38" y2="28" stroke={c2} strokeWidth="1"/><rect x="30" y="28" width="8" height="6" rx="1" fill={c} opacity="0.5"/><rect x="40" y="28" width="8" height="6" rx="1" fill={c} opacity="0.5"/></svg>);
    case "horizontal-hierarchy":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="18" width="10" height="12" rx="2" fill={c}/><line x1="12" y1="24" x2="16" y2="24" stroke={c} strokeWidth="1.5"/><line x1="16" y1="12" x2="16" y2="36" stroke={c} strokeWidth="1.5"/><rect x="18" y="6" width="10" height="10" rx="1" fill={c2}/><rect x="18" y="19" width="10" height="10" rx="1" fill={c2}/><rect x="18" y="32" width="10" height="10" rx="1" fill={c2}/><line x1="28" y1="11" x2="34" y2="11" stroke={c2} strokeWidth="1"/><rect x="34" y="6" width="10" height="10" rx="1" fill={c} opacity="0.5"/></svg>);
    case "labeled-hierarchy":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="4" width="44" height="8" rx="2" fill={c}/><rect x="6" y="16" width="36" height="6" rx="1" fill={c2}/><rect x="10" y="26" width="28" height="6" rx="1" fill={c} opacity="0.6"/><rect x="14" y="36" width="20" height="6" rx="1" fill={c2}/></svg>);
    case "table-hierarchy":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="10" rx="2" fill={c}/><rect x="2" y="14" width="20" height="14" rx="1" fill={c2}/><rect x="26" y="14" width="20" height="14" rx="1" fill={c2}/><rect x="2" y="30" width="20" height="14" rx="1" fill={c} opacity="0.5"/><rect x="26" y="30" width="20" height="14" rx="1" fill={c} opacity="0.5"/></svg>);
    case "half-circle-org":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><path d="M6,40 A20,20 0 0,1 42,40" fill="none" stroke={c2} strokeWidth="2"/><circle cx="24" cy="40" r="5" fill={c}/><circle cx="10" cy="28" r="4" fill={c2}/><circle cx="24" cy="22" r="4" fill={c2}/><circle cx="38" cy="28" r="4" fill={c2}/><line x1="24" y1="35" x2="10" y2="32" stroke={c} strokeWidth="1"/><line x1="24" y1="35" x2="24" y2="26" stroke={c} strokeWidth="1"/><line x1="24" y1="35" x2="38" y2="32" stroke={c} strokeWidth="1"/></svg>);
    case "horizontal-org":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="18" width="12" height="12" rx="2" fill={c}/><line x1="14" y1="24" x2="20" y2="24" stroke={c} strokeWidth="1.5"/><line x1="20" y1="10" x2="20" y2="38" stroke={c} strokeWidth="1.5"/><rect x="22" y="4" width="10" height="10" rx="1" fill={c2}/><rect x="22" y="19" width="10" height="10" rx="1" fill={c2}/><rect x="22" y="34" width="10" height="10" rx="1" fill={c2}/></svg>);
    case "bracket-hierarchy":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="16" width="12" height="16" rx="2" fill={c}/><path d="M14,24 Q20,24 20,10 L20,8" fill="none" stroke={c} strokeWidth="1.5"/><path d="M14,24 Q20,24 20,38 L20,40" fill="none" stroke={c} strokeWidth="1.5"/><rect x="22" y="4" width="12" height="10" rx="1" fill={c2}/><rect x="22" y="34" width="12" height="10" rx="1" fill={c2}/><path d="M34,9 Q38,9 38,4" fill="none" stroke={c2} strokeWidth="1"/><path d="M34,9 Q38,9 38,14" fill="none" stroke={c2} strokeWidth="1"/><rect x="38" y="1" width="8" height="6" rx="1" fill={c} opacity="0.5"/><rect x="38" y="12" width="8" height="6" rx="1" fill={c} opacity="0.5"/></svg>);
    case "lined-hierarchy":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="16" y="2" width="16" height="8" rx="2" fill={c}/><line x1="24" y1="10" x2="24" y2="16" stroke={c} strokeWidth="2"/><rect x="4" y="16" width="14" height="8" rx="1" fill={c2}/><rect x="30" y="16" width="14" height="8" rx="1" fill={c2}/><line x1="11" y1="24" x2="11" y2="30" stroke={c2} strokeWidth="2"/><line x1="37" y1="24" x2="37" y2="30" stroke={c2} strokeWidth="2"/><rect x="2" y="30" width="8" height="6" rx="1" fill={c} opacity="0.5"/><rect x="12" y="30" width="8" height="6" rx="1" fill={c} opacity="0.5"/><rect x="28" y="30" width="8" height="6" rx="1" fill={c} opacity="0.5"/><rect x="38" y="30" width="8" height="6" rx="1" fill={c} opacity="0.5"/></svg>);
    case "circle-hierarchy":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill={c2} opacity="0.3"/><circle cx="24" cy="24" r="14" fill={c2} opacity="0.5"/><circle cx="24" cy="24" r="6" fill={c}/></svg>);

    // ===== RELATIONSHIP =====
    case "basic-venn":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="18" cy="24" r="14" fill={c} opacity="0.4"/><circle cx="30" cy="24" r="14" fill={c2} opacity="0.4"/></svg>);
    case "linear-venn":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="12" cy="24" r="10" fill={c} opacity="0.4"/><circle cx="24" cy="24" r="10" fill={c2} opacity="0.4"/><circle cx="36" cy="24" r="10" fill={c} opacity="0.4"/></svg>);
    case "nested-target":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill={c2} opacity="0.3"/><circle cx="24" cy="24" r="14" fill={c} opacity="0.4"/><circle cx="24" cy="24" r="8" fill={c}/></svg>);
    case "converging-arrows":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="18" y="18" width="12" height="12" rx="2" fill={c}/><line x1="6" y1="6" x2="18" y2="18" stroke={c2} strokeWidth="2"/><line x1="42" y1="6" x2="30" y2="18" stroke={c2} strokeWidth="2"/><line x1="6" y1="42" x2="18" y2="30" stroke={c2} strokeWidth="2"/><line x1="42" y1="42" x2="30" y2="30" stroke={c2} strokeWidth="2"/><circle cx="6" cy="6" r="4" fill={c2}/><circle cx="42" cy="6" r="4" fill={c2}/><circle cx="6" cy="42" r="4" fill={c2}/><circle cx="42" cy="42" r="4" fill={c2}/></svg>);
    case "diverging-arrows":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="24" r="8" fill={c}/><line x1="24" y1="16" x2="24" y2="4" stroke={c2} strokeWidth="2"/><line x1="32" y1="24" x2="44" y2="24" stroke={c2} strokeWidth="2"/><line x1="24" y1="32" x2="24" y2="44" stroke={c2} strokeWidth="2"/><line x1="16" y1="24" x2="4" y2="24" stroke={c2} strokeWidth="2"/><polygon points="24,2 22,6 26,6" fill={c2}/><polygon points="46,24 42,22 42,26" fill={c2}/><polygon points="24,46 22,42 26,42" fill={c2}/><polygon points="2,24 6,22 6,26" fill={c2}/></svg>);
    case "balance":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><line x1="24" y1="6" x2="24" y2="42" stroke={c} strokeWidth="2"/><polygon points="24,6 4,24 44,24" fill="none" stroke={c} strokeWidth="1.5"/><rect x="4" y="24" width="16" height="14" rx="2" fill={c}/><rect x="28" y="24" width="16" height="14" rx="2" fill={c2}/><rect x="18" y="40" width="12" height="6" rx="2" fill={c} opacity="0.5"/></svg>);
    case "funnel-relationship":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><ellipse cx="24" cy="8" rx="20" ry="6" fill={c2}/><polygon points="4,8 20,42 28,42 44,8" fill={c} opacity="0.6"/><ellipse cx="24" cy="8" rx="20" ry="6" fill="none" stroke={c} strokeWidth="1.5"/></svg>);
    case "opposing-arrows":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="2,24 16,14 16,20 32,20 32,14 46,24 32,34 32,28 16,28 16,34" fill="none" stroke={c} strokeWidth="1.5"/><rect x="2" y="18" width="14" height="12" rx="2" fill={c}/><rect x="32" y="18" width="14" height="12" rx="2" fill={c2}/></svg>);
    case "arrow-ribbon":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><path d="M4,12 L36,12 L44,24 L36,36 L4,36 Z" fill={c} opacity="0.5"/><path d="M4,16 L32,16 L38,24 L32,32 L4,32 Z" fill={c}/></svg>);
    case "equation":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="10" cy="24" r="8" fill={c}/><text x="22" y="28" fill={c} fontSize="14" fontWeight="bold">+</text><circle cx="34" cy="24" r="8" fill={c2}/><line x1="4" y1="40" x2="44" y2="40" stroke={c} strokeWidth="2"/><rect x="14" y="42" width="20" height="6" rx="2" fill={c}/></svg>);

    // ===== MATRIX =====
    case "basic-matrix":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="20" height="20" rx="2" fill={c}/><rect x="26" y="2" width="20" height="20" rx="2" fill={c2}/><rect x="2" y="26" width="20" height="20" rx="2" fill={c2}/><rect x="26" y="26" width="20" height="20" rx="2" fill={c}/></svg>);
    case "titled-matrix":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="8" rx="2" fill={c}/><rect x="2" y="14" width="20" height="14" rx="1" fill={c2}/><rect x="26" y="14" width="20" height="14" rx="1" fill={c2}/><rect x="2" y="32" width="20" height="14" rx="1" fill={c} opacity="0.5"/><rect x="26" y="32" width="20" height="14" rx="1" fill={c} opacity="0.5"/></svg>);
    case "grid-matrix":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="13" height="13" rx="1" fill={c}/><rect x="17" y="2" width="14" height="13" rx="1" fill={c2}/><rect x="33" y="2" width="13" height="13" rx="1" fill={c}/><rect x="2" y="17" width="13" height="14" rx="1" fill={c2}/><rect x="17" y="17" width="14" height="14" rx="1" fill={c}/><rect x="33" y="17" width="13" height="14" rx="1" fill={c2}/><rect x="2" y="33" width="13" height="13" rx="1" fill={c}/><rect x="17" y="33" width="14" height="13" rx="1" fill={c2}/><rect x="33" y="33" width="13" height="13" rx="1" fill={c}/></svg>);
    case "l-shaped-matrix":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="12" height="44" rx="2" fill={c}/><rect x="2" y="34" width="44" height="12" rx="2" fill={c}/><rect x="16" y="2" width="14" height="14" rx="1" fill={c2}/><rect x="32" y="2" width="14" height="14" rx="1" fill={c2}/><rect x="16" y="18" width="14" height="14" rx="1" fill={c2}/><rect x="32" y="18" width="14" height="14" rx="1" fill={c2}/></svg>);
    case "cycle-matrix":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="18" height="18" rx="2" fill={c}/><rect x="28" y="2" width="18" height="18" rx="2" fill={c2}/><rect x="2" y="28" width="18" height="18" rx="2" fill={c2}/><rect x="28" y="28" width="18" height="18" rx="2" fill={c}/><circle cx="24" cy="24" r="8" fill="white" stroke={c} strokeWidth="1.5"/><path d="M20,24 A4,4 0 1,1 28,24" fill="none" stroke={c} strokeWidth="1.5"/><polygon points="28,24 26,21 30,22" fill={c}/></svg>);
    case "quadrant-matrix":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><line x1="24" y1="2" x2="24" y2="46" stroke={c} strokeWidth="2"/><line x1="2" y1="24" x2="46" y2="24" stroke={c} strokeWidth="2"/><circle cx="14" cy="12" r="4" fill={c}/><circle cx="36" cy="10" r="5" fill={c2}/><circle cx="10" cy="36" r="3" fill={c2}/><circle cx="38" cy="34" r="6" fill={c}/></svg>);
    case "swot-matrix":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="20" height="20" rx="2" fill="#70AD47"/><rect x="26" y="2" width="20" height="20" rx="2" fill="#ED7D31"/><rect x="2" y="26" width="20" height="20" rx="2" fill="#4472C4"/><rect x="26" y="26" width="20" height="20" rx="2" fill="#FF4444"/><text x="12" y="14" fill="white" fontSize="6" textAnchor="middle" fontWeight="bold">S</text><text x="36" y="14" fill="white" fontSize="6" textAnchor="middle" fontWeight="bold">W</text><text x="12" y="38" fill="white" fontSize="6" textAnchor="middle" fontWeight="bold">O</text><text x="36" y="38" fill="white" fontSize="6" textAnchor="middle" fontWeight="bold">T</text></svg>);
    case "priority-matrix":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="20" height="20" rx="2" fill="#FF4444"/><rect x="26" y="2" width="20" height="20" rx="2" fill="#FFC000"/><rect x="2" y="26" width="20" height="20" rx="2" fill="#FFC000"/><rect x="26" y="26" width="20" height="20" rx="2" fill="#70AD47"/><text x="12" y="14" fill="white" fontSize="5" textAnchor="middle">HIGH</text><text x="36" y="14" fill="white" fontSize="5" textAnchor="middle">MED</text><text x="12" y="38" fill="white" fontSize="5" textAnchor="middle">MED</text><text x="36" y="38" fill="white" fontSize="5" textAnchor="middle">LOW</text></svg>);

    // ===== PYRAMID =====
    case "basic-pyramid":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="24,4 6,44 42,44" fill={c}/><line x1="12" y1="24" x2="36" y2="24" stroke="white" strokeWidth="1"/><line x1="9" y1="34" x2="39" y2="34" stroke="white" strokeWidth="1"/></svg>);
    case "inverted-pyramid":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="24,44 6,4 42,4" fill={c}/><line x1="12" y1="24" x2="36" y2="24" stroke="white" strokeWidth="1"/><line x1="9" y1="14" x2="39" y2="14" stroke="white" strokeWidth="1"/></svg>);
    case "segmented-pyramid":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="24,4 18,18 30,18" fill={c}/><polygon points="18,20 12,34 36,34 30,20" fill={c2}/><polygon points="12,36 6,46 42,46 36,36" fill={c} opacity="0.6"/></svg>);
    case "pyramid-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="16,4 4,44 28,44" fill={c}/><line x1="8" y1="24" x2="24" y2="24" stroke="white" strokeWidth="1"/><line x1="6" y1="34" x2="26" y2="34" stroke="white" strokeWidth="1"/><rect x="32" y="8" width="14" height="6" rx="1" fill={c2}/><rect x="32" y="20" width="14" height="6" rx="1" fill={c2}/><rect x="32" y="32" width="14" height="6" rx="1" fill={c2}/></svg>);
    case "stacked-pyramid":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="24,6 16,16 32,16" fill={c}/><polygon points="16,18 32,18 36,28 12,28" fill={c} opacity="0.8"/><polygon points="12,30 36,30 40,40 8,40" fill={c} opacity="0.6"/><polygon points="8,42 40,42 44,46 4,46" fill={c2}/></svg>);
    case "triangle-cluster":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><polygon points="24,2 14,18 34,18" fill={c}/><polygon points="14,22 4,38 24,38" fill={c2}/><polygon points="34,22 24,38 44,38" fill={c} opacity="0.7"/></svg>);
    case "layered-pyramid":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="16" y="4" width="16" height="8" rx="2" fill={c}/><rect x="10" y="16" width="28" height="8" rx="2" fill={c2}/><rect x="4" y="28" width="40" height="8" rx="2" fill={c} opacity="0.7"/><rect x="2" y="40" width="44" height="6" rx="2" fill={c2}/></svg>);
    case "funnel-pyramid":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><ellipse cx="24" cy="8" rx="20" ry="5" fill={c}/><polygon points="4,8 18,44 30,44 44,8" fill={c} opacity="0.5"/><line x1="10" y1="20" x2="38" y2="20" stroke="white" strokeWidth="1"/><line x1="14" y1="32" x2="34" y2="32" stroke="white" strokeWidth="1"/></svg>);

    // ===== PICTURE =====
    case "picture-strips":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="4" width="12" height="40" rx="2" fill={c2} opacity="0.3"/><circle cx="8" cy="14" r="5" fill={c}/><rect x="4" y="24" width="8" height="3" rx="1" fill={c2}/><rect x="18" y="4" width="12" height="40" rx="2" fill={c2} opacity="0.3"/><circle cx="24" cy="14" r="5" fill={c}/><rect x="20" y="24" width="8" height="3" rx="1" fill={c2}/><rect x="34" y="4" width="12" height="40" rx="2" fill={c2} opacity="0.3"/><circle cx="40" cy="14" r="5" fill={c}/><rect x="36" y="24" width="8" height="3" rx="1" fill={c2}/></svg>);
    case "picture-accent-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="10" cy="12" r="7" fill={c2}/><rect x="22" y="6" width="24" height="12" rx="2" fill={c}/><circle cx="10" cy="36" r="7" fill={c2}/><rect x="22" y="30" width="24" height="12" rx="2" fill={c}/></svg>);
    case "picture-caption-list":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="12" height="12" rx="2" fill={c2}/><rect x="2" y="16" width="12" height="4" rx="1" fill={c}/><rect x="18" y="2" width="12" height="12" rx="2" fill={c2}/><rect x="18" y="16" width="12" height="4" rx="1" fill={c}/><rect x="34" y="2" width="12" height="12" rx="2" fill={c2}/><rect x="34" y="16" width="12" height="4" rx="1" fill={c}/></svg>);
    case "picture-grid":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="2" y="2" width="20" height="20" rx="2" fill={c2}/><rect x="26" y="2" width="20" height="20" rx="2" fill={c2}/><rect x="2" y="26" width="20" height="20" rx="2" fill={c2}/><rect x="26" y="26" width="20" height="20" rx="2" fill={c2}/><circle cx="12" cy="12" r="4" fill={c}/><circle cx="36" cy="12" r="4" fill={c}/><circle cx="12" cy="36" r="4" fill={c}/><circle cx="36" cy="36" r="4" fill={c}/></svg>);
    case "framed-picture":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="28" rx="2" fill="none" stroke={c} strokeWidth="2"/><circle cx="24" cy="16" r="6" fill={c2}/><polygon points="10,28 24,18 38,28" fill={c2} opacity="0.5"/><rect x="4" y="34" width="40" height="10" rx="2" fill={c}/></svg>);
    case "circular-picture":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="24" cy="18" r="14" fill={c2}/><circle cx="24" cy="18" r="10" fill={c} opacity="0.3"/><rect x="8" y="36" width="32" height="8" rx="2" fill={c}/></svg>);
    case "snapshot-picture":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="4" y="6" width="16" height="16" rx="1" fill={c2} transform="rotate(-5,12,14)"/><rect x="6" y="8" width="16" height="16" rx="1" fill={c2} transform="rotate(3,14,16)"/><rect x="8" y="10" width="16" height="16" rx="1" fill={c2}/><circle cx="16" cy="16" r="4" fill={c}/><rect x="30" y="10" width="14" height="4" rx="1" fill={c}/><rect x="30" y="18" width="14" height="3" rx="1" fill={c2}/><rect x="30" y="24" width="14" height="3" rx="1" fill={c2}/></svg>);
    case "bubble-picture":
      return (<svg width={s} height={s} viewBox="0 0 48 48"><circle cx="12" cy="14" r="10" fill={c2} opacity="0.3"/><circle cx="12" cy="14" r="6" fill={c}/><circle cx="36" cy="14" r="10" fill={c2} opacity="0.3"/><circle cx="36" cy="14" r="6" fill={c}/><circle cx="24" cy="36" r="10" fill={c2} opacity="0.3"/><circle cx="24" cy="36" r="6" fill={c}/></svg>);

    default:
      return (<svg width={s} height={s} viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill={c2} opacity="0.3"/><rect x="12" y="12" width="24" height="24" rx="2" fill={c}/></svg>);
  }
}
