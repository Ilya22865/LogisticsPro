#!/bin/bash

# ============================================
# CURL запросы для тестирования Logistics API
# ============================================
# 1. Добавление 5 водителей
# 2. Регистрация 5 пользователей
# 3. Создание 5 заказов для каждого пользователя (всего 25 заказов)
# ============================================

BASE_URL="http://localhost:5000/api"

echo "============================================"
echo "НАЧАЛО ВЫПОЛНЕНИЯ CURL ЗАПРОСОВ"
echo "============================================"

# ============================================
# 1. ДОБАВЛЕНИЕ ВОДИТЕЛЕЙ (5 водителей)
# ============================================
echo ""
echo "=== ДОБАВЛЕНИЕ ВОДИТЕЛЕЙ ==="
echo ""

# Водитель 1
echo "Добавление водителя 1..."
curl -X POST "${BASE_URL}/Driver/addDriver" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Иванов Иван Иванович",
    "phoneNumber": "+79001112233",
    "email": "hribanov222@gmail.com",
    "status": 0,
    "truck": {
      "modelName": "Volvo FH16",
      "registerNumber": "А111АА777"
    }
  }'
echo -e "\n"

# Водитель 2
echo "Добавление водителя 2..."
curl -X POST "${BASE_URL}/Driver/addDriver" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Петров Петр Петрович",
    "phoneNumber": "+79002223344",
    "email": "hribanov333@gmail.com",
    "status": 0,
    "truck": {
      "modelName": "Scania R450",
      "registerNumber": "Б222ББ777"
    }
  }'
echo -e "\n"

# Водитель 3
echo "Добавление водителя 3..."
curl -X POST "${BASE_URL}/Driver/addDriver" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Сидоров Сидор Сидорович",
    "phoneNumber": "+79003334455",
    "email": "hribanov444@gmail.com",
    "status": 0,
    "truck": {
      "modelName": "Mercedes Actros",
      "registerNumber": "В333ВВ777"
    }
  }'
echo -e "\n"

# Водитель 4
echo "Добавление водителя 4..."
curl -X POST "${BASE_URL}/Driver/addDriver" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Кузнецов Алексей Михайлович",
    "phoneNumber": "+79004445566",
    "email": "hribanov666@gmail.com",
    "status": 1,
    "truck": {
      "modelName": "MAN TGX",
      "registerNumber": "Г444ГГ777"
    }
  }'
echo -e "\n"

# Водитель 5
echo "Добавление водителя 5..."
curl -X POST "${BASE_URL}/Driver/addDriver" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Смирнов Дмитрий Александрович",
    "phoneNumber": "+79005556677",
    "email": "erennine713@gmail.com",
    "status": 0,
    "truck": {
      "modelName": "DAF XF",
      "registerNumber": "Д555ДД777"
    }
  }'
echo -e "\n"

# ============================================
# 2. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ (5 пользователей)
# ============================================
echo ""
echo "=== РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ ==="
echo ""

# Пользователь 1
echo "Регистрация пользователя 1..."
USER1_RESPONSE=$(curl -s -X POST "${BASE_URL}/Auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "ООО Ромашка",
    "email": "rmor3374@gmail.com",
    "nameOfCompany": "Ромашка",
    "password": "Password123!"
  }')
echo "$USER1_RESPONSE"
USER1_TOKEN=$(echo "$USER1_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Токен пользователя 1: ${USER1_TOKEN:0:50}..."
echo -e "\n"

# Пользователь 2
echo "Регистрация пользователя 2..."
USER2_RESPONSE=$(curl -s -X POST "${BASE_URL}/Auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "ИП Васильев",
    "email": "kken23661@gmail.com",
    "nameOfCompany": "Васильев и Ко",
    "password": "Password123!"
  }')
echo "$USER2_RESPONSE"
USER2_TOKEN=$(echo "$USER2_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Токен пользователя 2: ${USER2_TOKEN:0:50}..."
echo -e "\n"

# Пользователь 3
echo "Регистрация пользователя 3..."
USER3_RESPONSE=$(curl -s -X POST "${BASE_URL}/Auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "ООО Транспорт Плюс",
    "email": "babikbublik@gmail.com",
    "nameOfCompany": "Транспорт Плюс",
    "password": "Password123!"
  }')
echo "$USER3_RESPONSE"
USER3_TOKEN=$(echo "$USER3_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Токен пользователя 3: ${USER3_TOKEN:0:50}..."
echo -e "\n"

# ============================================
# 3. СОЗДАНИЕ ЗАКАЗОВ (по 5 заказов для каждого пользователя = 25 заказов)
# ============================================
echo ""
echo "=== СОЗДАНИЕ ЗАКАЗОВ ==="
echo ""

# ----- ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ 1 -----
echo "--- Заказы пользователя 1 (ООО Ромашка) ---"

echo "Заказ 1-1..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER1_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Москва",
      "endLocation": "Санкт-Петербург",
      "deliveryDate": "2025-02-15T10:00:00"
    },
    "cargos": [
      {
        "description": "Электроника",
        "cargoWeight": 500,
        "cargoType": 3
      }
    ],
    "addtitionalInfo": "Срочная доставка"
  }'
echo -e "\n"

echo "Заказ 1-2..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER1_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Москва",
      "endLocation": "Казань",
      "deliveryDate": "2025-02-20T14:00:00"
    },
    "cargos": [
      {
        "description": "Мебель",
        "cargoWeight": 1200,
        "cargoType": 0
      }
    ],
    "addtitionalInfo": "Хрупкий груз"
  }'
echo -e "\n"

