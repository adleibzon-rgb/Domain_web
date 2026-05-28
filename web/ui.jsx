// Shared UI primitives — Apple-inspired light system

const { useState, useEffect, useRef, useMemo } = React;

// ───────── Icons (line, 1.6 stroke, rounded) ─────────
function Icon({ name, size = 18, stroke = 1.6, color = "currentColor" }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "server":   return (<svg {...props}><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><circle cx="7" cy="7.5" r=".6" fill={color}/><circle cx="7" cy="16.5" r=".6" fill={color}/></svg>);
    case "users":    return (<svg {...props}><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 11.5a3 3 0 0 0 0-6"/><path d="M21 20c0-2.5-1.8-4.6-4.2-5"/></svg>);
    case "settings": return (<svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>);
    case "link":     return (<svg {...props}><path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07L11.5 5.5"/><path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07L12.5 18.5"/></svg>);
    case "lock":     return (<svg {...props}><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>);
    case "tools":    return (<svg {...props}><path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.7a8 8 0 0 1-9.4 1.4l-6.3 6.3a2.1 2.1 0 1 1-3-3l6.3-6.3A8 8 0 0 1 10 1.7L11.3 3a4 4 0 0 0 3.4 3.3z"/></svg>);
    case "gauge":    return (<svg {...props}><path d="M12 14l4-4"/><circle cx="12" cy="14" r="9"/><path d="M3 14a9 9 0 0 1 18 0"/></svg>);
    case "check":    return (<svg {...props}><polyline points="4 12 10 18 20 6"/></svg>);
    case "plus":     return (<svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
    case "chevron-down": return (<svg {...props}><polyline points="6 9 12 15 18 9"/></svg>);
    case "chevron-right": return (<svg {...props}><polyline points="9 6 15 12 9 18"/></svg>);
    case "back":     return (<svg {...props}><line x1="20" y1="12" x2="4" y2="12"/><polyline points="10 18 4 12 10 6"/></svg>);
    case "trash":    return (<svg {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>);
    case "config":   return (<svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>);
    case "stop":     return (<svg {...props}><rect x="6" y="6" width="12" height="12" rx="2"/></svg>);
    case "play":     return (<svg {...props}><polygon points="6 4 20 12 6 20 6 4"/></svg>);
    case "qr":       return (<svg {...props}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v1"/></svg>);
    case "calendar": return (<svg {...props}><rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>);
    case "clock":    return (<svg {...props}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>);
    case "download": return (<svg {...props}><path d="M12 4v12"/><polyline points="7 11 12 16 17 11"/><path d="M5 20h14"/></svg>);
    case "upload":   return (<svg {...props}><path d="M12 20V8"/><polyline points="7 13 12 8 17 13"/><path d="M5 4h14"/></svg>);
    case "cpu":      return (<svg {...props}><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M10 2v3M14 2v3M10 19v3M14 19v3M2 10h3M2 14h3M19 10h3M19 14h3"/></svg>);
    case "ram":      return (<svg {...props}><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7v10M11 7v10M15 7v10M19 7v10"/></svg>);
    case "disk":     return (<svg {...props}><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill={color}/></svg>);
    case "globe":    return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>);
    case "refresh":  return (<svg {...props}><polyline points="20 4 20 10 14 10"/><polyline points="4 20 4 14 10 14"/><path d="M20 10a8 8 0 0 0-14.9-2"/><path d="M4 14a8 8 0 0 0 14.9 2"/></svg>);
    case "logout":   return (<svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
    case "sun":      return (<svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></svg>);
    case "moon":     return (<svg {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>);
    case "key":      return (<svg {...props}><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/></svg>);
    case "sparkles": return (<svg {...props}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7z"/></svg>);
    case "satellite":return (<svg {...props}><path d="M5 19l5-5"/><path d="M14 4l6 6-5 5-6-6z"/><path d="M9 9l-3 3 3 3 3-3"/><path d="M17 17a4 4 0 0 0-4-4"/><path d="M20 17a7 7 0 0 0-7-7"/></svg>);
    case "bolt":     return (<svg {...props}><polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/></svg>);
    case "plane":    return (<svg {...props}><path d="M21 14l-7-1-3 8-2-1 1-7-7-3 8-3-1-6 2-1 3 7 7-1 1 2-6 3 4 5z"/></svg>);
    case "shield":   return (<svg {...props}><path d="M12 3l8 3v6c0 4.5-3.3 8.7-8 9-4.7-.3-8-4.5-8-9V6z"/></svg>);
    case "wand":     return (<svg {...props}><path d="M3 21l14-14"/><path d="M17 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="M5 7l.6 1.4L7 9l-1.4.6L5 11l-.6-1.4L3 9l1.4-.6z"/></svg>);
    case "brain":    return (<svg {...props}><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.7 3 3 0 0 0 1 4.6A3 3 0 0 0 9 20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5.7 3 3 0 0 1-1 4.6 3 3 0 0 1-3 2.7 2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>);
    case "star":     return (<svg {...props}><polygon points="12 3 14.5 9 21 9.5 16 14 17.5 21 12 17.5 6.5 21 8 14 3 9.5 9.5 9"/></svg>);
    case "github":   return (<svg {...props}><path d="M9 19c-4 1.5-4-2-6-2.5M15 22v-3.9a3.4 3.4 0 0 0-.9-2.6c3 0 6-2 6-5.5a4.3 4.3 0 0 0-1.2-3 4 4 0 0 0-.1-3.1S17.2 3 15 4.4a13 13 0 0 0-7 0C5.8 3 4.7 3.4 4.7 3.4a4 4 0 0 0-.1 3.1A4.3 4.3 0 0 0 3.5 9.5C3.5 13 6.5 15 9.5 15a3.4 3.4 0 0 0-.9 2.6V22"/></svg>);
    case "doc":      return (<svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>);
    case "edit":     return (<svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>);
    case "more":     return (<svg {...props}><circle cx="5" cy="12" r="1.3" fill={color}/><circle cx="12" cy="12" r="1.3" fill={color}/><circle cx="19" cy="12" r="1.3" fill={color}/></svg>);
    case "search":   return (<svg {...props}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>);
    case "heart":    return (<svg {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>);
    case "qr-scan":  return (<svg {...props}><path d="M4 8V5a1 1 0 0 1 1-1h3"/><path d="M16 4h3a1 1 0 0 1 1 1v3"/><path d="M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M8 20H5a1 1 0 0 1-1-1v-3"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>);
    case "clipboard":return (<svg {...props}><rect x="6" y="4" width="12" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/></svg>);
    default: return null;
  }
}

// ───────── Buttons ─────────
function Button({ children, variant = "primary", size = "md", icon, iconRight, onClick, type, disabled, style, full }) {
  const sizes = {
    sm: { h: 30, px: 12, fs: 13, gap: 6, r: 10 },
    md: { h: 38, px: 16, fs: 14, gap: 8, r: 12 },
    lg: { h: 46, px: 22, fs: 15, gap: 10, r: 14 },
  }[size];
  const variants = {
    primary: { bg: "var(--accent)", color: "#fff", border: "transparent",
      shadow:"0 1px 0 rgba(255,255,255,.18) inset, 0 6px 16px rgba(124,92,255,.35)" },
    primaryGrad: { bg: "linear-gradient(180deg, #8a6cff, #6a44f5)", color:"#fff", border:"transparent",
      shadow:"0 1px 0 rgba(255,255,255,.22) inset, 0 8px 22px rgba(106,68,245,.35)" },
    secondary: { bg: "#fff", color:"var(--ink)", border: "var(--line)",
      shadow:"0 1px 0 rgba(255,255,255,.6) inset, 0 1px 1px rgba(16,24,40,.04), 0 3px 8px rgba(16,24,40,.05)" },
    ghost: { bg: "transparent", color:"var(--ink-2)", border:"transparent", shadow:"none" },
    danger: { bg: "#fff", color:"var(--red)", border:"rgba(255,59,48,.22)",
      shadow:"0 1px 1px rgba(16,24,40,.03)" },
    dangerSolid:{ bg:"var(--red)", color:"#fff", border:"transparent",
      shadow:"0 1px 0 rgba(255,255,255,.18) inset, 0 6px 14px rgba(255,59,48,.3)" },
    success: { bg:"#fff", color:"var(--green)", border:"rgba(52,199,89,.25)" , shadow:"0 1px 1px rgba(16,24,40,.03)"},
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={onClick} type={type || "button"} disabled={disabled}
      style={{
        appearance:"none", height: sizes.h, padding:`0 ${sizes.px}px`, gap: sizes.gap,
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        fontSize: sizes.fs, fontWeight:600, letterSpacing:"-0.005em",
        borderRadius: sizes.r, background: v.bg, color: v.color,
        border:`1px solid ${v.border}`, boxShadow:v.shadow,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .55 : 1,
        transition:"transform .12s ease, box-shadow .18s ease, background .18s ease",
        width: full ? "100%" : "auto", ...style,
      }}
      onMouseDown={(e)=>e.currentTarget.style.transform="scale(0.985)"}
      onMouseUp={(e)=>e.currentTarget.style.transform="scale(1)"}
      onMouseLeave={(e)=>e.currentTarget.style.transform="scale(1)"}
    >
      {icon && <Icon name={icon} size={sizes.fs + 2}/>}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes.fs + 2}/>}
    </button>
  );
}

// ───────── Card ─────────
function Card({ children, padding = 22, radius, hover, style, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background:"var(--bg-elev)", borderRadius: radius || "var(--radius-card)",
        border:"1px solid var(--line)", boxShadow:"var(--shadow-card)",
        padding, transition:"transform .2s ease, box-shadow .25s ease",
        transform: hover && h ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hover && h ? "var(--shadow-pop)" : "var(--shadow-card)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>
      {children}
    </div>
  );
}

// ───────── Badge ─────────
function Badge({ children, tone = "neutral", dot, size="md", style }) {
  const tones = {
    neutral:{ bg:"#f1f2f6", color:"#3a3a3c", dot:"#8e8e93"},
    green:  { bg:"var(--green-soft)", color:"#1f7a3a", dot:"var(--green)" },
    blue:   { bg:"var(--blue-soft)", color:"#0a4ea3", dot:"var(--blue)" },
    purple: { bg:"var(--accent-soft)", color:"#4a2fcc", dot:"var(--accent)" },
    orange: { bg:"var(--orange-soft)", color:"#a05a00", dot:"var(--orange)" },
    red:    { bg:"var(--red-soft)", color:"#a8261d", dot:"var(--red)" },
  };
  const t = tones[tone] || tones.neutral;
  const sizes = { sm:{h:20, fs:10.5, px:7}, md:{h:24, fs:11.5, px:9}, lg:{h:28, fs:12.5, px:11}};
  const s = sizes[size] || sizes.md;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      height:s.h, padding:`0 ${s.px}px`, fontSize:s.fs, fontWeight:600,
      letterSpacing:".02em", textTransform:"uppercase",
      borderRadius:999, background:t.bg, color:t.color, ...style,
    }}>
      {dot && <span style={{width:6, height:6, borderRadius:999, background:t.dot}}/>}
      {children}
    </span>
  );
}

// ───────── Glyph tile (app-icon style with gradient) ─────────
function GlyphTile({ icon, size = 44, gradient, radius = 12, glyph }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:radius, flexShrink:0,
      display:"grid", placeItems:"center", color:"#fff",
      background: gradient, fontSize: size*0.5,
      boxShadow:"0 1px 0 rgba(255,255,255,.35) inset, 0 4px 10px rgba(16,24,40,.10)",
      letterSpacing:0,
    }}>
      {glyph ? <span style={{fontSize:size*0.52, lineHeight:1, filter:"drop-shadow(0 1px 1px rgba(0,0,0,.15))"}}>{glyph}</span> : <Icon name={icon} size={size*0.5} stroke={1.8}/>}
    </div>
  );
}

// ───────── Stat chip (used in server header) ─────────
function Stat({ icon, label, value, tone="neutral" }) {
  const tones = {
    neutral:{c:"#3a3a3c", bg:"#f4f5f7"},
    green:{c:"#1f7a3a", bg:"var(--green-soft)"},
    orange:{c:"#a05a00", bg:"var(--orange-soft)"},
    blue:{c:"#0a4ea3", bg:"var(--blue-soft)"},
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div style={{display:"flex",alignItems:"center", gap:8, padding:"8px 12px",
      borderRadius:14, background:t.bg, color:t.c}}>
      <Icon name={icon} size={14} stroke={1.8}/>
      <div style={{display:"flex", flexDirection:"column", lineHeight:1.1}}>
        <span style={{fontSize:10.5, opacity:.7, fontWeight:600, letterSpacing:".04em", textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:13, fontWeight:600, fontVariantNumeric:"tabular-nums"}}>{value}</span>
      </div>
    </div>
  );
}

// ───────── Avatar (initial) ─────────
function Avatar({ name, color = "var(--accent)", size = 36 }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div style={{
      width:size, height:size, borderRadius: size*0.32,
      background: color, color:"#fff",
      display:"grid", placeItems:"center", fontWeight:700, fontSize:size*0.42,
      boxShadow:"0 1px 0 rgba(255,255,255,.3) inset, 0 2px 6px rgba(16,24,40,.10)",
      flexShrink:0,
    }}>{letter}</div>
  );
}

// ───────── Toggle ─────────
function Toggle({ on, onChange }) {
  return (
    <button onClick={()=>onChange && onChange(!on)}
      style={{ appearance:"none", border:0, width:42, height:25, padding:2,
        borderRadius:999, background: on ? "var(--green)" : "#d1d1d6",
        position:"relative", cursor:"pointer", transition:"background .2s ease"}}>
      <span style={{
        position:"absolute", top:2, left: on ? 19 : 2,
        width:21, height:21, borderRadius:999, background:"#fff",
        boxShadow:"0 1px 2px rgba(0,0,0,.2), 0 2px 4px rgba(0,0,0,.1)",
        transition:"left .2s ease"
      }}/>
    </button>
  );
}

// ───────── Input ─────────
function Input({ label, value, onChange, placeholder, mono, type="text", suffix, hint }) {
  return (
    <label style={{display:"flex", flexDirection:"column", gap:6}}>
      {label && <span style={{fontSize:10.5, fontWeight:600, letterSpacing:".06em",
        textTransform:"uppercase", color:"var(--ink-3)"}}>{label}</span>}
      <div style={{position:"relative"}}>
        <input type={type} value={value} placeholder={placeholder}
          onChange={(e)=>onChange && onChange(e.target.value)}
          style={{
            width:"100%", height:42, padding:`0 ${suffix?44:14}px 0 14px`,
            border:"1px solid var(--line)", borderRadius:12, background:"#fff",
            fontFamily: mono ? "var(--mono)" : "var(--font)", fontSize:14,
            color:"var(--ink)", outline:"none",
            boxShadow:"0 1px 1px rgba(16,24,40,.03)",
            transition:"border-color .15s ease, box-shadow .15s ease",
          }}
          onFocus={(e)=>{e.target.style.borderColor="var(--accent)"; e.target.style.boxShadow="0 0 0 3px rgba(124,92,255,.18)"}}
          onBlur={(e)=>{e.target.style.borderColor="var(--line)"; e.target.style.boxShadow="0 1px 1px rgba(16,24,40,.03)"}}
        />
        {suffix && <div style={{position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
          color:"var(--ink-3)", fontSize:12, fontWeight:500}}>{suffix}</div>}
      </div>
      {hint && <span style={{fontSize:12, color:"var(--ink-3)"}}>{hint}</span>}
    </label>
  );
}

// ───────── Checkbox ─────────
function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{display:"inline-flex", alignItems:"center", gap:10, cursor:"pointer", userSelect:"none"}}>
      <span style={{
        width:20, height:20, borderRadius:6,
        background: checked ? "var(--accent)" : "#fff",
        border: checked ? "1px solid var(--accent)" : "1px solid var(--line)",
        display:"grid", placeItems:"center", transition:"all .15s ease",
        boxShadow: checked ? "0 2px 6px rgba(124,92,255,.3)" : "0 1px 1px rgba(16,24,40,.03)"
      }}>
        {checked && <Icon name="check" size={13} stroke={3} color="#fff"/>}
      </span>
      <input type="checkbox" checked={!!checked} onChange={(e)=>onChange && onChange(e.target.checked)} style={{display:"none"}}/>
      <span style={{fontSize:14, color:"var(--ink)"}}>{label}</span>
    </label>
  );
}

// ───────── Section header ─────────
function SectionHeader({ title, subtitle, right }) {
  return (
    <div style={{display:"flex", alignItems:"end", justifyContent:"space-between", gap:16, marginBottom:14}}>
      <div>
        <h2 style={{margin:0, fontSize:24, fontWeight:700, letterSpacing:"-0.02em", color:"var(--ink)"}}>{title}</h2>
        {subtitle && <p style={{margin:"4px 0 0", fontSize:14, color:"var(--ink-3)"}}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

// expose globally
Object.assign(window, {
  Icon, Button, Card, Badge, GlyphTile, Stat, Avatar, Toggle, Input, Checkbox, SectionHeader,
});
