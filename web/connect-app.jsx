// VPN connection guide — Apple-light style

const { useState: useStateC, useEffect: useEffectC } = React;

// SiteNav from nav.jsx

// ───────── Hero ─────────
function Hero(){
  return (
    <section style={{maxWidth:760, margin:"0 auto", padding:"56px 28px 28px", textAlign:"center"}}>
      <div style={{display:"inline-flex", alignItems:"center", gap:6,
        padding:"6px 14px", borderRadius:999, background:"#fff",
        border:"1px solid var(--line)", boxShadow:"0 1px 1px rgba(16,24,40,.03)",
        fontSize:11, fontWeight:700, color:"var(--accent-2)", letterSpacing:".12em"}}>
        <span style={{width:6, height:6, borderRadius:999, background:"var(--accent)"}}/>
        ЧАСТНЫЙ СЕРВЕР
      </div>
      <h1 style={{margin:"18px 0 14px", fontSize:54, fontWeight:800, letterSpacing:"-0.035em", lineHeight:1.04}}>
        Подключение к VPN
      </h1>
      <p style={{margin:"0 auto", maxWidth:560, fontSize:16, lineHeight:1.55, color:"var(--ink-2)"}}>
        Используйте приложение <strong>AmneziaVPN</strong>. Конфигурацию выдаёт администратор —
        импортируйте файл или ключ, который вам передали, и включите туннель. Ниже — пошаговые
        инструкции для WireGuard и Amnezia VPN.
      </p>
    </section>
  );
}

// ───────── Server info card ─────────
function ServerCard(){
  const [copied,setCopied] = useStateC(false);
  function copy(){
    navigator.clipboard?.writeText("SERVER_IP");
    setCopied(true);
    setTimeout(()=>setCopied(false), 1600);
  }
  return (
    <Card padding={24} style={{maxWidth:880, margin:"0 auto 18px"}}>
      <div style={{fontSize:11, fontWeight:700, letterSpacing:".14em", color:"var(--accent-2)",
        textTransform:"uppercase"}}>Сервер</div>
      <div style={{marginTop:10, fontSize:13, fontWeight:500, color:"var(--ink-3)"}}>Адрес</div>
      <div style={{marginTop:8, display:"flex", gap:10}}>
        <div style={{flex:1, height:54, display:"flex", alignItems:"center", padding:"0 18px",
          background:"var(--bg-tint)", border:"1px solid var(--line)", borderRadius:14,
          fontFamily:"var(--mono)", fontSize:18, fontWeight:600,
          letterSpacing:"-0.005em", color:"var(--ink)"}}>
          SERVER_IP
        </div>
        <Button variant={copied?"success":"primary"} size="lg" onClick={copy}
          icon={copied?"check":"clipboard"}>{copied?"Скопировано":"Копировать"}</Button>
      </div>
      <div style={{marginTop:18, paddingTop:18, borderTop:"1px solid var(--line-2)",
        display:"flex", alignItems:"center", gap:14, flexWrap:"wrap"}}>
        <span style={{fontSize:13.5, color:"var(--ink-2)", fontWeight:500}}>Сервисы на машине:</span>
        <Badge tone="blue" dot>XRay (TCP)</Badge>
        <Badge tone="purple" dot>AmneziaWG (UDP)</Badge>
      </div>
      <p style={{margin:"12px 0 0", fontSize:12.5, color:"var(--ink-3)"}}>
        Номера портов и тип протокола уже зашиты в конфиг Amnezia — вручную их обычно не вводят.
      </p>
    </Card>
  );
}

// ───────── Big segmented control ─────────
function BigSegment({ value, options, onChange }){
  return (
    <div style={{display:"grid", gridTemplateColumns:`repeat(${options.length},1fr)`,
      gap:8, padding:6, background:"#fff", border:"1px solid var(--line)", borderRadius:18,
      boxShadow:"0 1px 1px rgba(16,24,40,.03)"}}>
      {options.map(o=>{
        const on = value===o.id;
        return (
          <button key={o.id} onClick={()=>onChange(o.id)} style={{
            appearance:"none", border:0, height:52, padding:"0 16px",
            background: on ? "var(--accent-soft)" : "transparent",
            color: on ? "var(--accent-2)" : "var(--ink-2)",
            borderRadius:13, cursor:"pointer", fontWeight: on ? 600 : 500,
            fontSize:14.5, letterSpacing:"-0.005em",
            display:"inline-flex", alignItems:"center", justifyContent:"center", gap:10,
            transition:"all .15s ease",
          }}>
            {o.label}
            {o.tag && <Badge tone={o.tagTone || "neutral"} size="sm">{o.tag}</Badge>}
          </button>
        );
      })}
    </div>
  );
}

