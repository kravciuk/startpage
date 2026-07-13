# Техническая спецификация — StartPage

## Стек технологий

| Компонент | Технология | Версия |
|-----------|------------|--------|
| Framework | Next.js (App Router) | ^14.2.0 |
| Language | JavaScript | ES2022 |
| Styling | Tailwind CSS | ^3.4.0 |
| UI Library | shadcn/ui | latest |
| Database | SQLite (better-sqlite3) | ^9.4.0 |
| Drag & Drop | @dnd-kit | ^6.1.0 |
| HTTP Client | native fetch | built-in |
| Fonts | next/font/google | built-in |

---

## Архитектура

### Папочная структура

```
app/
├── api/
│   ├── blocks/route.js              # GET, POST — список блоков / создание
│   ├── blocks/[id]/route.js         # PATCH, DELETE — обновить / удалить блок
│   ├── blocks/reorder/route.js      # POST — изменить порядок блоков
│   ├── links/route.js               # POST — создание ссылки
│   ├── links/[id]/route.js          # PATCH, DELETE — обновить / удалить ссылку
│   ├── links/reorder/route.js       # POST — изменить порядок ссылок
│   └── favicon/route.js             # GET — скачать favicon по URL
├── components/
│   ├── SearchBar.jsx                # Поисковая строка
│   ├── BlockGrid.jsx                # Сетка блоков (DndContext)
│   ├── QuickBlock.jsx               # Карточка блока (SortableContext)
│   ├── LinkCard.jsx                 # Карточка ссылки (SortableContext)
│   ├── AddBlockButton.jsx           # Кнопка добавления блока
│   ├── AddLinkButton.jsx            # Кнопка добавления ссылки
│   ├── BlockMenu.jsx                # Dropdown меню блока
│   ├── LinkMenu.jsx                 # Dropdown меню ссылки
│   ├── AddBlockModal.jsx            # Модал добавления блока
│   ├── AddLinkModal.jsx             # Модал добавления/редактирования ссылки
│   ├── RenameBlockModal.jsx         # Модал переименования блока
│   ├── EmptyState.jsx               # Пустое состояние
│   └── Providers.jsx                # Обёртка с DndContext
├── lib/
│   ├── db.js                        # Инициализация SQLite + миграции
│   └── favicon.js                   # Логика скачивания favicon
├── hooks/
│   ├── useBlocks.js                 # React Query хук для блоков
│   └── useSearch.js                 # Хук поиска
├── page.js                          # Главная страница
├── layout.js                        # Корневой layout
└── globals.css                      # Глобальные стили + CSS переменные
components/
└── ui/                              # shadcn/ui компоненты
    ├── button.jsx
    ├── input.jsx
    ├── dialog.jsx
    ├── dropdown-menu.jsx
    └── ...
public/
└── favicons/                        # Локально сохранённые favicon
```

---

## Схема базы данных

### Таблица `blocks`

| Колонка | Тип | Constraints | Описание |
|---------|-----|-------------|----------|
| id | INTEGER | PK, AUTOINCREMENT | Уникальный ID |
| name | TEXT | NOT NULL | Название блока |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Порядок сортировки |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Дата создания |

### Таблица `links`

| Колонка | Тип | Constraints | Описание |
|---------|-----|-------------|----------|
| id | INTEGER | PK, AUTOINCREMENT | Уникальный ID |
| block_id | INTEGER | NOT NULL, FK → blocks.id | ID блока |
| title | TEXT | NOT NULL | Название сайта |
| url | TEXT | NOT NULL | URL сайта |
| favicon_path | TEXT | NULL | Путь к локальному favicon |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Порядок в блоке |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Дата создания |

### Индексы

```sql
CREATE INDEX idx_links_block_id ON links(block_id);
CREATE INDEX idx_blocks_sort_order ON blocks(sort_order);
CREATE INDEX idx_links_sort_order ON links(sort_order);
CREATE INDEX idx_links_title ON links(title);
CREATE INDEX idx_links_url ON links(url);
```

---

## API Endpoints

### Блоки

| Метод | Путь | Описание | Тело запроса |
|-------|------|----------|--------------|
| GET | `/api/blocks` | Получить все блоки со ссылками | — |
| POST | `/api/blocks` | Создать блок | `{ name }` |
| PATCH | `/api/blocks/[id]` | Переименовать блок | `{ name }` |
| DELETE | `/api/blocks/[id]` | Удалить блок + все ссылки | — |
| POST | `/api/blocks/reorder` | Изменить порядок блоков | `{ blockIds: number[] }` |

### Ссылки

