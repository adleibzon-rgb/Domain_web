# Domain Web (PCA Lab)

Лёгкий статический сайт: кабинет студента (VPN Amnezia), смена региона магазинов, кураторские списки заблокированных в РФ доменов.

**Без поиска доменов** на сайте (crt.sh и API сканера отключены). Списки — статические пресеты.

## Возможности

- **Главная** — обложка PCA Lab (исследования AI и кибербезопасности)
- **Кабинет студента** — пошаговое подключение WireGuard / Amnezia VPN
- **VPN по региону** — инструкции смены региона App Store / Google Play / Microsoft Store
- **Группы доменов** — карточки по категориям:
  - Медиа (Netflix, YouTube, …)
  - Социальные сети (Instagram, Facebook, X, …)
  - Искусственный интеллект (ChatGPT, Claude, …)
  - Мессенджеры (Telegram, WhatsApp, …)
  - Другое / VPN / Dev (GitHub, Steam, …)
- Копирование списка доменов / IP, скачивание **Keenetic .bat** (статические маршруты)

Связанный Telegram-бот (поиск доменов): [domain-finder-bot](https://github.com/andrey271192/domain-finder-bot) — на сайте только статика.

## Установка на VPS (одна строка)

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/install.sh | sudo bash
```

Переменные окружения (опционально):

| Переменная | По умолчанию |
|------------|----------------|
| `DOMAIN_WEB_ROOT` | `/var/www/domain-web` |
| `DOMAIN_WEB_INSTALL_SRC` | `/opt/domain-web-src` |
| `DOMAIN_WEB_BRANCH` | `main` |

Скрипт:

- ставит **nginx** и отдаёт каталог `web/` на **порту 80**;
- **не останавливает** Amnezia (443), Docker и `domain-finder-bot`;
- отключает legacy-сервис `domain-scanner` (Node), если был установлен ранее.

## Удаление

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/uninstall.sh | sudo bash
```

## Локальный просмотр

```bash
cd web && python3 -m http.server 8080
# http://127.0.0.1:8080/
```

## Структура

```
web/           — HTML + React (CDN) + JSX
nginx/         — шаблон vhost
install.sh     — деплой на сервер
uninstall.sh
```

## Лицензия

См. [LICENSE](LICENSE).
