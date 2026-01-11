# 💚 CharityChain
Прозрачная блокчейн-платформа для благотворительности с NFT-наградами доноров

Проект для кейса «Блокчейн для благотворительности» на хакатоне Singularity («Блокчейн разработка»).

![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Polygon](https://img.shields.io/badge/Polygon-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MetaMask](https://img.shields.io/badge/MetaMask-F6851B?style=for-the-badge&logo=metamask&logoColor=white)
![ERC-721](https://img.shields.io/badge/ERC--721-3C3C3D?style=for-the-badge)
![ERC-2981](https://img.shields.io/badge/ERC--2981-3C3C3D?style=for-the-badge)

---

## 📋 Описание проекта
CharityChain — платформа для прозрачного сбора пожертвований с мотивацией доноров. Каждый донат фиксируется в блокчейне, а донор получает NFT-токен благодарности. В зависимости от суммы пожертвования минтится NFT уровня (Bronze → Diamond). Дополнительно реализован механизм устойчивого финансирования: при перепродаже NFT часть роялти автоматически направляется в фонд (ERC-2981).

Наше преимущество — рабочая и протестированная end-to-end система, а не только идея или mockup: смарт-контракты + скрипты деплоя/взаимодействия + backend + задел под frontend.

---

## 🏆 Достижения
- 🥉 3 место на хакатоне Singularity («Блокчейн разработка»), кейс «Блокчейн для благотворительности»
- 💰 Приз: 50 000 ₽
- ✅ Полноценный прототип: контракты + деплой/тесты + API + фронтенд (в разработке)

---

## 🎯 Целевая аудитория
- Благотворительные фонды и НКО — создание и управление кампаниями, публичная отчётность
- Доноры — прозрачные пожертвования и NFT-награды за вклад
- Аудиторы / партнёры — проверка движения средств и отчётность
- Комьюнити — вторичный рынок NFT (с возвратом части комиссии в фонд через роялти)

---

## ✨ Ключевые возможности

### 🧾 Прозрачные кампании и донаты
- создание благотворительных кампаний
- сбор пожертвований с фиксацией в блокчейне
- проверяемая история транзакций и прозрачность движения средств

### 🪪 NFT-награды доноров (ERC-721)
- минт NFT за пожертвование
- уровни NFT в зависимости от суммы: Bronze → Silver → Gold → Platinum → Diamond (логика уровней настраивается)
- база для будущей геймификации донатов и системы статусов доноров

### 💸 Роялти для фонда (ERC-2981)
- встроенная поддержка роялти
- при перепродаже NFT часть комиссии автоматически поступает в фонд
- механизм устойчивого финансирования: фонд получает средства не только от первичных донатов, но и от вторичного рынка

### 🧩 Скрипты и энд-ту-энд взаимодействие
- interact.js — взаимодействие с контрактами (чтение/вызовы)
- quick-test.js — быстрые end-to-end проверки
- deploy-amoy.js — деплой и тестирование в Polygon Amoy

### 🌐 Web-интерфейс (в разработке)
- React-приложение
- подключение MetaMask
- удобный UX для доноров и фондов

---

## 🏗️ Архитектура системы

Компоненты (упрощённо)

```
┌─────────────────────────┐
│        Frontend         │
│   React + MetaMask      │
│   (в разработке)        │
└───────────┬─────────────┘
            │ вызовы API / чтение данных / транзакции
            ▼
┌─────────────────────────┐
│         Backend          │
│ FastAPI + SQLAlchemy     │
│ PostgreSQL (данные UI)   │
└───────────┬─────────────┘
            │ работа с адресами, кампаниями, отображением данных
            ▼
┌─────────────────────────┐
│       Blockchain         │
│ Polygon (Amoy)           │
│ Donation.sol             │
│ DonationNFT.sol          │
└─────────────────────────┘
```

Поток доната
1. донор подключает MetaMask
2. отправляет донат в контракт Donation.sol
3. контракт минтит DonationNFT.sol с уровнем награды
4. UI/скрипты отображают транзакции, NFT и прогресс кампании

---

## 🧱 Смарт-контракты

### Donation.sol
- обрабатывает кампании
- принимает пожертвования (донаты)
- распределяет/учитывает средства по логике проекта

### DonationNFT.sol
- выпускает NFT по стандарту ERC-721
- уровни NFT: Bronze → Diamond (в зависимости от суммы доната)
- поддержка роялти ERC-2981
- при перепродаже NFT часть комиссии поступает в фонд

---

## 💻 Технологический стек

### Blockchain
- Solidity
- ERC-721 (NFT)
- ERC-2981 (роялти)
- Polygon Amoy (тестовая сеть)

### Backend
- Python
- FastAPI
- PostgreSQL
- SQLAlchemy

### Frontend
- React
- MetaMask (в разработке)

---

## 🚀 Установка и запуск

### Требования
- Node.js 18+ / 20+
- Python 3.10+ (рекомендуется 3.11+)
- PostgreSQL (локально или в Docker)
- MetaMask (для web-части)
- RPC_URL и PRIVATE_KEY (если деплоишь контракты)

---

### 1) Клонирование репозитория
```bash
git clone https://github.com/ntsupkov/CharityChainProject.git
cd CharityChainProject
```

---

### 2) Запуск Backend (FastAPI)

Пример (если backend лежит в папке `app/`):

```bash
cd app
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows (PowerShell)
# venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn main:app --reload
```

Если у тебя другой entrypoint (например `app/main.py` или другое имя приложения), поправь команду `uvicorn` под свою структуру.

---

### 3) Запуск Frontend (React)

Если фронтенд запускается из корня проекта:

```bash
npm install
npm run dev
```

Если фронтенд лежит в отдельной папке (например `frontend/`) — выполни команды внутри неё.

---

### 4) Смарт-контракты (Solidity / Polygon Amoy)

Папка: `charity-blockchain/`

Типовой сценарий:

1. установить зависимости
2. настроить `.env`
3. задеплоить в тестовую сеть
4. проверить взаимодействие

```bash
cd charity-blockchain
npm install
```

Пример `.env` (названия переменных могут отличаться — ориентируйся на свои скрипты):

```env
RPC_URL=YOUR_POLYGON_AMOY_RPC
PRIVATE_KEY=YOUR_PRIVATE_KEY
```

Деплой (как реализовано в проекте):

```bash
node deploy-amoy.js
```

Взаимодействие / быстрые проверки:

```bash
node interact.js
node quick-test.js
```

---

## 📁 Структура проекта

```
CharityChainProject/
├── app/                  # Backend (FastAPI)
├── charity-blockchain/   # Smart contracts + scripts (deploy/interact/tests)
├── node_modules/         # (не рекомендуется коммитить)
├── package.json          # Frontend (React)
├── package-lock.json
└── README.md
```

Рекомендация: добавить `node_modules/` и `venv/` в `.gitignore`.

---

## 👥 Команда проекта

- Цупков Николай (НИТУ МИСИС, БИВТ-23-9)
- Высочкин Егор (МГТУ им. Н. Э. Баумана)

---

## 🔮 Дальнейшее развитие

- завершить React UI и полноценную интеграцию MetaMask
- сделать индексатор событий (например, listener / The Graph) для удобной истории донатов и кампаний
- добавить хранение метаданных NFT через IPFS + pinning
- роли и верификация фондов (под требования заказчика/НКО)
- аудит смарт-контрактов и подготовка к mainnet-деплою
- расширить мотивацию доноров (бейджи, лидерборды, уровни, оффчейн-перки)

---

- Сайт/организатор: [https://singularity.family/](https://singularity.family/)

---

MIT License

Copyright (c) 2018 Yandex School of Data Analysis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
---

Сделано с 💚 для прозрачной благотворительности
