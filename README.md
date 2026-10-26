# 🎨 ArtMix — REST API социальной платформы

Backend-приложение на **Java 21 + Spring Boot 3**: регистрация и JWT-аутентификация, публикации (посты), **чат в реальном времени** на WebSocket (STOMP) и приём платежей через **PayPal** и **YooMoney**.

Проект сделан как MVP для портфолио: только серверная часть (REST API + WebSocket), без фронтенда.

## 📋 Содержание

- [Возможности](#-возможности)
- [Технологии](#-технологии)
- [Архитектура](#-архитектура)
- [Модель данных](#-модель-данных)
- [Запуск проекта](#-запуск-проекта)
- [Конфигурация](#-конфигурация)
- [API](#-api)
- [Чат (WebSocket)](#-чат-websocket)
- [Примеры запросов](#-примеры-запросов)
- [Особенности реализации](#-особенности-реализации)
- [Планы развития](#-планы-развития)

## ✨ Возможности

- Регистрация и вход по логину и паролю, аутентификация через **JWT**
- Публикации: создание, редактирование и удаление своих постов, просмотр поста по ID
- Публичная лента постов (от новых к старым)
- Личные чаты между пользователями в реальном времени (WebSocket + STOMP) с хранением истории в БД
- Создание платежей через **PayPal** (sandbox) и **YooMoney** с редиректом пользователя обратно на фронтенд
- Централизованная обработка ошибок (`@RestControllerAdvice`) и валидация входных данных

## 🛠 Технологии

| Категория | Стек |
|---|---|
| Язык | Java 21 |
| Фреймворк | Spring Boot 3.5.6 (Web, Data JPA, Security, Validation, WebSocket) |
| База данных | PostgreSQL |
| Безопасность | Spring Security, JWT (jjwt 0.12.6), BCrypt (strength 12) |
| Реальное время | WebSocket, STOMP, SockJS |
| Платежи | PayPal REST SDK, YooMoney API (через `RestTemplate`) |
| Сборка | Maven |
| Прочее | Lombok, Jackson |

## 🏗 Архитектура

```
Controller  →  Service  →  Repository  →  PostgreSQL
    ↓             ↓
   DTO        Mapper (Entity ↔ DTO)

WebSocket (STOMP)  →  ChatController  →  ChatMessageService  →  PostgreSQL
Payment API        →  PaymentController  →  PaypalService / YooMoneyService
```

Структура проекта:

```
com.example.artmix
├── chat
│   ├── chatMessage/        # ChatController, ChatMessage, ChatMessageService, ChatNotifications, репозиторий
│   └── chatRoom/           # ChatRoom, ChatRoomService, репозиторий
├── config/                 # SecurityConfiguration, JwtFilter, WebSocketConfig
├── controller/             # UserController, PostController
├── dto/                    # UserRequest/Response, PostRequest/Response (records)
├── exception/              # Кастомные исключения и GlobalExceptionHandler
├── mapper/                 # UserMapper, PostMapper
├── model/                  # Users, Posts, UserPrincipal, Status
├── payment/
│   ├── paypal_integration/ # PaypalConfig, PaypalService
│   ├── yoomoney_integration/ # YooMoneyService
│   └── PaymentController
├── repository/             # UserRepository, PostRepository
├── service/                # UserService, PostService, JWTService, MyUserDetailsService
└── ArtmixApplication
```

## 🗄 Модель данных

```
user_artmix (1) ───< (N) posts
chat           — сообщения чата (связь по chat_id)
chat_room      — комнаты чата (по одной записи на каждого участника)
```

| Таблица | Назначение | Основные поля |
|---|---|---|
| `user_artmix` | Пользователи | `id`, `email`, `password` (BCrypt), `username` |
| `posts` | Посты | `id`, `author_id`, `title`, `content`, `created_at` |
| `chat` | Сообщения | `id`, `chat_id`, `sender_id`, `recipient_id`, `content`, `timestamp` |
| `chat_room` | Комнаты чата | `id`, `chat_id`, `sender_id`, `recipient_id` |

Схема создаётся автоматически Hibernate (`ddl-auto: update`).

## 🚀 Запуск проекта

### Требования

- JDK 21
- Maven (или Maven Wrapper)
- PostgreSQL

### 1. Клонировать репозиторий

```bash
git clone <ссылка-на-репозиторий>
cd artmix
```

### 2. Создать базу данных

```sql
CREATE DATABASE social_network;
```

### 3. Настроить `src/main/resources/application.yml`

Укажите логин и пароль PostgreSQL и ключи платёжных систем (подробнее в разделе [Конфигурация](#-конфигурация)).

### 4. Запустить приложение

```bash
mvn spring-boot:run
```

Приложение будет доступно на `http://localhost:8080`.

## ⚙️ Конфигурация

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/social_network
    username: <логин>
    password: <пароль>
  jpa:
    hibernate:
      ddl-auto: update

yoomoney:
  shop-id: "<shop-id>"
  secret-key: "<secret-key>"
  api-url: "<url API YooMoney>"
  return-url: "<return-url>"

paypal:
  client-id: "<client-id>"
  client-secret: "<client-secret>"
  mode: "sandbox"
```

> ⚠️ Не коммитьте реальные ключи в репозиторий. Для платёжных систем используйте тестовые (sandbox) данные.

CORS настроен для локального фронтенда: `http://localhost:5173`.

## 📡 API

### Пользователи

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| `POST` | `/register` | Регистрация | Публичный |
| `POST` | `/login` | Вход, возвращает JWT | Публичный |
| `GET` | `/` | Список пользователей | JWT |
| `PUT` | `/update/{id}` | Обновить username и email | JWT |
| `DELETE` | `/delete/{id}` | Удалить пользователя | JWT |

### Посты — `/posts`

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| `GET` | `/posts/feed` | Лента всех постов (новые сверху) | Публичный |
| `GET` | `/posts/{postId}` | Пост по ID | JWT |
| `POST` | `/posts/create` | Создать пост | JWT |
| `PUT` | `/posts/update/{postId}` | Обновить свой пост | JWT |
| `DELETE` | `/posts/delete/{postId}` | Удалить свой пост | JWT |

### Чат

| Метод | Путь | Описание | Доступ |
|---|---|---|---|
| `GET` | `/messages/{senderId}/{recipientId}` | История переписки двух пользователей | JWT |
| `WS` | `/ws` | Точка подключения WebSocket (SockJS) | — |

### Платежи — `/payment`

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/payment/create` | Создать платёж, возвращает ссылку для редиректа |
| `GET` | `/payment/success` | Возврат после успешной оплаты (редирект на фронтенд) |
| `GET` | `/payment/cancel` | Возврат после отмены оплаты (редирект на фронтенд) |

Параметры `POST /payment/create` (query): `method` (`Paypal` / `YooMoney`), `amount`, `currency`, `description` (необязательно), `username` (необязательно, нужен для возврата на страницу пользователя).

### Коды ответов

| Код | Когда возвращается |
|---|---|
| `200 / 201` | Успех |
| `400` | Невалидные данные (в теле — ошибки по полям) |
| `401` | Нет токена, неверные данные, попытка изменить чужой пост |
| `404` | Пост или пользователь не найден |
| `409` | Username уже занят |

## 💬 Чат (WebSocket)

Чат построен на **STOMP поверх WebSocket (SockJS)**:

| Параметр | Значение |
|---|---|
| Endpoint | `/ws` |
| Префикс для отправки | `/app` |
| Отправка сообщения | `/app/chat` |
| Получение сообщений | подписка на `/user/queue/messages` |

Формат отправляемого сообщения:

```json
{
  "senderId": "anna",
  "recipientId": "ivan",
  "content": "Привет!"
}
```

Формат уведомления получателю:

```json
{
  "id": "15",
  "senderId": "anna",
  "recipientId": "ivan",
  "content": "Привет!"
}
```

Как это работает: при первом сообщении между двумя пользователями создаётся пара записей `chat_room` с общим `chatId` вида `senderId_recipientId`. Сообщение сохраняется в таблицу `chat` и сразу отправляется получателю через `SimpMessagingTemplate`. История переписки запрашивается через `GET /messages/{senderId}/{recipientId}`.

## 📨 Примеры запросов

### Регистрация

```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"email": "anna@example.com", "password": "strongpass123", "username": "anna"}'
```

Ответ `201 Created`:

```json
{
  "id": 1,
  "email": "anna@example.com",
  "username": "anna"
}
```

### Логин

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email": "anna@example.com", "password": "strongpass123", "username": "anna"}'
```

Ответ `200 OK` — JWT-токен строкой (вход выполняется по `username` и `password`):

```
eyJhbGciOiJIUzI1NiJ9...
```

### Создание поста

```bash
curl -X POST http://localhost:8080/posts/create \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Мой первый пост", "content": "Привет, ArtMix!"}'
```

Ответ:

```json
{
  "title": "Мой первый пост",
  "content": "Привет, ArtMix!",
  "authorName": "anna",
  "id": 1
}
```

### Лента постов

```bash
curl http://localhost:8080/posts/feed
```

### Создание платежа

```bash
curl -X POST "http://localhost:8080/payment/create?method=YooMoney&amount=299&currency=RUB&description=Premium&username=anna" \
  -H "Authorization: Bearer <TOKEN>"
```

Ответ `200 OK`:

```json
{
  "redirectUrl": "https://..."
}
```

### Ошибка валидации (`400`)

```json
{
  "password": "Password must be at least 8 characters",
  "email": "Invalid email"
}
```

## 🔍 Особенности реализации

- **JWT без сессий.** Токен передаётся в заголовке `Authorization: Bearer <token>`, живёт 30 минут. Собственный `JwtFilter` встроен в цепочку Spring Security перед `UsernamePasswordAuthenticationFilter`.
- **Хранение паролей.** BCrypt со strength 12.
- **Проверка владельца.** Редактировать и удалять пост может только его автор, иначе возвращается `401`.
- **Чат.** Комната создаётся автоматически при первом сообщении (`getChatRoomId(..., createNewRoomIfNotExists)`), история хранится в PostgreSQL.
- **Платёжные провайдеры.** PayPal подключён через официальный REST SDK, YooMoney через HTTP-запросы (`RestTemplate`) с Basic-авторизацией и ключом идемпотентности. После оплаты пользователь возвращается на фронтенд с параметром `?payment=success|cancel`.
- **Обработка ошибок.** `GlobalExceptionHandler` преобразует ошибки валидации и конфликты (`409`) в понятные JSON-ответы.

## 🗺 Планы развития

- [ ] Swagger / OpenAPI-документация
- [ ] Миграции БД через Flyway
- [ ] Docker Compose для PostgreSQL и запуска приложения
- [ ] Юнит- и интеграционные тесты
- [ ] JWT-аутентификация для WebSocket-соединений
- [ ] Роли пользователей и проверка прав на изменение профиля
- [ ] Хранение секретов (JWT, платёжные ключи) в переменных окружения

## 👤 Автор

**Ряшенцев Денис** — Java-разработчик

- GitHub: [LobstGD](https://github.com/LobstGD)
- Telegram: [@LGDOK](https://t.me/LGDOK)
