(function () {
  const CARD =
    '<div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 shadow-sm p-4 text-sm text-slate-700 dark:text-slate-300">' +
    '<div class="font-medium text-slate-900 dark:text-slate-100 mb-1">Telegram-бот для поиска доменов</div>' +
    '<p class="text-xs leading-relaxed mb-2">' +
    "Если удобнее с телефона или нужен быстрый поиск без браузера — попробуйте " +
    '<a href="https://t.me/domain_searchPro_bot" target="_blank" rel="noopener noreferrer" class="font-mono text-blue-600 dark:text-blue-400 hover:underline">@domain_searchPro_bot</a>. ' +
    "Тот же смысл: найти домен, посмотреть IP и выгрузить списки, только в Telegram." +
    "</p>" +
    '<a href="https://t.me/domain_searchPro_bot" target="_blank" rel="noopener noreferrer" ' +
    'class="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">' +
    "Открыть бота →</a></div>";

  function inject() {
    if (document.querySelector("[data-telegram-bot-card]")) return;
    const host = document.querySelector(".max-w-3xl.mx-auto");
    if (!host) return;
    const wrap = document.createElement("div");
    wrap.setAttribute("data-telegram-bot-card", "");
    wrap.className = "mt-4 mb-2";
    wrap.innerHTML = CARD;
    host.appendChild(wrap);
  }

  const obs = new MutationObserver(() => inject());
  obs.observe(document.body, { childList: true, subtree: true });
  inject();
})();
