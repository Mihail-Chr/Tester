# Автотесты Uchi.ru (Playwright)

Автотесты для сайта [uchi.ru](https://uchi.ru) на TypeScript + Playwright.

**Стек:** TypeScript, Playwright, Page Object Pattern.

---

## Требования

- [Node.js](https://nodejs.org/) 18+
- npm

Проверить:

```bash
node -v
npm -v
```

---

## Установка

```bash
cd "autotest UCHI"
npm install
npx playwright install
```

---

## Запуск тестов

```bash
# Все тесты в обоих браузерах
npx playwright test

# Только Chromium
npx playwright test --project=chromium

# Только Firefox
npx playwright test --project=firefox

# Конкретный файл
npx playwright test tests/widget.spec.ts
npx playwright test tests/home.spec.ts

# HTML-отчёт после прогона
npx playwright show-report
```

**Ожидаемый результат:**

```
Running 6 tests using 1 worker
  ✓  [chromium] › opens widget and support article from popular list
  ✓  [chromium] › page has a non-empty title
  ✓  [chromium] › register button is visible
  ✓  [chromium] › cookie banner closes after clicking OK
  ✓  [firefox]  › opens widget and support article from popular list
  ✓  [firefox]  › page has a non-empty title
  ...
  6 passed
```

---

## Задание: исправление ошибок

**Дано:** исходный код автотестов виджета с ошибками.

**Цель:** исправить ошибки и добиться стабильного зелёного прогона в Chromium и Firefox.

**Исходные проблемы:**

1. Асинхронные вызовы без `await`.
2. Обращение к `Locator` как к массиву (`articles[0].click()`).
3. Хрупкие CSS-селекторы (`[class^=btn]`).
4. Клик по cookie-баннеру падал, если баннера не было.
5. Проверка заголовка не соответствовала актуальной версии сайта.
6. Нет ожидания загрузки виджета после клика.
7. Смешивание `page` и `widgetPage` в тестах.

---

## Тест виджета

**Файл:** `tests/widget.spec.ts`

**Сценарий — `opens widget and support article from popular list`:**

1. Открывает главную `uchi.ru`.
2. Безопасно закрывает cookie-баннер, если он есть.
3. Дожидается кнопки виджета и кликает по ней.
4. Дожидается загрузки популярных статей.
5. Находит статью про поддержку по тексту.
6. Открывает её и проверяет контент.

**Зачем:** проверить ключевой сценарий — открытие виджета «База знаний» и переход к статье про службу поддержки.

**Ожидаемый результат:** в виджете отображается контент статьи про поддержку.

> **Примечание:** открытие виджета и переход в статью объединены в один тест — сайт корректно рендерит виджет только один раз за сессию браузера.

---

## Таблица корректировок кода

| № | Было | Стало | Почему |
|---|------|-------|--------|
| 1 | `expect(...).toBeVisible()` без `await` | `await expect(...).toBeVisible()` | Без `await` проверка не дожидалась выполнения. |
| 2 | `getPopularArticles()` → `Locator[]` | `getPopularArticles(): Locator` | `Locator` ретраит поиск, работает с `not.toHaveCount()`. |
| 3 | `articles[0].click()` | `articles.first().click()` | У `Locator` нет индексов. |
| 4 | `page.click('._UCHI_COOKIE__button')` | `closeCookiesIfVisible()` с `waitFor` + `catch` | Не падает, если баннера нет. |
| 5 | `getTitle(): Promise<string>` | `getTitle(): Locator` + `toHaveText()` | Web-first assertion с авторетраем. |
| 6 | `[class^=btn]` | `getByRole('button', { name: /написать\|связ\|поддержк/i })` | Роль + текст надёжнее CSS-класса. |
| 7 | Нет ожидания загрузки виджета | `await expect(wrapper()).toBeAttached({ timeout: 20_000 })` | Виджет грузится асинхронно. |
| 8 | Два теста делили состояние браузера | Объединены в один | Сайт рендерит виджет один раз за сессию. |
| 9 | `expect(await getTitle()).toEqual(...)` | `await expect(getTitle()).toHaveText(...)` | Playwright-`expect` ретраит, Jest — нет. |
| 10 | `page` дублировался в тестах | Только `widgetPage` | Всё через Page Object. |

**Финальная конфигурация `playwright.config.ts`:**

```typescript
use: {
  baseURL: 'https://uchi.ru',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
},
retries: 2,
workers: 1,
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
],
```

---

## Новые тесты — главная страница

**Файл:** `tests/home.spec.ts`

Три независимых UI-теста. Не зависят от виджета.

### Тест 1 — `page has a non-empty title`

Проверяет, что у главной страницы есть непустой `<title>`. Минимальный smoke-тест.

### Тест 2 — `register button is visible`

Ищет кнопку или ссылку «Зарегистрироваться» на главной. Проверяет, что ключевой элемент виден незалогиненному пользователю.

### Тест 3 — `cookie banner closes after clicking OK`

1. Дожидается появления cookie-баннера.
2. Кликает по кнопке «ОК».
3. Проверяет, что баннер исчез из DOM (`toHaveCount(0)`).

> **Особенность:** на Uchi.ru две одинаковые кнопки cookie (мобильная и десктопная вёрстка). В тесте используется `.first()` для клика и `toHaveCount(0)` для проверки, что исчезли обе.

---

## Структура проекта

```
autotest UCHI/
├── tests/
│   ├── home.spec.ts        # тесты главной страницы
│   ├── widget.spec.ts      # тесты виджета «База знаний»
│   └── widget.page.ts      # Page Object для виджета
├── playwright.config.ts
├── package.json
├── package-lock.json
├── .nvmrc
└── .gitignore
```