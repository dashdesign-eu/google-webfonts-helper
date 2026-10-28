import { test, expect } from '@playwright/test';
import JSZip from 'jszip';

test('font selection, native history, search, sorting and editable preview work', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/fonts/arvo?subsets=latin');
  await expect(page.locator('#font-title')).toContainText('Arvo');
  await page.screenshot({ path: 'test-results/fonts-reference-1200.png' });
  await expect(page.locator('#fontStylePreviewChooser input:checked')).toHaveCount(1);
  await expect(page.locator('#fontStylePreviewChooser input[value="regular"]')).toBeDisabled();
  await page.getByLabel('Search fonts').fill('istok');
  await expect(page.locator('#font-list a')).toHaveCount(1);
  await page.locator('#font-list a').click();
  await expect(page.locator('#font-title')).toContainText('Istok Web');
  await page.goBack(); await expect(page.locator('#font-title')).toContainText('Arvo');
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.locator('#orderButton').click();
  await page.getByLabel('Order by', { exact: true }).selectOption('popularity');
  await expect(page.locator('#font-list a').first()).toContainText('Arvo');
  await page.getByRole('button', { name: 'Reverse order' }).click();
  await expect(page.locator('#font-list a').last()).toContainText('Arvo');
  await page.locator('#orderButton').click();
  const preview = page.getByRole('textbox', { name: 'Preview regular', exact: true });
  await preview.fill('ÄÖÜ Ελληνικά 日本語');
  await page.getByLabel('Preview size', { exact: true }).fill('24');
  await expect(preview).toHaveCSS('font-size', '24px');
  await page.getByRole('button', { name: 'Increase preview size' }).click();
  await expect(preview).toHaveCSS('font-size', '25px');
  await expect(preview).toHaveText('ÄÖÜ Ελληνικά 日本語');
  await page.screenshot({ path: 'test-results/fonts-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('all CSS modes, folder prefixes and actual ZIP download retain selected styles', async ({ page }) => {
  await page.goto('/fonts/arvo?subsets=latin');
  await expect(page.locator('#font-title')).toContainText('Arvo');
  await page.locator('#fontStylePreviewChooser input[value="700"]').check();
  await page.getByLabel('Customize folder prefix (optional):').fill('/web/fonts/');
  await expect(page.locator('#css-code')).toContainText('/web/fonts/arvo-v20-latin-700.woff2');
  await page.getByRole('tab', { name: 'Legacy Support', exact: true }).click();
  await expect(page.locator('#css-code')).toContainText("format('truetype')");
  await page.getByRole('tab', { name: 'Historic Support', exact: true }).click();
  await expect(page.locator('#css-code')).toContainText("format('embedded-opentype')");
  await expect(page.locator('#css-code')).toContainText('.svg#Arvo');
  await page.getByRole('tab', { name: 'Modern Browsers', exact: true }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#download').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('arvo-v20-latin.zip');
  const file = await download.path();
  const zip = await JSZip.loadAsync(await import('node:fs/promises').then(fs => fs.readFile(file)));
  const entries = Object.keys(zip.files).filter(name => !zip.files[name].dir).sort();
  expect(entries).toEqual(['arvo-v20-latin-700.woff2', 'arvo-v20-latin-regular.woff2']);
  for (const name of entries) expect((await zip.files[name].async('nodebuffer')).length).toBeGreaterThan(1000);
});

test('failed API request is recoverable and untrusted labels never become markup', async ({ page }) => {
  let failed = true;
  await page.route('**/api/fonts/arvo?*', async route => {
    if (failed) return route.fulfill({ status: 503, body: 'temporary' });
    return route.continue();
  });
  await page.goto('/fonts/arvo?subsets=latin');
  await expect(page.getByRole('alert')).toContainText('HTTP 503');
  failed = false; await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('#font-title')).toContainText('Arvo');
  await expect(page.getByRole('alert')).toBeHidden();
  await page.getByLabel('Customize folder prefix (optional):').fill("'; background:url(javascript:alert(1)); /*");
  await expect(page.locator('#css-code')).toContainText('background:url(javascript:alert(1))');
  await expect(page.locator('#css-code script, #css-code img')).toHaveCount(0);
});
