function cidrToMask(bits) {
  const n = parseInt(bits || "32", 10);
  if (n === 32) return "255.255.255.255";
  return Array.from({ length: 4 }, (_, i) => (65280 >> Math.min(8, Math.max(0, n - i * 8))) & 255).join(".");
}

function parseDomainsColumn(text) {
  if (!text) return [];
  return text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("Все домены"));
}

function parseIpsColumn(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const ips = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("Все IP") || line.startsWith("IPv6")) break;
    const cidr = line.replace(/\s*\(диапазон\)\s*$/, "");
    if (/^\d+\.\d+\.\d+\.\d+(\/\d+)?$/.test(cidr)) ips.push(cidr);
  }
  return ips;
}

function buildBatFromIps(ips) {
  const lines = ["@echo off", "rem Keenetic — выбранные IP из поиска", ""];
  const seen = new Set();
  ips.forEach((entry) => {
    if (entry.includes("/")) {
      const [ip, bits] = entry.split("/");
      if (!ip || seen.has(entry)) return;
      seen.add(entry);
      lines.push(`route ADD ${ip} MASK ${cidrToMask(bits)} 0.0.0.0`);
    } else if (/^\d+\.\d+\.\d+\.\d+$/.test(entry) && !seen.has(entry)) {
      seen.add(entry);
      lines.push(`route ADD ${entry} MASK 255.255.0.0 0.0.0.0`);
    }
  });
  if (lines.length <= 3) lines.push("rem Нет IP для выбранных записей");
  return lines.join("\r\n") + "\r\n";
}

function filterBatContent(batContent, selectedIps) {
  if (!batContent || !selectedIps.size) return "";
  const selected = new Set([...selectedIps].map((ip) => ip.split("/")[0]));
  return batContent.split("\n").filter((line) => {
    const m = line.match(/route add (\S+)/i);
    return m && selected.has(m[1]);
  }).join("\n") + (selected.size ? "\n" : "");
}

function CopyBlock({ title, text, filename }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };
  const download = () => {
    const blob = new Blob([text || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "export.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  if (!text) return null;
  return (
    <div style={{ marginTop: 16, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
        <strong>{title}</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copy} style={btnStyle}>{copied ? "Скопировано" : "Копировать"}</button>
          <button onClick={download} style={btnStyle}>Скачать</button>
        </div>
      </div>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "var(--mono)", fontSize: 12, maxHeight: 320, overflow: "auto", background: "#f9fafb", padding: 12, borderRadius: 10 }}>{text}</pre>
    </div>
  );
}

function SelectableChips({ items, selected, onToggle, label }) {
  if (!items.length) return null;
  return (
    <div style={{ marginTop: 16, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-card)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 8, flexWrap: "wrap" }}>
        <strong>{label} — клик для выбора ({selected.size}/{items.length})</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => items.forEach((i) => !selected.has(i) && onToggle(i))} style={btnStyle}>Выбрать все</button>
          <button type="button" onClick={() => items.forEach((i) => selected.has(i) && onToggle(i))} style={btnStyle}>Снять все</button>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((item) => {
          const on = selected.has(item);
          return (
            <button key={item} type="button" onClick={() => onToggle(item)} style={{
              padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12,
              border: on ? "2px solid var(--brand)" : "1px solid var(--line)",
              background: on ? "var(--brand-soft)" : "#fff",
              color: on ? "var(--brand)" : "var(--ink)",
              fontWeight: on ? 600 : 400,
            }}>{item}</button>
          );
        })}
      </div>
    </div>
  );
}

const btnStyle = {
  border: "1px solid var(--line)",
  background: "#fff",
  borderRadius: 10,
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: 13,
};

