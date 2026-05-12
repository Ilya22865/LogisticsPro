# Docker для LogisticsPro

Этот документ описывает настройку и использование Docker контейнеров для проекта LogisticsPro.

## 📋 Что было добавлено

В проект добавлены следующие файлы для контейнеризации:

1. **`LogisticsWebAPI/Dockerfile`** - инструкция для сборки Docker образа ASP.NET Core приложения
2. **`docker-compose.yml`** - конфигурация для запуска всего стека (API + база данных)
3. **`.env.example`** - шаблон файла с переменными окружения

## 🏗️ Архитектура

Система состоит из двух сервисов:

```
┌─────────────────┐      ┌─────────────────┐
│   logistics_api │ ◄──► │   logistics_db  │
│  (ASP.NET Core) │      │    (MySQL 8.0)  │
│   Порт: 8080    │      │    Порт: 3306   │
└─────────────────┘      └─────────────────┘
```

### Сервис `db` (MySQL)
- Образ: `mysql:8.0`
- Порт: `3306`
- База данных: `logistics_db`
- Пользователь: `logistics_user`
- Данные сохраняются в volume `mysql_data` (не теряются при перезапуске)

### Сервис `api` (LogisticsPro API)
- Образ: собирается из `Dockerfile`
- Порт: `8080`
- Зависит от сервиса `db`
- Подключается к MySQL через внутреннюю сеть Docker

## 🚀 Быстрый старт

### Шаг 1: Подготовка переменных окружения

Создайте файл `.env` в корне проекта на основе шаблона:

```bash
cp .env.example .env
```

При необходимости отредактируйте значения в файле `.env`, особенно:
- `JWT_KEY` - должен быть сложным и уникальным
- `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` - если используете Google OAuth

### Шаг 2: Запуск контейнеров

Для первого запуска выполните:

```bash
docker-compose up --build
```

Команда:
- Скачает необходимые образы (MySQL, .NET SDK)
- Соберёт образ приложения
- Запустит оба сервиса

### Шаг 3: Проверка работы

После запуска проверьте доступность API:

```bash
curl http://localhost:8080/api/order
```

Или откройте в браузере: `http://localhost:8080`

## 📝 Основные команды

| Команда | Описание |
|---------|----------|
| `docker-compose up` | Запустить контейнеры в фоновом режиме |
| `docker-compose up --build` | Пересобрать и запустить контейнеры |
| `docker-compose down` | Остановить и удалить контейнеры |
| `docker-compose down -v` | Остановить и удалить контейнеры с данными (БД очистится!) |
| `docker-compose ps` | Показать статус контейнеров |
| `docker-compose logs api` | Показать логи API |
| `docker-compose logs db` | Показать логи базы данных |
| `docker-compose logs -f api` | Показать логи API в реальном времени |

## 🔧 Применение миграций

После первого запуска необходимо применить миграции базы данных:

```bash
# Подключиться к контейнеру API
docker-compose exec api dotnet ef database update
```

Или создать новую миграцию:

```bash
docker-compose exec api dotnet ef migrations add MigrationName
```

## 🛠️ Разработка в Docker

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Только API
docker-compose logs -f api

# Только БД
docker-compose logs -f db
```

### Подключение к базе данных

Из хост-системы (Linux):

```bash
mysql -h localhost -P 3306 -u logistics_user -plogistics123 logistics_db
```

Из контейнера API:

```bash
docker-compose exec api mysql -h db -u logistics_user -plogistics123 logistics_db
```

### Выполнение команд внутри контейнера

```bash
# Открыть bash в контейнере API
docker-compose exec api bash

# Выполнить команду без входа в контейнер
docker-compose exec api dotnet --info
```

## 🔐 Безопасность

### Важные замечания:

1. **Измените пароли по умолчанию** перед развёртыванием на продакшене
2. **Не коммитьте файл `.env`** в репозиторий (он уже в `.gitignore`)
3. **Используйте сложные JWT ключи** (минимум 32 символа)
4. Для продакшена настройте HTTPS и используйте secrets management

## ⚙️ Настройка переменных окружения

Все настройки вынесены в переменные окружения:

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `DB_ROOT_PASSWORD` | Пароль root MySQL | `8044` |
| `DB_PASSWORD` | Пароль пользователя приложения | `logistics123` |
| `JWT_KEY` | Секретный ключ для JWT | (требуется задать) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | (опционально) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | (опционально) |

## 🐛 Решение проблем

### Контейнер не запускается

Проверьте логи:
```bash
docker-compose logs api
```

### Ошибка подключения к БД

Убедитесь, что БД готова:
```bash
docker-compose logs db | grep "ready for connections"
```

### Порт уже занят

Освободите порт или измените в `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Изменить первый порт
```

### Сброс базы данных

⚠️ **Внимание!** Это удалит все данные:

```bash
docker-compose down -v
docker-compose up --build
```

## 📊 Мониторинг

### Проверка состояния сервисов

```bash
docker-compose ps
```

### Использование ресурсов

```bash
docker stats
```

### Размер образа

```bash
docker images | grep logistics
```

## 🎯 Следующие шаги

1. Настройте CI/CD пайплайн для автоматической сборки образов
2. Добавьте мониторинг (Prometheus + Grafana)
3. Настройте резервное копирование базы данных
4. Рассмотрите использование reverse proxy (Nginx/Traefik) для продакшена

## 📚 Полезные ссылки

- [Docker Compose документация](https://docs.docker.com/compose/)
- [.NET Docker образы](https://hub.docker.com/_/microsoft-dotnet)
- [MySQL Docker образ](https://hub.docker.com/_/mysql)
