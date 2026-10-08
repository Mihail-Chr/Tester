import { Page, Locator, expect } from '@playwright/test';

enum WidgetPageSelectors {
    WRAPPER = '.sc-dino-typography-h > [class^=widget__]',
    WIDGET_BODY = '[class^=widgetWrapper] > [class^=widget__]',
    HEADER_TEXT = 'header h5',
    BUTTON_OPEN = '[data-test=openWidget]',
    BUTTON_WRITE_TO_US = '[class^=btn]',
    ARTICLE_POPULAR_LIST_ITEM = '[class^=popularTitle__] + ul[class^=articles__] > li',
    COOKIE_BUTTON = '._UCHI_COOKIE__button',
}

export class WidgetPage {
    static selector = WidgetPageSelectors;

    constructor(protected page: Page) {}

    // Публичный доступ к page — нужен для диагностики и ожиданий в тестах.
    get currentPage(): Page {
        return this.page;
    }

    // Закрывает куки-попап. Работающий селектор — ._UCHI_COOKIE__button.
    // Если попап не появился — тихо идём дальше.
    async closeCookiesIfVisible(): Promise<void> {
        const button = this.page.locator(WidgetPage.selector.COOKIE_BUTTON);

        const appeared = await button
            .waitFor({ state: 'visible', timeout: 3000 })
            .then(() => true)
            .catch(() => false);

        if (appeared) {
            await button.click();
            // Даём анимации закрытия доиграть, чтобы полоса не перекрывала виджет.
            await this.page.waitForTimeout(500);
        }
    }

    wrapper(): Locator {
        return this.page.locator(WidgetPage.selector.WRAPPER);
    }

    // Открывает виджет и ждёт, пока загрузятся популярные статьи.
   async openWidget(): Promise<void> {
    await expect(this.wrapper()).toBeAttached({ timeout: 20_000 });

    const openButton = this.wrapper().locator(WidgetPage.selector.BUTTON_OPEN);
    await expect(openButton).toBeVisible({ timeout: 10_000 });
    await openButton.click();

    await expect(this.getWidgetBody()).toBeVisible({ timeout: 10_000 });
    await expect(this.getPopularArticles().first()).toBeVisible({ timeout: 10_000 });
    }

    getWidgetBody(): Locator {
        return this.page.locator(WidgetPage.selector.WIDGET_BODY);
    }

    // Коллекция популярных статей внутри виджета.
    getPopularArticles(): Locator {
        return this.wrapper().locator(WidgetPage.selector.ARTICLE_POPULAR_LIST_ITEM);
    }

    // Заголовок шапки виджета. В текущей версии Uchi.ru он статичен
    // и всегда равен "База знаний Учи.ру" — не меняется при переходах.
    getTitle(): Locator {
        return this.wrapper().locator(WidgetPage.selector.HEADER_TEXT);
    }

    // Кнопка "Написать в поддержку" (если появится на подстранице статьи).
    // Ищем по роли и тексту, а не по хрупкому [class^=btn].
    getWriteToUsButton(): Locator {
        return this.wrapper()
            .getByRole('button', { name: /написать|связ|поддержк|обратит/i });
    }

    async clickWriteToUs(): Promise<void> {
        await this.getWriteToUsButton().first().click();
    }
}