import { test, expect } from '@playwright/test';
import { WidgetPage } from './widget.page';

test.describe('Uchi.ru widget', () => {
    let widgetPage: WidgetPage;

    test.beforeEach(async ({ page }) => {
        widgetPage = new WidgetPage(page);
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await widgetPage.closeCookiesIfVisible();
    });

    test('opens widget and support article from popular list', async () => {
        // 1. Открываем виджет — это основная проверка.
        await widgetPage.openWidget();
        await expect(widgetPage.getWidgetBody()).toBeVisible();
        await expect(widgetPage.getPopularArticles()).not.toHaveCount(0);

        // 2. Из списка популярных статей выбираем статью про поддержку.
        const articles = widgetPage.getPopularArticles();
        const supportArticle = articles
            .filter({ hasText: /поддержк|связ/i })
            .first();

        await expect(supportArticle).toBeVisible();
        await supportArticle.click();

        // 3. Проверяем, что открылась именно статья про поддержку.
        await expect(widgetPage.wrapper())
            .toContainText(/службу поддержки|связь с поддержкой/i, { timeout: 10_000 });
    });
});