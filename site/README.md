# GeoExport — локальная копия

Зеркало интерфейса [geoexport.org](https://geoexport.org/): экспорт списков geoip/geosite для VPN-клиентов (Xray, 3x-ui, V2Ray).

## Запуск

```bash
cd ~/geoexport-clone
npm start
```

Откройте в браузере: **http://127.0.0.1:4173**

Другой порт: `PORT=8080 npm start`

## Состав

| Путь | Назначение |
|------|------------|
| `index.html` | Точка входа SPA |
| `assets/` | Собранный фронтенд (React + Tailwind) с оригинала |
| `data/*.json` | Кэш API: пресеты, источники, дата обновления |
| `server.mjs` | Локальный сервер: статика + JSON + прокси динамических API |

## Обновление данных

```bash
curl -sL https://geoexport.org/api/presets -o data/presets.json
curl -sL https://geoexport.org/api/sources -o data/sources.json
curl -sL https://geoexport.org/api/last-update -o data/last-update.json
curl -sL https://geoexport.org/api/routing/presets -o data/routing-presets.json
```

## Патч экспорта

Перед запуском применяется `patch-bundle.mjs` (превью/скачивание, Keenetic, пустые ответы API).

```bash
npm start   # prestart → patch автоматически
```

Карточка про Telegram-бота `@domain_searchPro_bot` — `assets/telegram-bot.js`.

## Ограничения

- Экспорт, поиск, DNS lookup и генерация routing проксируются на живой `geoexport.org` (нужен интернет).
- Это копия UI и кэшированных справочников, не полный автономный бэкенд с базами `.dat`.
