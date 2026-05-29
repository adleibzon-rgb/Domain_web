// Curated blocked domains — static lists (no search)

function cidrToMask(bits) {
  const n = parseInt(bits || "32", 10);
  if (n === 32) return "255.255.255.255";
  return Array.from({ length: 4 }, (_, i) => (65280 >> Math.min(8, Math.max(0, n - i * 8))) & 255).join(".");
}

function buildKeeneticBat(group, allGroups) {
  const lines = ["@echo off", "rem Keenetic static routes — " + (group ? group.title : "все группы"), ""];
  const src = group ? [group] : allGroups;
  const seen = new Set();
  src.forEach((g) => {
    (g.ips || []).forEach((cidr) => {
      const [ip, bits] = cidr.split("/");
      if (!ip || seen.has(cidr)) return;
      seen.add(cidr);
      const mask = cidrToMask(bits);
      lines.push(`route ADD ${ip} MASK ${mask} 0.0.0.0 & rem ${g.title}`);
    });
  });
  if (lines.length <= 3) {
    lines.push("rem IP-префиксы не заданы — используйте список доменов вручную в VPN");
  }
  return lines.join("\r\n") + "\r\n";
}

function buildBatForSelectedDomains(selectedSet, allGroups) {
  const selected = [...selectedSet];
  const lines = ["@echo off", "rem Keenetic — выбранные домены (" + selected.length + ")", ""];
  const seen = new Set();

  allGroups.forEach((g) => {
    const picked = g.domains.filter((d) => selectedSet.has(d));
    if (!picked.length) return;
    (g.ips || []).forEach((cidr) => {
      const [ip, bits] = cidr.split("/");
      if (!ip || seen.has(cidr)) return;
      seen.add(cidr);
      lines.push(`route ADD ${ip} MASK ${cidrToMask(bits)} 0.0.0.0 & rem ${g.title}: ${picked.join(", ")}`);
    });
  });

  if (lines.length <= 3) {
    lines.push("rem Нет IP/CIDR для выбранных доменов — настройте VPN вручную");
    selected.forEach((d) => lines.push(`rem   ${d}`));
  }
  return lines.join("\r\n") + "\r\n";
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  }
}

