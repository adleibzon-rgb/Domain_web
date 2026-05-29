# PCA Lab — Domain Web

Сайт PCA Lab: кабинет студента (VPN Amnezia), группы доменов, **поиск доменов** (CT, DNS, reverse IP, geosite/geoip, .bat для Keenetic).

## Установка одной командой

На свежем Ubuntu VPS (root):

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/install.sh | sudo bash
```

Скрипт автоматически:

- ставит **nginx** и отдаёт сайт на **порту 80** (HTTP);
- разворачивает **поиск доменов** (`/search`) и API (`/api/search`);
- клонирует [domain-finder-bot](https://github.com/andrey271192/domain-finder-bot) для логики discovery;
- **не трогает** Amnezia/Docker на **443**, существующий Telegram-бот и другие сервисы.

### Переменные окружения (опционально)

| Переменная | По умолчанию |
|------------|----------------|
| `DOMAIN_WEB_ROOT` | `/var/www/domain-web` |
| `DOMAIN_WEB_INSTALL_SRC` | `/opt/domain-web-src` |
| `DOMAIN_WEB_API_DIR` | `/opt/domain-web-api` |
| `DOMAIN_FINDER_BOT_DIR` | `/opt/domain-finder-bot` |
| `DOMAIN_WEB_BRANCH` | `main` |

## Страницы после установки

| URL | Описание |
|-----|----------|
| `/` | Главная PCA Lab |
| `/connect.html` | Кабинет студента — VPN Amnezia |
| `/connect.html?mode=region` | VPN по региону магазинов |
| `/domains.html` | Группы доменов + выбор + .bat |
| `/search` | Поиск доменов (как в Telegram-боте) |

## Прокси Telegram (редактируется без перезапуска)

```bash
nano /var/www/domain-web/data/site-config.json
```

Пример:

```json
{
  "server_ip": "YOUR_SERVER_IP",
  "telegram_proxy": "https://t.me/proxy?server=...&port=443&secret=...",
  "telegram_proxy_label": "Прокси Telegram"
}
```

Сохраните файл и обновите страницу кабинета — ссылка появится сразу.

## Удаление

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/uninstall.sh | sudo bash
```

## Структура репозитория

```
web/           — HTML + React (CDN) + JSX
api/           — FastAPI search API
nginx/         — vhost + proxy snippet
systemd/       — domain-web-api.service
install.sh     — полный деплой
uninstall.sh
```

## Локальный просмотр (только статика)

```bash
cd web && python3 -m http.server 8080
```

Поиск локально требует API (`/api/search` на сервере).

## Связанные проекты

- [domain-finder-bot](https://github.com/andrey271192/domain-finder-bot) — Telegram-бот с той же логикой поиска

## Лицензия

См. [LICENSE](LICENSE).
