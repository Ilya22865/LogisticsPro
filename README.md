# 🚚 LogisticsPro

**LogisticsPro** — это современная серверная платформа (Backend) для автоматизации работы логистической компании. Система предоставляет надежный REST API для управления заказами, автопарком, водителями и клиентами, обеспечивая безопасную аутентификацию и эффективную обработку данных в реальном времени.

Проект разработан в рамках учебной практики с использованием стека **.NET 8**, **ASP.NET Core Web API** и **MySQL**.

## 🌟 Основные возможности

- **Управление заказами**: Полный цикл обработки заявок (создание, изменение статусов, назначение водителей и транспорта).
- **Управление ресурсами**: Учет водителей, грузовиков (марки, грузоподъемность) и маршрутов.
- **Безопасность и доступ**:
  - JWT-аутентификация с разделением ролей (Клиент / Администратор / Водитель).
  - Интеграция с **Google OAuth 2.0** для быстрого входа.
  - Валидация email через внешние сервисы (Hunter.io).
- **API First**: Архитектура, ориентированная на легкую интеграцию с любыми клиентскими приложениями (Web, Mobile, Desktop).
- **Чистая архитектура**: Разделение на слои (Controllers, Services, DTOs, Models) для высокой поддерживаемости кода.

## 🛠 Технологический стек

| Категория | Технологии |
| :--- | :--- |
| **Платформа** | .NET 8, ASP.NET Core Web API |
| **База данных** | MySQL 8.0, Entity Framework Core (Code First) |
| **Безопасность** | JWT Bearer, Google Authentication, BCrypt |
| **Архитектура** | REST, Dependency Injection, Repository Pattern |
| **Инструменты** | Git, Docker (опционально), Swagger/OpenAPI |

## 🚀 Быстрый старт

### Требования
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [MySQL Server](https://dev.mysql.com/downloads/) (версия 8.0 или выше)
- Git

### 1. Клонирование репозитория
bash
git clone https://github.com/ТВОЙ_НИКНЕЙМ/LogisticsPro.git
cd LogisticsPro

Обновите строку подключения в файле LogisticsWebAPI/appsettings.json:
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=LogisticsProDB;User Id=root;Password=ВАШ_ПАРОЛЬ;"
}

Структура проекта.
LogisticsPro/
├── LogisticsWebAPI/
│   ├── Controllers/      # Обработка HTTP запросов (Endpoints)
│   ├── Models/           # Сущности базы данных (EF Core)
│   ├── DTOs/             # Объекты передачи данных (Request/Response)
│   ├── Services/         # Бизнес-логика и интерфейс сервисов
│   ├── Migrations/       # Миграции EF Core (история БД)
│   ├── Program.cs        # Точка входа, настройка DI и Middleware
│   └── appsettings.json  # Конфигурация приложения
└── Frontend/             # Статические файлы клиентской части (если есть)