function SearchApp() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [selectedDomains, setSelectedDomains] = React.useState(new Set());
  const [selectedIps, setSelectedIps] = React.useState(new Set());

  const resultDomains = React.useMemo(() => parseDomainsColumn(result?.domains_column), [result]);
  const resultIps = React.useMemo(() => parseIpsColumn(result?.ips_column), [result]);

  const toggleDomain = (d) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d); else next.add(d);
      return next;
    });
  };

  const toggleIp = (ip) => {
    setSelectedIps((prev) => {
      const next = new Set(prev);
      if (next.has(ip)) next.delete(ip); else next.add(ip);
      return next;
    });
  };

  const runSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setSelectedDomains(new Set());
    setSelectedIps(new Set());
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const isMulti = /[\n,]/.test(trimmed) || trimmed.split(/\s+/).length > 1;
      const body = isMulti ? { domains: trimmed.split(/[\s,\n]+/).filter(Boolean) } : { domain: trimmed };
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setResult(data);
      setSelectedDomains(new Set(parseDomainsColumn(data.domains_column)));
      setSelectedIps(new Set(parseIpsColumn(data.ips_column)));
    } catch (err) {
      setError(err.message || "Ошибка поиска");
    } finally {
      setLoading(false);
    }
  };

  const downloadBat = (content, filename) => {
    if (!content) return;
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "routes.bat";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSelectedBat = () => {
    let bat = filterBatContent(result?.bat_content, selectedIps);
    if (!bat.trim()) bat = buildBatFromIps([...selectedIps]);
    downloadBat(bat, (result?.domains?.[0] || "selected") + "-selected.bat");
  };

  const copySelectedDomains = async () => {
    try {
      await navigator.clipboard.writeText([...selectedDomains].join("\n"));
    } catch (_) {}
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 64px" }}>
      <SiteNav brand="PCA Lab" brandSub="DOMAIN SEARCH · SERVER" />
      <h1 style={{ fontSize: 32, margin: "24px 0 8px" }}>Поиск доменов</h1>
      <p style={{ color: "var(--ink-3)", marginTop: 0 }}>
        CT, DNS, reverse IP, geosite/geoip — как в Telegram-боте. Один домен или пакет через пробел/запятую/новую строку.
      </p>
      <form onSubmit={runSearch} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="example.com или chatgpt.com openai.com"
          rows={2}
          style={{ flex: "1 1 280px", padding: 12, borderRadius: 12, border: "1px solid var(--line)", fontFamily: "var(--mono)", fontSize: 14 }}
        />
        <button type="submit" disabled={loading} style={{ ...btnStyle, background: "var(--brand)", color: "#fff", border: "none", padding: "12px 20px", fontWeight: 600 }}>
          {loading ? "Ищем…" : "Найти"}
        </button>
      </form>
      {error && <p style={{ color: "#b42318", marginTop: 12 }}>{error}</p>}
      {loading && <p style={{ color: "var(--ink-3)", marginTop: 16 }}>Поиск может занять до 90 секунд…</p>}
      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <strong>{result.is_batch ? `Пакет: ${result.domains.length} доменов` : result.domains[0]}</strong>
            {result.bat_content ? (
              <button type="button" onClick={() => downloadBat(result.bat_content, result.bat_filename)} style={{ ...btnStyle, background: "var(--brand-soft)", borderColor: "transparent" }}>
                Скачать {result.bat_filename}
              </button>
            ) : null}
          </div>

          <SelectableChips items={resultDomains} selected={selectedDomains} onToggle={toggleDomain} label="Домены" />
          <SelectableChips items={resultIps} selected={selectedIps} onToggle={toggleIp} label="IP / CIDR" />

          {(selectedDomains.size > 0 || selectedIps.size > 0) && (
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selectedDomains.size > 0 && (
                <button type="button" onClick={copySelectedDomains} style={{ ...btnStyle, background: "var(--brand-soft)", borderColor: "transparent" }}>
                  Копировать выбранные домены ({selectedDomains.size})
                </button>
              )}
              {selectedIps.size > 0 && (
                <button type="button" onClick={downloadSelectedBat} style={{ ...btnStyle, background: "var(--brand)", color: "#fff", border: "none" }}>
                  Скачать .bat для выбранных IP ({selectedIps.size})
                </button>
              )}
            </div>
          )}

          <CopyBlock title="Полный отчёт" text={result.report} filename={(result.domains[0] || "report") + "-report.txt"} />
          <CopyBlock title="Домены (столбик)" text={result.domains_column} filename={(result.domains[0] || "domains") + "-domains.txt"} />
          <CopyBlock title="IP (столбик)" text={result.ips_column} filename={(result.domains[0] || "ips") + "-ips.txt"} />
          <CopyBlock title="Geosite / GeoIP" text={result.geosite_geoip} filename={(result.domains[0] || "v2fly") + "-geosite.txt"} />
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SearchApp />);