| Метод | Путь | Описание | Тело запроса |
|-------|------|----------|--------------|
| POST | `/api/links` | Создать ссылку | `{ blockId, title, url }` |
| PATCH | `/api/links/[id]` | Редактировать ссылку | `{ title?, url? }` |
| DELETE | `/api/links/[id]` | Удалить ссылку | — |
| POST | `/api/links/reorder` | Изменить порядок / переместить | `{ linkId, targetBlockId, orderedIds: number[] }` |

### Favicon

| Метод | Путь | Описание | Query params |
|-------|------|----------|--------------|
| GET | `/api/favicon?url={url}` | Скачать и сохранить favicon | `url` — адрес сайта |

**Ответ**: `{ success: true, faviconPath: "/favicons/example.com.png" }`

---

## Инициализация базы данных

Файл `lib/db.js`:
- Проверяет существование файла БД (`./data/startpage.db`)
- Создаёт таблицы при первом запуске
- Проверяет наличие данных — если таблица blocks пуста, сидирует начальный блок "AI Сервисы" с 10 ссылками
- Favicon для сид-данных загружаются асинхронно после старта

---

## Drag & Drop архитектура (@dnd-kit)

### Библиотеки

```
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
```

### Структура DnD

```
DndContext (глобальный, на page.js)
├── SortableContext (горизонтальная сортировка блоков, axis: x)
│   ├── QuickBlock (useSortable — id: `block-${block.id}`)
│   │   ├── SortableContext (вертикальная сортировка ссылок, axis: y)
│   │   │   ├── LinkCard (useSortable — id: `link-${link.id}`)
│   │   │   ├── LinkCard
│   │   │   └── ...
│   │   └── AddLinkButton
│   ├── QuickBlock
│   └── ...
└── AddBlockButton
```

### Обработка событий

1. **onDragStart** — определяет тип (блок или ссылка) по id префиксу
2. **onDragOver** — если ссылка над другим блоком → визуальный feedback
3. **onDragEnd** — 
   - Блок: отправляет `POST /api/blocks/reorder`
   - Ссылка внутри блока: отправляет `POST /api/links/reorder`
   - Ссылка в другой блок: отправляет `POST /api/links/reorder` с `targetBlockId`

---

## Поиск (фронтенд)

- Локальная фильтрация на клиенте (без API запросов)
- Хранит оригинальный список + отфильтрованный
- Debounce 200ms через `useDeferredValue` или ручной debounce
- Case-insensitive проверка `title.includes(query) || url.includes(query)`
- Блоки без совпадений скрываются
- Очистка поиска — возврат полного списка

---

## Favicon загрузка

### Алгоритм

```
Вход: URL сайта
1. Извлечь домен: new URL(url).hostname
2. Проверить локальный кэш: exists(public/favicons/{domain}.png)
   → Да: вернуть путь
3. Попробовать скачать: GET https://{domain}/favicon.ico
   → Успех (200, image): сохранить, вернуть путь
4. Попробовать Google API: GET https://www.google.com/s2/favicons?domain={domain}&sz=128
   → Успех: сохранить, вернуть путь
5. Фолбэк: вернуть null (в UI показать заглушку с первой буквой домена)
```

### Сохранение

- Папка: `public/favicons/`
- Имя файла: `{domain}.png`
- Формат: всегда PNG
- Размер: оригинальный или до 128x128

---

## State Management

### Подход: React Server Components + клиентские хуки

- **Server Component** (`page.js`): initial fetch блоков через `db.query()`
- **Client Components**: интерактивные части с `useState` / `useOptimistic`
- **Кэширование**: `useSWR` или нативный `useState` с пропсами от сервера
- **Optimistic UI**: при DnD сразу меняем UI, потом синхронизируем с сервером

---

## Зависимости (package.json)

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "better-sqlite3": "^9.4.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.0",
    "lucide-react": "^0.400.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Разработка (next dev) |
| `npm run build` | Продакшен сборка |
| `npm run start` | Запуск продакшена |

---

## Конфигурация Next.js

```js
// next.config.js
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // для локальных favicon
  },
}
module.exports = nextConfig
```

`output: 'standalone'` — для автономного деплоя без nginx.

---

## Инициализация проекта

```bash
# 1. Создать Next.js проект
npx create-next-app@14 startpage --js --tailwind --eslint --app --no-src-dir

# 2. Установить зависимости
cd startpage
npm install better-sqlite3 @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-react class-variance-authority clsx tailwind-merge

# 3. Инициализировать shadcn/ui
npx shadcn-ui@latest init --defaults

# 4. Добавить shadcn компоненты
npx shadcn-ui@latest add button input dialog dropdown-menu

# 5. Создать папки
mkdir -p app/api/blocks app/api/links app/api/favicon app/components app/lib app/hooks public/favicons data
```
