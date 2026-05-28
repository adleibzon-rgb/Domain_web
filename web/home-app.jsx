// PCA Lab — cover site: AI + cybersecurity research/education

const { useState: useH, useEffect: useEH } = React;

// Nav from nav.jsx (SiteNav)

// ───────── Hero ─────────
function Hero(){
  return (
    <section style={{maxWidth:1200, margin:"0 auto", padding:"72px 28px 56px"}}>
      <div style={{display:"grid", gridTemplateColumns:"1.25fr 1fr", gap:48, alignItems:"center"}}>
        <div>
          <div style={{display:"inline-flex", alignItems:"center", gap:8,
            padding:"6px 14px", borderRadius:999, background:"#fff",
            border:"1px solid var(--line)", boxShadow:"0 1px 1px rgba(16,24,40,.03)",
            fontSize:11, fontWeight:700, color:"var(--ink-2)", letterSpacing:".12em"}}>
            <span style={{width:6, height:6, borderRadius:999, background:"var(--brand)"}}/>
            ОТКРЫТЫЕ ИССЛЕДОВАНИЯ · 2026
          </div>
          <h1 style={{margin:"22px 0 18px", fontSize:68, fontWeight:800, lineHeight:0.98, letterSpacing:"-0.04em"}}>
            На стыке&nbsp;
            <span style={{fontFamily:"var(--serif)", fontWeight:400, fontStyle:"italic", color:"var(--brand)", letterSpacing:"-0.02em"}}>искусственного интеллекта</span>
            &nbsp;и&nbsp;<span style={{fontFamily:"var(--serif)", fontWeight:400, fontStyle:"italic"}}>кибербезопасности</span>
          </h1>
          <p style={{margin:"0 0 26px", maxWidth:540, fontSize:17, lineHeight:1.55, color:"var(--ink-2)"}}>
            PCA Lab — независимая исследовательская группа. Курсы, лонгриды и open-source инструменты
            по приватности, машинному обучению и защите сетей. Без рекламы, без слежки, без шума.
          </p>
          <div style={{display:"flex", gap:10, alignItems:"center", flexWrap:"wrap"}}>
            <Button variant="primary" size="lg" iconRight="chevron-right" style={{background:"var(--ink)", boxShadow:"0 1px 0 rgba(255,255,255,.18) inset, 0 6px 16px rgba(0,0,0,.18)"}}>Начать с курса</Button>
            <Button variant="secondary" size="lg" icon="doc">Программа</Button>
            <div style={{display:"flex", alignItems:"center", gap:8, marginLeft:8, fontSize:13, color:"var(--ink-3)"}}>
              <Icon name="check" size={14} color="var(--green)" stroke={2.5}/> 4 200+ слушателей
            </div>
          </div>
        </div>

        {/* Hero composition — research card stack */}
        <div style={{position:"relative", height:420}}>
          <Card padding={20} style={{
            position:"absolute", inset:"0 0 auto 8%", width:"92%", transform:"rotate(-2deg)",
            background:"linear-gradient(180deg,#fff 0%,#fafbff 100%)"
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <Badge tone="blue" size="sm">CRYPTOGRAPHY</Badge>
              <span style={{fontSize:11.5, color:"var(--ink-3)", fontFamily:"var(--mono)"}}>2026·05</span>
            </div>
            <h4 style={{margin:"14px 0 8px", fontSize:18, fontWeight:700, letterSpacing:"-0.01em"}}>Post-quantum handshake протоколы — практический разбор</h4>
            <p style={{margin:0, fontSize:13, color:"var(--ink-3)", lineHeight:1.5}}>
              Сравниваем Kyber, Dilithium и SPHINCS+ в условиях ограниченного канала.
            </p>
            <ChartBars/>
          </Card>

          <Card padding={18} style={{
            position:"absolute", bottom:0, left:0, width:"58%",
            background:"linear-gradient(180deg,#1d1d1f 0%, #25262b 100%)", color:"#fff",
            border:"1px solid rgba(255,255,255,.08)", boxShadow:"0 1px 0 rgba(255,255,255,.06) inset, 0 12px 32px rgba(0,0,0,.18)",
            transform:"rotate(1.5deg)"
          }}>
            <div style={{display:"flex", alignItems:"center", gap:8, fontSize:11, fontWeight:700, color:"rgba(255,255,255,.7)", letterSpacing:".12em"}}>
              <span style={{width:6, height:6, borderRadius:999, background:"#34c759"}}/>
              LIVE COURSE
            </div>
            <h4 style={{margin:"10px 0 6px", fontSize:16, fontWeight:700, letterSpacing:"-0.01em"}}>Adversarial ML — атаки на модели</h4>
            <p style={{margin:0, fontSize:12.5, color:"rgba(255,255,255,.6)"}}>Старт 1 июня · 6 недель</p>
            <div style={{marginTop:14, display:"flex", alignItems:"center", gap:-6}}>
              {["#7c5cff","#ff9f0a","#34c759","#ff3b8a"].map((c,i)=>(
                <div key={i} style={{
                  width:26, height:26, borderRadius:999, background:c, border:"2px solid #1d1d1f",
                  marginLeft: i===0?0:-8, fontSize:11, color:"#fff", display:"grid", placeItems:"center", fontWeight:700
                }}>{["A","B","M","P"][i]}</div>
              ))}
              <span style={{marginLeft:12, fontSize:12, color:"rgba(255,255,255,.7)"}}>+ 218 студентов</span>
            </div>
          </Card>

          <Card padding={16} style={{
            position:"absolute", top:"42%", right:"-2%", width:"52%",
            transform:"rotate(3deg)"
          }}>
            <div style={{fontSize:11, fontWeight:700, letterSpacing:".1em", color:"var(--amber)"}}>NETWORK SECURITY</div>
            <h4 style={{margin:"8px 0 8px", fontSize:15.5, fontWeight:700, letterSpacing:"-0.01em"}}>DPI-устойчивые туннели: обзор архитектур</h4>
            <div style={{display:"flex", alignItems:"center", gap:10, marginTop:10}}>
              <Avatar name="K" color="linear-gradient(160deg,#7ec2ff,#0a84ff)" size={28}/>
              <span style={{fontSize:12, color:"var(--ink-3)"}}>К. Линеев · 12 мин</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ChartBars decoration
function ChartBars(){
  const bars = [42, 68, 55, 84, 71, 90, 76, 88, 95];
  return (
    <div style={{marginTop:18, display:"flex", alignItems:"flex-end", gap:6, height:60}}>
      {bars.map((v,i)=>(
        <div key={i} style={{
          flex:1, height: v + "%", borderRadius:6,
          background: i===bars.length-1
            ? "linear-gradient(180deg,#0a84ff,#0f5dff)"
            : "var(--bg-tint)",
          border: i===bars.length-1 ? "0" : "1px solid var(--line)"
        }}/>
      ))}
    </div>
  );
}

// ───────── Topic grid ─────────
function Topics(){
  const items = [
    { tag:"AI SAFETY", title:"Безопасность языковых моделей", desc:"Prompt injection, jailbreaks, защитные слои и oversight-механизмы.",
      color:"linear-gradient(160deg,#9b82ff,#6a44f5)", icon:"sparkles", articles:14},
    { tag:"NETWORK", title:"Современные сетевые протоколы", desc:"WireGuard, QUIC, HTTP/3, TLS 1.3 — как они устроены и где ломаются.",
      color:"linear-gradient(160deg,#7ec2ff,#0a84ff)", icon:"globe", articles:22},
    { tag:"CRYPTOGRAPHY", title:"Прикладная криптография", desc:"От симметричных шифров до post-quantum, с практическими лабами.",
      color:"linear-gradient(160deg,#1d1d1f,#3a3a3c)", icon:"lock", articles:31},
    { tag:"PRIVACY", title:"Приватность по умолчанию", desc:"Threat modeling, цифровая гигиена, OPSEC для исследователей.",
      color:"linear-gradient(160deg,#34c759,#1f8a5b)", icon:"shield", articles:18},
    { tag:"MACHINE LEARNING", title:"Машинное обучение с нуля", desc:"Линейная алгебра, оптимизация и трансформеры — для практиков.",
      color:"linear-gradient(160deg,#ff9f0a,#ff6b00)", icon:"brain", articles:27},
    { tag:"OFFENSIVE", title:"Red-team & пентест", desc:"Этичный взлом: methodology, инструменты, отчёты.",
      color:"linear-gradient(160deg,#ff3b8a,#9b51e0)", icon:"bolt", articles:12},
  ];
  return (
    <section style={{maxWidth:1200, margin:"24px auto 0", padding:"0 28px"}}>
      <SectionHeader
        title="Направления"
        subtitle="Шесть треков, каждый сопровождается курсами, лонгридами и открытыми инструментами"
        right={<Button variant="secondary" iconRight="chevron-right">Все направления</Button>}/>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18}}>
        {items.map((t,i)=>(
          <Card key={i} padding={22} hover>
            <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between"}}>
              <GlyphTile size={44} radius={12} gradient={t.color} icon={t.icon}/>
              <span style={{
                fontSize:11, fontWeight:600, color:"var(--ink-3)", fontVariantNumeric:"tabular-nums",
                padding:"4px 10px", borderRadius:999, background:"var(--bg-tint)"
              }}>{t.articles} материалов</span>
            </div>
            <div style={{marginTop:18, fontSize:10.5, fontWeight:700, color:"var(--ink-3)", letterSpacing:".12em"}}>
              {t.tag}
            </div>
            <h3 style={{margin:"6px 0 8px", fontSize:19, fontWeight:700, letterSpacing:"-0.015em"}}>{t.title}</h3>
            <p style={{margin:0, fontSize:13.5, color:"var(--ink-3)", lineHeight:1.55}}>{t.desc}</p>
            <a href="#" style={{
              marginTop:14, display:"inline-flex", alignItems:"center", gap:5,
              fontSize:13, fontWeight:600, color:"var(--ink-2)"
            }}>Изучить трек <Icon name="chevron-right" size={13} stroke={2.2}/></a>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ───────── Featured Article + Sidebar list ─────────
function Articles(){
  return (
    <section style={{maxWidth:1200, margin:"72px auto 0", padding:"0 28px"}}>
      <SectionHeader
        title="Последние материалы"
        subtitle="Лонгриды, лабораторные тетради, разборы инцидентов"
        right={<Button variant="secondary" iconRight="chevron-right">Архив</Button>}/>

      <div style={{display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:18}}>
        {/* Featured */}
        <Card padding={0} hover style={{overflow:"hidden"}}>
          <div style={{
            height:280, position:"relative",
            background:"linear-gradient(135deg,#1d1d1f 0%, #2d2d33 60%, #0f5dff 100%)",
            overflow:"hidden"
          }}>
            <div style={{position:"absolute", inset:0,
              backgroundImage:"radial-gradient(circle at 20% 30%, rgba(255,255,255,.18) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(15,93,255,.4) 0%, transparent 50%)",
              pointerEvents:"none"}}/>
            <CodeRain/>
            <div style={{position:"absolute", top:20, left:20}}>
              <Badge tone="blue" style={{background:"rgba(255,255,255,.92)", color:"#0a4ea3"}}>FEATURED · LONGREAD</Badge>
            </div>
            <div style={{position:"absolute", bottom:20, left:20, right:20, color:"#fff"}}>
              <div style={{fontSize:11.5, fontWeight:600, opacity:.7, letterSpacing:".1em"}}>15 МАЯ 2026 · 22 МИН ЧТЕНИЯ</div>
              <h3 style={{margin:"6px 0 0", fontSize:26, fontWeight:700, letterSpacing:"-0.02em", lineHeight:1.15}}>
                Почему DPI всё чаще ошибается: разбор шести популярных эвристик
              </h3>
            </div>
          </div>
          <div style={{padding:"20px 22px"}}>
            <p style={{margin:0, fontSize:14, color:"var(--ink-2)", lineHeight:1.55}}>
              Современные системы глубокой инспекции пакетов проигрывают не из-за слабого железа,
              а из-за переусложнённой эвристики. Разбираем причины и считаем false-positive rate на открытых датасетах.
            </p>
            <div style={{marginTop:14, display:"flex", alignItems:"center", gap:10}}>
              <Avatar name="K" color="linear-gradient(160deg,#7ec2ff,#0a84ff)" size={32}/>
              <div style={{lineHeight:1.2}}>
                <div style={{fontSize:13.5, fontWeight:600}}>Константин Линеев</div>
                <div style={{fontSize:12, color:"var(--ink-3)"}}>Senior researcher, Network team</div>
              </div>
            </div>
          </div>
        </Card>

        {/* List of small articles */}
        <div style={{display:"flex", flexDirection:"column", gap:14}}>
          {[
            {tag:"AI SAFETY",  date:"12 мая", read:"9 мин", title:"Constitutional AI: как обучают модели по тексту правил", color:"linear-gradient(160deg,#9b82ff,#6a44f5)", author:"А. Морозова"},
            {tag:"PRIVACY",    date:"08 мая", read:"6 мин", title:"Threat modeling для журналистов и активистов", color:"linear-gradient(160deg,#34c759,#1f8a5b)", author:"М. Петренко"},
            {tag:"CRYPTO",     date:"03 мая", read:"14 мин", title:"Подписи Ed25519 — что в них особенного", color:"linear-gradient(160deg,#1d1d1f,#3a3a3c)", author:"Д. Богданов"},
            {tag:"OFFENSIVE",  date:"29 апр", read:"11 мин", title:"Lateral movement в облачных средах: AWS edition", color:"linear-gradient(160deg,#ff3b8a,#9b51e0)", author:"Е. Лазарев"},
          ].map((a,i)=>(
            <Card key={i} padding={16} hover>
              <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
                <div style={{
                  width:48, height:48, borderRadius:12, flexShrink:0,
                  background:a.color, position:"relative", overflow:"hidden"
                }}>
                  <div style={{position:"absolute", inset:0, opacity:.4,
                    backgroundImage:"radial-gradient(circle at 30% 30%, rgba(255,255,255,.4), transparent 60%)"}}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:"flex", alignItems:"center", gap:8, fontSize:10.5, color:"var(--ink-3)"}}>
                    <span style={{fontWeight:700, letterSpacing:".1em"}}>{a.tag}</span>
                    <span style={{opacity:.4}}>·</span>
                    <span>{a.date}</span>
                    <span style={{opacity:.4}}>·</span>
                    <span>{a.read}</span>
                  </div>
                  <h4 style={{margin:"5px 0 4px", fontSize:15, fontWeight:700, letterSpacing:"-0.01em", lineHeight:1.25}}>{a.title}</h4>
                  <div style={{fontSize:12, color:"var(--ink-3)"}}>{a.author}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeRain(){
  // Static "code lines" decoration
  const lines = [
    "$ openssl genpkey -algorithm Ed25519",
    "→ key.pem · 64 bytes",
    "$ sha256sum key.pem",
    "8a3f…d2c1  key.pem",
    "$ ./detect --input pcap/sample.pcap",
    "matched: 0  · false-positive: 12%",
  ];
  return (
    <div style={{
      position:"absolute", right:18, bottom:80, fontFamily:"var(--mono)",
      fontSize:11, color:"rgba(255,255,255,.42)", lineHeight:1.6,
      maxWidth:"50%", textAlign:"right"
    }}>
      {lines.map((l,i)=><div key={i}>{l}</div>)}
    </div>
  );
}

// ───────── Courses CTA ─────────
function Courses(){
  return (
    <section style={{maxWidth:1200, margin:"72px auto 0", padding:"0 28px"}}>
      <SectionHeader title="Курсы — открытый набор"
        subtitle="Записываемся бесплатно, материалы остаются у вас навсегда"/>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18}}>
        {[
          {weeks:8, name:"Введение в нейросети", lvl:"beginner", lvlT:"green", n:1240, color:"linear-gradient(160deg,#9b82ff,#6a44f5)", icon:"brain"},
          {weeks:6, name:"Cybersec для разработчиков", lvl:"intermediate", lvlT:"blue", n:864, color:"linear-gradient(160deg,#7ec2ff,#0a84ff)", icon:"shield"},
          {weeks:12, name:"Криптография в продакшене", lvl:"advanced", lvlT:"purple", n:412, color:"linear-gradient(160deg,#1d1d1f,#3a3a3c)", icon:"lock"},
          {weeks:4, name:"OPSEC и приватность", lvl:"beginner", lvlT:"green", n:1820, color:"linear-gradient(160deg,#34c759,#1f8a5b)", icon:"shield"},
        ].map((c,i)=>(
          <Card key={i} padding={20} hover>
            <GlyphTile size={42} radius={12} gradient={c.color} icon={c.icon}/>
            <h4 style={{margin:"14px 0 6px", fontSize:16, fontWeight:700, letterSpacing:"-0.01em", minHeight:42, lineHeight:1.3}}>{c.name}</h4>
            <div style={{display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--ink-3)"}}>
              <Icon name="clock" size={13}/> {c.weeks} недель
              <span style={{opacity:.4}}>·</span>
              <Icon name="users" size={13}/> {c.n}
            </div>
            <div style={{marginTop:14, paddingTop:14, borderTop:"1px solid var(--line-2)",
              display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <Badge tone={c.lvlT} size="sm">{c.lvl}</Badge>
              <a href="#" style={{fontSize:13, fontWeight:600, color:"var(--ink-2)",
                display:"inline-flex", alignItems:"center", gap:4}}>
                Записаться <Icon name="chevron-right" size={13} stroke={2.2}/>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ───────── Newsletter / CTA ─────────
function Newsletter(){
  return (
    <section style={{maxWidth:1200, margin:"72px auto 0", padding:"0 28px"}}>
      <div style={{
        position:"relative", overflow:"hidden",
        borderRadius:"calc(var(--radius-card) + 6px)",
        background:"linear-gradient(135deg,#0a0a0b 0%, #1d1d1f 60%, #0f5dff 200%)",
        color:"#fff", padding:"48px 48px", border:"1px solid rgba(255,255,255,.06)",
        boxShadow:"0 1px 0 rgba(255,255,255,.06) inset, 0 18px 50px rgba(15,93,255,.18)"
      }}>
        <div style={{position:"absolute", inset:0, opacity:.6,
          background:"radial-gradient(500px 280px at 100% 100%, rgba(15,93,255,.4), transparent 60%), radial-gradient(400px 220px at 0% 0%, rgba(155,82,224,.18), transparent 60%)"}}/>
        <div style={{position:"relative", display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:36, alignItems:"center"}}>
          <div>
            <div style={{fontSize:11, fontWeight:700, color:"rgba(255,255,255,.6)", letterSpacing:".14em"}}>
              · NEWSLETTER · ПО ЧЕТВЕРГАМ ·
            </div>
            <h2 style={{margin:"12px 0 10px", fontSize:34, fontWeight:700, letterSpacing:"-0.02em", lineHeight:1.1}}>
              Раз в неделю — лучшие материалы и одна короткая мысль
            </h2>
            <p style={{margin:0, fontSize:14.5, color:"rgba(255,255,255,.7)", maxWidth:480, lineHeight:1.55}}>
              Без рекламы и продаж курсов. Только то, что мы сами читаем и используем в работе.
            </p>
          </div>
          <form style={{display:"flex", gap:10}} onSubmit={(e)=>e.preventDefault()}>
            <input type="email" placeholder="your@email.com" style={{
              flex:1, height:48, padding:"0 18px",
              border:"1px solid rgba(255,255,255,.14)", background:"rgba(255,255,255,.06)",
              backdropFilter:"blur(10px)", borderRadius:14, color:"#fff",
              fontSize:14.5, outline:"none"
            }}/>
            <button style={{
              appearance:"none", border:0, height:48, padding:"0 22px",
              background:"#fff", color:"#0a0a0b", fontSize:14, fontWeight:700,
              borderRadius:14, cursor:"pointer"
            }}>Подписаться →</button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ───────── Footer ─────────
function Footer(){
  return (
    <footer style={{maxWidth:1200, margin:"72px auto 0", padding:"32px 28px 48px"}}>
      <div style={{display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr", gap:32, paddingBottom:32, borderBottom:"1px solid var(--line-2)"}}>
        <div>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:32, height:32, borderRadius:10, background:"linear-gradient(160deg,#1d1d1f,#2d2d33)",
              display:"grid", placeItems:"center", color:"#fff"}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.6"/>
                <path d="M8 7l4 10 4-10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{fontSize:15, fontWeight:700, letterSpacing:"-0.01em"}}>PCA Lab</div>
          </div>
          <p style={{margin:"14px 0 14px", fontSize:13, color:"var(--ink-3)", maxWidth:280, lineHeight:1.55}}>
            Независимая исследовательская группа. Курсы, открытые статьи и инструменты
            по приватности и AI с 2022 года.
          </p>
          <div style={{display:"flex", gap:8}}>
            {[
              {icon:"github", l:"GitHub"},
              {icon:"plane", l:"Telegram"},
              {icon:"doc", l:"RSS"},
            ].map(s=>(
              <a key={s.l} href="#" title={s.l} style={{
                width:34, height:34, borderRadius:10, background:"#fff",
                border:"1px solid var(--line)", display:"grid", placeItems:"center",
                color:"var(--ink-2)"
              }}><Icon name={s.icon} size={15}/></a>
            ))}
          </div>
        </div>

        <FootCol title="Контент" links={["Главная","Курсы","Исследования","Блог","Авторы"]}/>
        <FootCol title="Темы" links={["AI Safety","Network","Cryptography","Privacy","ML","Red-team"]}/>
        <FootCol title="Лаборатория" links={["О нас","Резиденты","Партнёры","Контакты","Открытые позиции"]}/>
        <FootCol title="Студентам" links={[
          { l:"Программа курса" },
          { l:"FAQ" },
          { l:"Помощь техподдержки" },
          { l:"Кабинет студента", href:"connect.html", highlight:true },
          { l:"Группы доменов", href:"domains.html" },
          { l:"VPN по региону", href:"connect.html?mode=region" },
        ]}/>
      </div>

      <div style={{paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12.5, color:"var(--ink-3)", flexWrap:"wrap", gap:14}}>
        <div>© 2022–2026 PCA Lab · Все материалы — под лицензией CC BY-SA 4.0</div>
        <div style={{display:"flex", gap:18}}>
          <a href="#" style={{color:"var(--ink-3)"}}>Конфиденциальность</a>
          <a href="#" style={{color:"var(--ink-3)"}}>Условия</a>
          <a href="#" style={{color:"var(--ink-3)"}}>RSS</a>
        </div>
      </div>
    </footer>
  );
}
function FootCol({ title, links }){
  return (
    <div>
      <div style={{fontSize:11, fontWeight:700, color:"var(--ink-3)", letterSpacing:".14em", textTransform:"uppercase", marginBottom:14}}>{title}</div>
      <ul style={{margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10}}>
        {links.map((l,i)=>{
          const item = typeof l === "string" ? { l } : l;
          return (
            <li key={i}>
              <a href={item.href || "#"} style={{
                fontSize:13.5, color: item.highlight ? "var(--ink)" : "var(--ink-2)",
                fontWeight: item.highlight ? 600 : 500,
                display:"inline-flex", alignItems:"center", gap:6,
              }}>
                {item.l}
                {item.highlight && <Icon name="chevron-right" size={12} stroke={2.2} color="var(--ink-3)"/>}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ───────── Stats strip ─────────
function StatsStrip(){
  return (
    <section style={{maxWidth:1200, margin:"40px auto 0", padding:"0 28px"}}>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:0,
        background:"#fff", border:"1px solid var(--line)", borderRadius:18,
        boxShadow:"var(--shadow-card)", overflow:"hidden"}}>
        {[
          {v:"124", l:"открытых статей"},
          {v:"12", l:"живых курсов"},
          {v:"4 200+", l:"слушателей"},
          {v:"32", l:"open-source проекта"},
        ].map((s,i)=>(
          <div key={i} style={{padding:"22px 24px", borderLeft: i===0 ? "0" : "1px solid var(--line-2)"}}>
            <div style={{fontSize:30, fontWeight:700, letterSpacing:"-0.02em", fontVariantNumeric:"tabular-nums"}}>{s.v}</div>
            <div style={{marginTop:2, fontSize:13, color:"var(--ink-3)"}}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ───────── App ─────────
function HomeApp(){
  return (
    <div>
      <SiteNav/>
      <Hero/>
      <StatsStrip/>
      <Topics/>
      <Articles/>
      <Courses/>
      <Newsletter/>
      <Footer/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<HomeApp/>);