echo "Заказ 1-3..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER1_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Санкт-Петербург",
      "endLocation": "Екатеринбург",
      "deliveryDate": "2025-02-25T09:00:00"
    },
    "cargos": [
      {
        "description": "Продукты питания",
        "cargoWeight": 800,
        "cargoType": 5
      }
    ],
    "addtitionalInfo": "Рефрижератор"
  }'
echo -e "\n"

echo "Заказ 1-4..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER1_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Новосибирск",
      "endLocation": "Владивосток",
      "deliveryDate": "2025-03-01T12:00:00"
    },
    "cargos": [
      {
        "description": "Запчасти",
        "cargoWeight": 300,
        "cargoType": 0
      }
    ],
    "addtitionalInfo": ""
  }'
echo -e "\n"

echo "Заказ 1-5..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER1_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Москва",
      "endLocation": "Минск",
      "deliveryDate": "2025-03-05T08:00:00"
    },
    "cargos": [
      {
        "description": "Одежда",
        "cargoWeight": 250,
        "cargoType": 0
      }
    ],
    "addtitionalInfo": "Доставка до склада"
  }'
echo -e "\n"

# ----- ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ 2 -----
echo "--- Заказы пользователя 2 (ИП Васильев) ---"

echo "Заказ 2-1..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER2_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Краснодар",
      "endLocation": "Сочи",
      "deliveryDate": "2025-02-18T11:00:00"
    },
    "cargos": [
      {
        "description": "Стройматериалы",
        "cargoWeight": 2000,
        "cargoType": 1
      }
    ],
    "addtitionalInfo": "Крупногабаритный груз"
  }'
echo -e "\n"

echo "Заказ 2-2..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER2_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Ростов-на-Дону",
      "endLocation": "Волгоград",
      "deliveryDate": "2025-02-22T15:00:00"
    },
    "cargos": [
      {
        "description": "Зерно",
        "cargoWeight": 5000,
        "cargoType": 1
      }
    ],
    "addtitionalInfo": ""
  }'
echo -e "\n"

echo "Заказ 2-3..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER2_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Уфа",
      "endLocation": "Челябинск",
      "deliveryDate": "2025-02-28T10:00:00"
    },
    "cargos": [
      {
        "description": "Металлопрокат",
        "cargoWeight": 3500,
        "cargoType": 0
      }
    ],
    "addtitionalInfo": "Требуется крепление"
  }'
echo -e "\n"

echo "Заказ 2-4..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER2_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Пермь",
      "endLocation": "Киров",
      "deliveryDate": "2025-03-03T13:00:00"
    },
    "cargos": [
      {
        "description": "Древесина",
        "cargoWeight": 4000,
        "cargoType": 0
      }
    ],
    "addtitionalInfo": ""
  }'
echo -e "\n"

echo "Заказ 2-5..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER2_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Самара",
      "endLocation": "Саратов",
      "deliveryDate": "2025-03-08T09:00:00"
    },
    "cargos": [
      {
        "description": "Оборудование",
        "cargoWeight": 1500,
        "cargoType": 3
      }
    ],
    "addtitionalInfo": "Осторожно, хрупкое!"
  }'
echo -e "\n"

# ----- ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ 3 -----
echo "--- Заказы пользователя 3 (ООО Транспорт Плюс) ---"

echo "Заказ 3-1..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER3_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Нижний Новгород",
      "endLocation": "Ярославль",
      "deliveryDate": "2025-02-17T10:00:00"
    },
    "cargos": [
      {
        "description": "Автозапчасти",
        "cargoWeight": 600,
        "cargoType": 0
      }
    ],
    "addtitionalInfo": ""
  }'
echo -e "\n"

echo "Заказ 3-2..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER3_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Воронеж",
      "endLocation": "Белгород",
      "deliveryDate": "2025-02-21T14:00:00"
    },
    "cargos": [
      {
        "description": "Бытовая химия",
        "cargoWeight": 450,
        "cargoType": 4
      }
    ],
    "addtitionalInfo": "Опасный груз"
  }'
echo -e "\n"

echo "Заказ 3-3..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER3_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Тула",
      "endLocation": "Калуга",
      "deliveryDate": "2025-02-26T11:00:00"
    },
    "cargos": [
      {
        "description": "Консервы",
        "cargoWeight": 900,
        "cargoType": 5
      }
    ],
    "addtitionalInfo": "Срок годности ограничен"
  }'
echo -e "\n"

echo "Заказ 3-4..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER3_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Тверь",
      "endLocation": "Псков",
      "deliveryDate": "2025-03-02T08:00:00"
    },
    "cargos": [
      {
        "description": "Книги",
        "cargoWeight": 350,
        "cargoType": 0
      }
    ],
    "addtitionalInfo": ""
  }'
echo -e "\n"

echo "Заказ 3-5..."
curl -X POST "${BASE_URL}/Order/addOrder" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER3_TOKEN}" \
  -d '{
    "route": {
      "startLocation": "Рязань",
      "endLocation": "Тамбов",
      "deliveryDate": "2025-03-07T12:00:00"
    },
    "cargos": [
      {
        "description": "Текстиль",
        "cargoWeight": 400,
        "cargoType": 0
      }
    ],
    "addtitionalInfo": "Не мочить"
  }'
echo -e "\n"

echo "============================================"
echo "ВСЕ ЗАПРОСЫ ВЫПОЛНЕНЫ"
echo "============================================"
echo ""
echo "Итого:"
echo "- 5 водителей добавлено"
echo "- 5 пользователей зарегистрировано"
echo "- 25 заказов создано (по 5 на каждого пользователя)"
echo ""
