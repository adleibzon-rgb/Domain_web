# Domain_web — зеркало GeoExport

Статическая копия интерфейса [geoexport.org](https://geoexport.org/) для развёртывания на VPS (nginx + Node.js).

## Быстрая установка (одна команда)

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/install.sh | sudo bash
```

**URL скрипта установки:**  
https://raw.githubusercontent.com/andrey271192/Domain_web/main/install.sh

## Удаление (одна команда)

```bash
curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/uninstall.sh | sudo bash
```

**URL скрипта удаления:**  
https://raw.githubusercontent.com/andrey271192/Domain_web/main/uninstall.sh

## Что устанавливается

| Компонент | Путь / имя |
|-----------|------------|
| Клон репозитория | `/opt/domain_web` |
| Файлы сайта | `/opt/domain_web/site/` |
| Node-сервер (API + статика) | systemd `geoexport-site`, порт `127.0.0.1:4173` |
| Публичный доступ | nginx на порту **80** → прокси на Node |

Скрипт установки:

- ставит `nginx`, `git`, `curl`, `nodejs` (если нет);
- клонирует или обновляет этот репозиторий;
- поднимает `geoexport-site.service`;
- настраивает nginx как reverse proxy.

Скрипт удаления:

- останавливает и удаляет unit `geoexport-site`;
- убирает конфиг nginx `geoexport-site`;
- удаляет каталог `/opt/domain_web`;
- **не** удаляет nginx, node и остальные сервисы сервера.

## Ручная установка

```bash
git clone https://github.com/andrey271192/Domain_web.git /opt/domain_web
cd /opt/domain_web
sudo bash install.sh
```

## Локальный запуск (без VPS)

```bash
cd site
npm start
# http://127.0.0.1:4173
```

## Обновление данных на сервере

```bash
cd /opt/domain_web/site
curl -fsSL https://geoexport.org/api/presets -o data/presets.json
curl -fsSL https://geoexport.org/api/sources -o data/sources.json
curl -fsSL https://geoexport.org/api/last-update -o data/last-update.json
curl -fsSL https://geoexport.org/api/routing/presets -o data/routing-presets.json
systemctl restart geoexport-site
```

## Ограничения

- Экспорт, поиск и часть API проксируются на живой `geoexport.org` (нужен интернет на VPS).
- Это зеркало UI и кэшированных справочников, не полный автономный бэкенд.

## Premium (Next.js roadmap)

Каталог `premium/` — Next.js 16 scaffold (Docker, docs, `docker-compose.yml`). Продакшен на VPS сейчас использует **статическое зеркало** в `site/` (nginx + Node). Полный Next.js-стек — по `premium/docs/DEPLOYMENT.md`.

## Структура репозитория

```
install.sh      — установка на VPS
uninstall.sh    — удаление с VPS
site/           — index.html, assets/, data/, server.mjs (production)
premium/        — Next.js rewrite, Docker, документация (roadmap)
```
