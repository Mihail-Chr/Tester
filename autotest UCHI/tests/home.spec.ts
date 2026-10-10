import { test, expect } from '@playwright/test';

test.describe('Uchi.ru home page', () => {
    test.beforeEach(async ({ page }) => {
        // Открываем главную страницу. baseURL задан в playwright.config.ts
        await page.goto('/', { waitUntil: 'domcontentloaded' });
    });

    test('page has a non-empty title', async ({ page }) => {
        // Проверяем, что у страницы вообще есть title (не пустой).
        // Регулярка /.+/ означает "любой символ, минимум один".
        await expect(page).toHaveTitle(/.+/);
    });

    test('register button is visible', async ({ page }) => {
        // Ищем кнопку или ссылку "Зарегистрироваться" — она есть на главной
        // у незалогиненного пользователя.
        // Комбинируем link и button на случай, если на сайте это <a> или <button>.
        const registerButton = page
            .getByRole('link', { name: /зарегистрироваться/i })
            .or(page.getByRole('button', { name: /зарегистрироваться/i }))
            .first();

        await expect(registerButton).toBeVisible({ timeout: 10_000 });
    });

    test('cookie banner closes after clicking OK', async ({ page }) => {
    const cookieButton = page.locator('._UCHI_COOKIE__button').first();
    await expect(cookieButton).toBeVisible({ timeout: 10_000 });

    await cookieButton.click();

    // Проверяем, что ОБЕ кнопки исчезли — их было две
    await expect(page.locator('._UCHI_COOKIE__button')).toHaveCount(0, { timeout: 10_000 });
    });
});