// ───────── OS tabs (smaller, pill) ─────────
function OSTabs({ value, onChange }){
  const os = [
    {id:"ios", label:"iOS"}, {id:"android", label:"Android"},
    {id:"windows", label:"Windows"}, {id:"macos", label:"macOS"}
  ];
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6,
      padding:5, background:"#fff", border:"1px solid var(--line)", borderRadius:14,
      boxShadow:"0 1px 1px rgba(16,24,40,.03)"}}>
      {os.map(o=>{
        const on = value===o.id;
        return (
          <button key={o.id} onClick={()=>onChange(o.id)} style={{
            appearance:"none", border:0, height:40,
            background: on ? "var(--ink)" : "transparent",
            color: on ? "#fff" : "var(--ink-2)",
            borderRadius:10, cursor:"pointer", fontWeight: on ? 600 : 500,
            fontSize:13.5, transition:"all .15s ease",
            boxShadow: on ? "0 2px 8px rgba(0,0,0,.18)" : "none"
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

// ───────── Numbered step ─────────
function Step({ n, children }){
  return (
    <div style={{display:"flex", alignItems:"flex-start", gap:16, padding:"18px 22px",
      borderBottom:"1px solid var(--line-2)"}}>
      <div style={{
        flexShrink:0, width:32, height:32, borderRadius:999,
        background:"var(--accent-soft)", color:"var(--accent-2)",
        display:"grid", placeItems:"center", fontWeight:700, fontSize:14.5,
        fontVariantNumeric:"tabular-nums"
      }}>{n}</div>
      <div style={{flex:1, fontSize:15.5, lineHeight:1.55, color:"var(--ink)", paddingTop:4}}>
        {children}
      </div>
    </div>
  );
}
function SuccessStep({ children }){
  return (
    <div style={{display:"flex", alignItems:"center", gap:14, padding:"18px 22px",
      background:"var(--green-soft)", borderTop:"1px solid var(--line-2)"}}>
      <div style={{
        flexShrink:0, width:30, height:30, borderRadius:999,
        background:"var(--green)", color:"#fff",
        display:"grid", placeItems:"center",
        boxShadow:"0 4px 10px rgba(52,199,89,.35)"
      }}>
        <Icon name="check" size={16} stroke={3} color="#fff"/>
      </div>
      <div style={{fontSize:15, fontWeight:500, color:"#1f7a3a"}}>{children}</div>
    </div>
  );
}

// ───────── Steps card ─────────
function StepsCard({ protocol, os }){
  // Headlines per protocol / OS
  const titles = {
    wg:{
      ios:{name:"WireGuard на iOS", sub:"iPhone и iPad · iOS 15 и новее", color:"linear-gradient(160deg,#5ac8fa,#0a84ff)", icon:"lock"},
      android:{name:"WireGuard на Android", sub:"Android 8 и новее", color:"linear-gradient(160deg,#7ce0a2,#2cb67d)", icon:"lock"},
      windows:{name:"WireGuard на Windows", sub:"Windows 10 / 11", color:"linear-gradient(160deg,#7ec2ff,#0a84ff)", icon:"lock"},
      macos:{name:"WireGuard на macOS", sub:"macOS 12 и новее", color:"linear-gradient(160deg,#bdbdc0,#6e6e73)", icon:"lock"},
    },
    awg:{
      ios:{name:"Amnezia VPN на iOS", sub:"AmneziaWG · обход DPI", color:"linear-gradient(160deg,#a385ff,#6a44f5)", icon:"shield"},
      android:{name:"Amnezia VPN на Android", sub:"AmneziaWG · обход DPI", color:"linear-gradient(160deg,#9b82ff,#6a44f5)", icon:"shield"},
      windows:{name:"Amnezia VPN на Windows", sub:"AmneziaWG · обход DPI", color:"linear-gradient(160deg,#a385ff,#6a44f5)", icon:"shield"},
      macos:{name:"Amnezia VPN на macOS", sub:"AmneziaWG · обход DPI", color:"linear-gradient(160deg,#9b82ff,#6a44f5)", icon:"shield"},
    },
  };
  const t = titles[protocol][os];

  // Steps — protocol/os specific
  let steps;
  if (protocol==="wg"){
    if (os==="ios") steps = [
      <>Откройте <strong>App Store</strong>, найдите <strong>WireGuard</strong> и нажмите «Установить»</>,
      <>Откройте приложение, нажмите <strong>+</strong> в правом верхнем углу</>,
      <>
        Выберите <strong>«Сканировать QR-код»</strong> и наведите камеру на QR — конфиг добавится автоматически
        <FineNote>Или «Создать из файла» → выберите файл <code>.conf</code></FineNote>
      </>,
      <>Придумайте имя туннелю и нажмите <strong>«Сохранить»</strong></>,
      <>Нажмите тумблер → появится запрос, нажмите <strong>«Разрешить»</strong></>,
    ];
    else if (os==="android") steps = [
      <>Установите <strong>WireGuard</strong> из Google Play или скачайте <code>.apk</code> с wireguard.com</>,
      <>Откройте приложение, тапните по <strong>«+»</strong> внизу справа</>,
      <>
        Выберите <strong>«Сканировать из QR-кода»</strong> и наведите камеру на QR
        <FineNote>Или «Импорт из файла» → найдите <code>.conf</code> в загрузках</FineNote>
      </>,
      <>Дайте имя туннелю и подтвердите создание</>,
      <>Переключите тумблер вправо — разрешите создание VPN-подключения</>,
    ];
    else if (os==="windows") steps = [
      <>Скачайте <strong>WireGuard for Windows</strong> с <code>wireguard.com/install</code></>,
      <>Установите и откройте приложение</>,
      <>Нажмите <strong>«Импорт туннеля из файла»</strong> и выберите <code>.conf</code></>,
      <>Подтвердите создание туннеля</>,
      <>Нажмите <strong>«Подключить»</strong> — индикатор станет зелёным</>,
    ];
    else steps = [
      <>Установите <strong>WireGuard</strong> из Mac App Store</>,
      <>Откройте приложение в строке меню</>,
      <>Выберите <strong>«Импорт туннеля из файла»</strong> → <code>.conf</code></>,
      <>Подтвердите добавление профиля в Системные настройки</>,
      <>Включите тумблер и подтвердите системный запрос</>,
    ];
  } else {
    // Amnezia VPN (same flow across OS — slight wording variations)
    steps = [
      <>Скачайте приложение <strong>AmneziaVPN</strong> с <code>amnezia.org</code> или из стора своей платформы</>,
      <>Запустите приложение и согласитесь с условиями использования</>,
      <>
        Нажмите <strong>«Добавить конфигурацию»</strong> → <strong>«Сканировать QR-код»</strong>
        <FineNote>Или импорт ключа: вставьте строку вида <code>vpn://…</code></FineNote>
      </>,
      <>При запросе системы — разрешите создание VPN-профиля</>,
      <>Нажмите большую кнопку <strong>«Подключиться»</strong> — индикатор станет зелёным</>,
    ];
  }

  return (
    <Card padding={0} style={{overflow:"hidden"}}>
      <div style={{display:"flex", alignItems:"center", gap:14, padding:"22px 22px 18px"}}>
        <GlyphTile size={48} radius={14} gradient={t.color} icon={t.icon}/>
        <div>
          <h2 style={{margin:0, fontSize:20, fontWeight:700, letterSpacing:"-0.015em"}}>{t.name}</h2>
          <div style={{marginTop:3, fontSize:13.5, color:"var(--ink-3)"}}>{t.sub}</div>
        </div>
      </div>
      {steps.map((s,i)=><Step key={i} n={i+1}>{s}</Step>)}
      <SuccessStep>
        Тумблер зелёный — вы подключены. Значок VPN в строке статуса.
      </SuccessStep>
    </Card>
  );
}

function FineNote({ children }){
  return (
    <div style={{marginTop:10, padding:"10px 14px", borderRadius:12,
      background:"var(--bg-tint)", border:"1px solid var(--line-2)",
      fontSize:13.5, color:"var(--ink-3)"}}>
      {children}
    </div>
  );
}

// ───────── Region change steps ─────────
function RegionCard({ os }){
  const cfg = {
    ios:{name:"Смена региона App Store на iPhone", sub:"iOS · Apple ID", color:"linear-gradient(160deg,#ffd166,#ff9500)"},
    android:{name:"Смена региона Google Play", sub:"Android · Google аккаунт", color:"linear-gradient(160deg,#7ce0a2,#2cb67d)"},
    windows:{name:"Смена региона Microsoft Store", sub:"Windows 10 / 11", color:"linear-gradient(160deg,#7ec2ff,#0a84ff)"},
    macos:{name:"Смена региона Mac App Store", sub:"macOS", color:"linear-gradient(160deg,#bdbdc0,#6e6e73)"},
  };
  const t = cfg[os] || cfg.ios;
  let steps;
  if (os==="ios" || os==="macos") steps = [
    <>Подключите VPN к серверу нужной страны</>,
    <>Откройте <strong>«Настройки»</strong> → ваше имя → <strong>«Медиаматериалы и покупки»</strong></>,
    <>Нажмите <strong>«Просмотреть учётную запись»</strong> → подтвердите вход</>,
    <>Тапните <strong>«Страна или регион»</strong> → <strong>«Изменить страну или регион»</strong></>,
    <>Выберите страну, примите условия, заполните адрес и способ оплаты <strong>«Нет»</strong></>,
  ];
  else if (os==="android") steps = [
    <>Подключите VPN к серверу нужной страны</>,
    <>Очистите кеш и данные <strong>Google Play Store</strong> в настройках устройства</>,
    <>Откройте Play Store → меню → <strong>«Настройки» → «Общие» → «Настройки аккаунта»</strong></>,
    <>Выберите <strong>«Страна и профили»</strong>, подтвердите смену</>,
    <>Дождитесь до 24 часов и проверьте — регион обновится</>,
  ];
  else steps = [
    <>Подключите VPN к серверу нужной страны</>,
    <>Откройте <strong>«Параметры» → «Время и язык» → «Язык и регион»</strong></>,
    <>В разделе <strong>«Страна или регион»</strong> выберите нужную страну</>,
    <>Перезапустите Microsoft Store</>,
    <>Войдите заново под нужным аккаунтом</>,
  ];
  return (
    <Card padding={0} style={{overflow:"hidden"}}>
      <div style={{display:"flex", alignItems:"center", gap:14, padding:"22px 22px 18px"}}>
        <GlyphTile size={48} radius={14} gradient={t.color} glyph="🛍️"/>
        <div>
          <h2 style={{margin:0, fontSize:20, fontWeight:700, letterSpacing:"-0.015em"}}>{t.name}</h2>
          <div style={{marginTop:3, fontSize:13.5, color:"var(--ink-3)"}}>{t.sub}</div>
        </div>
      </div>
      {steps.map((s,i)=><Step key={i} n={i+1}>{s}</Step>)}
      <SuccessStep>
        Регион изменён — теперь доступны приложения этой страны.
      </SuccessStep>
    </Card>
  );
}

// ───────── Verify section ─────────
function VerifySection(){
  return (
    <section style={{marginTop:48, maxWidth:1020, marginLeft:"auto", marginRight:"auto", padding:"0 28px"}}>
      <h3 style={{margin:"0 0 16px", fontSize:20, fontWeight:700, letterSpacing:"-0.015em"}}>
        Как проверить, что VPN работает?
      </h3>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14}}>
        {[
          {n:1, text:<>Откройте <code style={cstyle()}>2ip.ru</code> или <code style={cstyle()}>whatismyip.com</code></>},
          {n:2, text:<>Страна должна измениться на страну вашего сервера</>},
          {n:3, text:<>Попробуйте открыть нужный сайт — загрузится</>},
        ].map(c=>(
          <Card key={c.n} padding={18}>
            <div style={{display:"flex", alignItems:"flex-start", gap:12}}>
              <div style={{
                width:30, height:30, borderRadius:999, flexShrink:0,
                background:"var(--accent-soft)", color:"var(--accent-2)",
                display:"grid", placeItems:"center", fontWeight:700, fontSize:14
              }}>{c.n}</div>
              <div style={{fontSize:14.5, lineHeight:1.55, color:"var(--ink)"}}>{c.text}</div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
function cstyle(){
  return { background:"var(--bg-tint)", border:"1px solid var(--line)",
    padding:"2px 8px", borderRadius:8, fontSize:12.5, color:"var(--ink-2)" };
}

// ───────── Troubleshooting ─────────
function Troubleshooting(){
  const items = [
    { title:"VPN не подключается", icon:"refresh", color:"linear-gradient(160deg,#ff8a8a,#ff3b30)", points:[
      "Перезапустите приложение",
      "Выключите/включите Wi-Fi или мобильный интернет",
      "Удалите туннель и добавьте конфиг заново",
      "Попробуйте другую сеть",
    ]},
    { title:"VPN включён, нет интернета", icon:"globe", color:"linear-gradient(160deg,#ffd166,#ff9500)", points:[
      "Отключитесь и подключитесь снова",
      "Убедитесь, что конфиг актуальный",
      "Перезагрузите устройство",
      "Напишите в поддержку",
    ]},
    { title:"Сайты не открываются", icon:"search", color:"linear-gradient(160deg,#7ec2ff,#0a84ff)", points:[
      "Очистите кеш браузера",
      "Смените DNS на 1.1.1.1",
      "Откройте в режиме инкогнито",
      "Попробуйте другой браузер",
    ]},
    { title:"Медленная скорость", icon:"gauge", color:"linear-gradient(160deg,#a385ff,#6a44f5)", points:[
      "Проверьте скорость без VPN",
      "Переподключитесь",
      "Закройте лишние приложения",
      "Переключитесь Wi-Fi ↔ 4G",
    ]},
  ];
  return (
    <section style={{marginTop:40, maxWidth:1020, marginLeft:"auto", marginRight:"auto", padding:"0 28px"}}>
      <h3 style={{margin:"0 0 16px", fontSize:20, fontWeight:700, letterSpacing:"-0.015em"}}>
        Что делать, если что-то пошло не так
      </h3>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14}}>
        {items.map(it=>(
          <Card key={it.title} padding={18}>
            <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
              <GlyphTile size={32} radius={10} gradient={it.color} icon={it.icon}/>
              <div style={{fontSize:14.5, fontWeight:700, letterSpacing:"-0.005em"}}>{it.title}</div>
            </div>
            <ul style={{margin:0, padding:0, listStyle:"none", display:"flex",
              flexDirection:"column", gap:8}}>
              {it.points.map((p,i)=>(
                <li key={i} style={{display:"flex", alignItems:"flex-start", gap:8,
                  fontSize:13.5, color:"var(--ink-2)", lineHeight:1.45}}>
                  <span style={{width:5, height:5, borderRadius:999, background:"var(--accent)",
                    marginTop:7, flexShrink:0}}/>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ───────── Footer ─────────
function Footer(){
  return (
    <footer style={{maxWidth:760, margin:"56px auto 40px", padding:"0 28px", textAlign:"center"}}>
      <p style={{margin:0, fontSize:14, color:"var(--ink-2)"}}>
        Возникли проблемы с подключением — <a href="https://t.me/PCA_Amnezia_support_bot" target="_blank" rel="noreferrer" style={{color:"var(--accent-2)", fontWeight:600, display:"inline-flex", alignItems:"center", gap:6}}><Icon name="plane" size={14}/> напишите в Telegram-бот @PCA_Amnezia_support_bot</a>.
      </p>
      <p style={{margin:"10px 0 0", fontSize:12.5, color:"var(--ink-3)"}}>
        Страница только для приглашённых пользователей. Не передавайте конфиг третьим лицам.
      </p>
    </footer>
  );
}

// ───────── Main App ─────────
function ConnectApp(){
  const initialMode = (typeof URLSearchParams !== "undefined" && new URLSearchParams(location.search).get("mode") === "region")
    ? "region" : "connect";
  const [mode, setMode]    = useStateC(initialMode);   // connect | region
  const [protocol, setProtocol] = useStateC("wg");   // wg | awg
  const [os, setOs]        = useStateC("ios");

  useEffectC(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("mode") === "region") setMode("region");
  }, []);

  return (
    <div>
      <SiteNav brand="Кабинет студента" brandSub="VPN · РЕГИОН · AMNEZIA" />
      <Hero/>

      <div style={{maxWidth:880, margin:"0 auto", padding:"0 28px"}}>
        <ServerCard/>

        {/* Mode big segment */}
        <div style={{margin:"22px 0 14px"}}>
          <BigSegment value={mode} onChange={setMode} options={[
            {id:"connect", label:"Подключение VPN"},
            {id:"region", label:"Смена региона App Store"},
          ]}/>
        </div>

        {/* Protocol (only for connect mode) */}
        {mode==="connect" && (
          <div style={{marginBottom:14}}>
            <BigSegment value={protocol} onChange={setProtocol} options={[
              {id:"wg", label:"WireGuard", tag:"стандарт", tagTone:"blue"},
              {id:"awg", label:"Amnezia VPN", tag:"обход DPI", tagTone:"purple"},
            ]}/>
          </div>
        )}

        {/* OS */}
        <div style={{marginBottom:18}}>
          <OSTabs value={os} onChange={setOs}/>
        </div>

        {/* Steps */}
        {mode==="connect"
          ? <StepsCard protocol={protocol} os={os}/>
          : <RegionCard os={os}/>}
      </div>

      <VerifySection/>
      <Troubleshooting/>
      <Footer/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ConnectApp/>);
