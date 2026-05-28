// Shared site navigation

const SITE_NAV = [
  { href: "index.html", label: "Главная", match: (p) => /index\.html$|^\/$/.test(p) },
  { href: "connect.html", label: "Кабинет студента", match: (p) => /connect\.html$/.test(p) && !/mode=region/.test(location.search) },
  { href: "connect.html?mode=region", label: "VPN по региону", match: (p) => /connect\.html/.test(p) && /mode=region/.test(location.search) },
  { href: "domains.html", label: "Группы доменов", match: (p) => /domains\.html$/.test(p) },
];

function SiteNav({ brand = "PCA Lab", brandSub = "RESEARCH · EDUCATION" }) {
  const path = typeof location !== "undefined" ? (location.pathname + (location.search || "")) : "";
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      backdropFilter: "saturate(180%) blur(20px)",
      WebkitBackdropFilter: "saturate(180%) blur(20px)",
      background: "rgba(244,245,247,0.78)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
      }}>
        <a href="index.html" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: "linear-gradient(160deg,#1d1d1f 0%, #2d2d33 100%)",
            display: "grid", placeItems: "center", color: "#fff",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.6" />
              <path d="M8 7l4 10 4-10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{brand}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: ".14em", fontWeight: 600 }}>{brandSub}</div>
          </div>
        </a>

        <nav style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {SITE_NAV.map((item, i) => {
            const active = item.match(path + (location.search || ""));
            return (
              <a key={i} href={item.href} style={{
                padding: "8px 12px", fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? "var(--ink)" : "var(--ink-2)",
                borderRadius: 999, background: active ? "#fff" : "transparent",
                border: active ? "1px solid var(--line)" : "1px solid transparent",
              }}>{item.label}</a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