function DomainGroupCard({ group, selectedDomains, onToggleDomain, onToggleGroup, onDownloadBat }) {
  const [open, setOpen] = React.useState(true);
  const [copied, setCopied] = React.useState(null);
  const domainText = group.domains.join("\n");
  const ipText = (group.ips || []).join("\n");
  const selectedInGroup = group.domains.filter((d) => selectedDomains.has(d));
  const allSelected = group.domains.length > 0 && selectedInGroup.length === group.domains.length;

  async function handleCopy(kind) {
    const text = kind === "domains" ? domainText : ipText;
    if (!text) return;
    await copyText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        width: "100%", appearance: "none", border: 0, background: "#fff",
        padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 28 }}>{group.icon}</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{group.title}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--ink-3)" }}>{group.description}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {selectedInGroup.length > 0 && (
            <Badge tone="blue" size="sm">{selectedInGroup.length} выбрано</Badge>
          )}
          <Badge tone="neutral" size="sm">{group.domains.length} доменов</Badge>
          <Icon name={open ? "chevron-down" : "chevron-right"} size={18} color="var(--ink-3)" />
        </div>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--line-2)", padding: "18px 22px 22px" }}>
          {group.v2fly_tags?.length > 0 && (
            <div style={{ marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {group.v2fly_tags.map((t) => (
                <Badge key={t} tone="purple" size="sm">{t}</Badge>
              ))}
            </div>
          )}
          <div style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="secondary" size="sm" onClick={() => onToggleGroup(group, !allSelected)}>
              {allSelected ? "Снять выделение группы" : "Выбрать все в группе"}
            </Button>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 8, marginBottom: 16,
          }}>
            {group.domains.map((d) => {
              const selected = selectedDomains.has(d);
              return (
                <button key={d} type="button" onClick={() => onToggleDomain(d)} style={{
                  padding: "10px 12px", borderRadius: 10, textAlign: "left", cursor: "pointer",
                  fontFamily: "var(--mono)", fontSize: 12.5,
                  background: selected ? "var(--brand-soft)" : "var(--bg-tint)",
                  border: selected ? "2px solid var(--brand)" : "1px solid var(--line-2)",
                  color: selected ? "var(--brand)" : "var(--ink)",
                  fontWeight: selected ? 600 : 400,
                }}>{d}</button>
              );
            })}
          </div>
          {(group.ips || []).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", letterSpacing: ".1em", marginBottom: 8 }}>IP / CIDR (префиксы)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {group.ips.map((ip) => (
                  <code key={ip} style={{
                    padding: "6px 10px", borderRadius: 8, background: "var(--brand-soft)",
                    fontSize: 12, fontFamily: "var(--mono)",
                  }}>{ip}</code>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Button variant="secondary" size="sm" icon="clipboard"
              onClick={() => handleCopy("domains")}>
              {copied === "domains" ? "Скопировано" : "Копировать домены"}
            </Button>
            {(group.ips || []).length > 0 && (
              <Button variant="secondary" size="sm" icon="clipboard"
                onClick={() => handleCopy("ips")}>
                {copied === "ips" ? "Скопировано" : "Копировать IP"}
              </Button>
            )}
            <Button variant="primary" size="sm" icon="download"
              onClick={() => onDownloadBat(group)}>
              Keenetic .bat (вся группа)
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function DomainsApp() {
  const [groups, setGroups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("");
  const [selectedDomains, setSelectedDomains] = React.useState(new Set());
  const [copiedSelected, setCopiedSelected] = React.useState(false);

  React.useEffect(() => {
    fetch("data/blocked-domains.json")
      .then((r) => r.json())
      .then((data) => { setGroups(data.groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return groups;
    return groups.map((g) => ({
      ...g,
      domains: g.domains.filter((d) => d.includes(q) || g.title.toLowerCase().includes(q)),
    })).filter((g) => g.domains.length > 0);
  }, [groups, filter]);

  const allDomains = groups.flatMap((g) => g.domains).join("\n");

  const toggleDomain = (d) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d); else next.add(d);
      return next;
    });
  };

  const toggleGroup = (group, select) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      group.domains.forEach((d) => {
        if (select) next.add(d); else next.delete(d);
      });
      return next;
    });
  };

  const copySelectedDomains = async () => {
    await copyText([...selectedDomains].join("\n"));
    setCopiedSelected(true);
    setTimeout(() => setCopiedSelected(false), 1800);
  };

  const downloadSelectedBat = () => {
    downloadText("keenetic-selected.bat", buildBatForSelectedDomains(selectedDomains, groups));
  };

  return (
    <div>
      <SiteNav brandSub="ЗАБЛОКИРОВАННЫЕ СЕРВИСЫ" />
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 24px" }}>
        <Badge tone="blue" size="sm">Статические списки · без поиска</Badge>
        <h1 style={{ margin: "14px 0 10px", fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em" }}>
          Популярные заблокированные домены
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: 16, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 640 }}>
          Кликните по доменам для выбора, затем скачайте .bat только для выбранных.
          Кураторские списки для настройки VPN и маршрутизации на роутере Keenetic.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Фильтр по домену…"
            style={{
              flex: "1 1 220px", height: 42, padding: "0 16px", borderRadius: 12,
              border: "1px solid var(--line)", fontSize: 14,
            }} />
          <Button variant="secondary" icon="clipboard" onClick={() => copyText(allDomains)}>
            Все домены
          </Button>
          <Button variant="primary" icon="download" onClick={() => downloadText("keenetic-all-groups.bat", buildKeeneticBat(null, groups))}>
            .bat все группы
          </Button>
        </div>

        {selectedDomains.size > 0 && (
          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, padding: "14px 16px",
            background: "var(--brand-soft)", borderRadius: 14, border: "1px solid rgba(15,93,255,.15)",
            alignItems: "center",
          }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Выбрано: {selectedDomains.size}</span>
            <Button variant="primary" size="sm" icon="download" onClick={downloadSelectedBat}>
              Скачать .bat для выбранных
            </Button>
            <Button variant="secondary" size="sm" icon="clipboard" onClick={copySelectedDomains}>
              {copiedSelected ? "Скопировано" : "Копировать выбранные домены"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedDomains(new Set())}>
              Снять выделение
            </Button>
          </div>
        )}

        {loading && <p style={{ color: "var(--ink-3)" }}>Загрузка списков…</p>}
        {!loading && filtered.length === 0 && (
          <Card padding={24}><p style={{ margin: 0, color: "var(--ink-3)" }}>Ничего не найдено по фильтру.</p></Card>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((g) => (
            <DomainGroupCard key={g.id} group={g}
              selectedDomains={selectedDomains}
              onToggleDomain={toggleDomain}
              onToggleGroup={toggleGroup}
              onDownloadBat={(grp) => downloadText(`keenetic-${grp.id}.bat`, buildKeeneticBat(grp, groups))} />
          ))}
        </div>
      </section>
      <footer style={{ maxWidth: 960, margin: "48px auto", padding: "0 24px 40px", textAlign: "center", fontSize: 13, color: "var(--ink-3)" }}>
        <a href="connect.html" style={{ color: "var(--brand)", fontWeight: 600 }}>Кабинет студента</a>
        {" · "}
        <a href="/search">Поиск доменов</a>
        {" · "}
        <a href="index.html">На главную</a>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DomainsApp />);
