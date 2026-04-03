-- Изменяем CompanyId на NULLABLE
ALTER TABLE Users MODIFY COLUMN CompanyId int NULL;

-- Пересоздаем внешний ключ с ON DELETE SET NULL вместо ON DELETE CASCADE
ALTER TABLE Users DROP FOREIGN KEY FK_Users_Companies_CompanyId;
ALTER TABLE Users ADD CONSTRAINT FK_Users_Companies_CompanyId FOREIGN KEY (CompanyId) REFERENCES Companies (CompanyId) ON DELETE SET NULL;

-- Создаем таблицу миграций если не существует
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

-- Добавляем запись о миграции
INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260402071928_InitialCreate', '8.0.0')
ON DUPLICATE KEY UPDATE ProductVersion = ProductVersion;
