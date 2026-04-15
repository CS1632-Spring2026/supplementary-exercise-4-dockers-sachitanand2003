import { test, expect } from '@playwright/test';

// TODO: Fill in with test cases.
/**
 * TEST FIXTURE
 * Applied before every test:
 * 1. Navigate to the base URL.
 * 2. Set all cat-rental cookies to "false" so no cats are rented.
 */
const BASE_URL = 'http://localhost:8080';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    document.cookie = '1=false';
    document.cookie = '2=false';
    document.cookie = '3=false';
  });
});

// ============================================================
//  REQUIRED TEST CASES (TEST-1 through TEST-11)
// ============================================================

/**
 * TEST-1-RESET
 * Given that cats ID 1, 2, and 3 have been rented out,
 * check that resetting the system results in all cats being available.
 */
test('TEST-1-RESET', async ({ page }) => {
  // Precondition: all cats rented
  await page.evaluate(() => {
    document.cookie = '1=true';
    document.cookie = '2=true';
    document.cookie = '3=true';
  });

  await page.getByRole('link', { name: 'Reset' }).click();

  await expect(page.getByText('ID 1. Jennyanydots')).toBeVisible();
  await expect(page.getByText('ID 2. Old Deuteronomy')).toBeVisible();
  await expect(page.getByText('ID 3. Mistoffelees')).toBeVisible();
});

/**
 * TEST-2-CATALOG
 * Check that the second item in the catalog is an image named "cat2.jpg".
 */
test('TEST-2-CATALOG', async ({ page }) => {
  await page.getByRole('link', { name: 'Catalog' }).click();

  const secondImage = page.locator('ol li').nth(1).locator('img');
  await expect(secondImage).toHaveAttribute('src', '/images/cat2.jpg');
});

/**
 * TEST-3-LISTING
 * Check that the listing has three cats and the third is "ID 3. Mistoffelees".
 */
test('TEST-3-LISTING', async ({ page }) => {
  await page.getByRole('link', { name: 'Catalog' }).click();

  const rows = page.locator('ul.list-group li');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(2)).toHaveText('ID 3. Mistoffelees');
});

/**
 * TEST-4-RENT-A-CAT
 * Check that the "Rent" and "Return" buttons exist in the Rent-A-Cat page.
 */
test('TEST-4-RENT-A-CAT', async ({ page }) => {
  await page.getByRole('link', { name: 'Rent-A-Cat' }).click();

  await expect(page.getByRole('button', { name: 'Rent' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Return' })).toBeVisible();
});

/**
 * TEST-5-RENT
 * Check that renting cat ID 1 works as expected.
 * Verifies the listing updates and "Success!" is displayed.
 */
test('TEST-5-RENT', async ({ page }) => {
  await page.getByRole('link', { name: 'Rent-A-Cat' }).click();

  await page.getByRole('textbox', { name: 'Enter the ID of the cat to rent:' }).fill('1');
  await page.getByRole('button', { name: 'Rent' }).click();

  const rows = page.locator('ul.list-group li');
  await expect(rows.nth(0)).toHaveText('Rented out');
  await expect(rows.nth(1)).toHaveText('ID 2. Old Deuteronomy');
  await expect(rows.nth(2)).toHaveText('ID 3. Mistoffelees');
  await expect(page.getByText('Success!')).toBeVisible();
});

/**
 * TEST-6-RETURN
 * Check that returning cat ID 2 works as expected.
 * Precondition: cats 2 and 3 are rented out.
 * Verifies the listing updates and "Success!" is displayed.
 */
test('TEST-6-RETURN', async ({ page }) => {
  // Precondition: cats 2 and 3 are rented
  await page.evaluate(() => {
    document.cookie = '2=true';
    document.cookie = '3=true';
  });

  await page.getByRole('link', { name: 'Rent-A-Cat' }).click();

  await page.getByRole('textbox', { name: 'Enter the ID of the cat to return:' }).fill('2');
  await page.getByRole('button', { name: 'Return' }).click();

  await expect(page.getByText('ID 1. Jennyanydots')).toBeVisible();
  await expect(page.getByText('ID 2. Old Deuteronomy')).toBeVisible();
  await expect(page.getByText('Rented out')).toBeVisible();
  await expect(page.getByText('Success!')).toBeVisible();
});

/**
 * TEST-7-FEED-A-CAT
 * Check that the "Feed" button exists in the Feed-A-Cat page.
 */
test('TEST-7-FEED-A-CAT', async ({ page }) => {
  await page.getByRole('link', { name: 'Feed-A-Cat' }).click();

  await expect(page.getByRole('button', { name: 'Feed' })).toBeVisible();
});

/**
 * TEST-8-FEED
 * Check that feeding 6 catnips to 3 cats results in "Nom, nom, nom.".
 * NOTE: The server response can take up to 7 seconds; timeout is extended to 10 seconds.
 */
test('TEST-8-FEED', async ({ page }) => {
  await page.getByRole('link', { name: 'Feed-A-Cat' }).click();

  await page.getByRole('textbox', { name: 'Number of catnips to feed:' }).fill('6');
  await page.getByRole('button', { name: 'Feed' }).click();

  await expect(page.getByText('Nom, nom, nom.')).toBeVisible({ timeout: 10000 });
});

/**
 * TEST-9-GREET-A-CAT
 * Check that 3 cats respond with three "Meow!"s in the Greet-A-Cat page.
 */
test('TEST-9-GREET-A-CAT', async ({ page }) => {
  await page.getByRole('link', { name: 'Greet-A-Cat' }).click();

  await expect(page.locator('body')).toContainText('Meow!Meow!Meow!');
});

/**
 * TEST-10-GREET-A-CAT-WITH-NAME
 * Check that greeting Jennyanydots results in "Meow! from Jennyanydots."
 * on the Greet-A-Cat page when accessed with a trailing name.
 */
test('TEST-10-GREET-A-CAT-WITH-NAME', async ({ page }) => {
  await page.goto(`${BASE_URL}/greet-a-cat/Jennyanydots`);

  await expect(page.locator('body')).toContainText('Meow! from Jennyanydots.');
});

/**
 * TEST-11-FEED-A-CAT-SCREENSHOT
 * Check that the Feed-A-Cat page matches the corresponding screenshot
 * in the tests/rentacat.spec.ts-snapshots folder.
 * Precondition: all cats are rented out (all three listing rows show "Rented out").
 */
test('TEST-11-FEED-A-CAT-SCREENSHOT', async ({ page }) => {
  // Precondition: all cats rented
  await page.evaluate(() => {
    document.cookie = '1=true';
    document.cookie = '2=true';
    document.cookie = '3=true';
  });

  await page.getByRole('link', { name: 'Feed-A-Cat' }).click();

  await expect(page.locator('body')).toHaveScreenshot();
});
