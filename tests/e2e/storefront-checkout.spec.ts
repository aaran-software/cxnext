import { expect, test } from '@playwright/test'

test('storefront catalog loads and checkout places a cod order', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('sundar@sundar.com')
  await page.getByLabel('Password').fill('kalarani')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  const catalogResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/storefront/catalog') && response.request().method() === 'GET',
  )

  await page.goto('/search')

  const catalogResponse = await catalogResponsePromise
  expect(catalogResponse.ok()).toBeTruthy()

  await expect(page.getByRole('heading', { name: 'All styles' })).toBeVisible()
  await expect(page.getByText('CXNext Demo Polo').first()).toBeVisible()

  await page.locator('a[href="/product/cxnext-demo-polo"]').nth(1).click()
  await expect(page.getByRole('heading', { name: 'CXNext Demo Polo' })).toBeVisible()

  await page.getByRole('button', { name: 'Add to cart', exact: true }).first().click()
  await page.goto('/cart')

  await expect(page.getByRole('heading', { name: 'Review your selected styles.' })).toBeVisible()
  await expect(page.getByText('CXNext Demo Polo')).toBeVisible()

  await page.getByRole('link', { name: 'Proceed to checkout' }).click()
  await expect(page.getByRole('heading', { name: 'Backend-connected checkout.' })).toBeVisible()

  await page.getByLabel('First name').fill('Playwright')
  await page.getByLabel('Last name').fill('Tester')
  await page.getByLabel('Email').fill('playwright@cxnext.test')
  await page.getByLabel('Phone').fill('+91 90000 00000')
  await page.getByLabel('Address line 1').fill('99 Automation Street')
  await page.getByLabel('City').fill('Chennai')
  await page.getByLabel('State').fill('Tamil Nadu')
  await page.getByLabel('Country').fill('India')
  await page.getByLabel('Postal code').fill('600001')
  await page.getByLabel('Order note').fill('Playwright order validation run')
  await page.getByLabel('Cash on delivery').check()

  const checkoutResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/storefront/checkout') && response.request().method() === 'POST',
  )

  await page.getByRole('button', { name: 'Place order' }).click()

  const checkoutResponse = await checkoutResponsePromise
  expect(checkoutResponse.status()).toBe(201)

  const payload = await checkoutResponse.json()
  expect(payload.requiresPayment).toBeFalsy()
  expect(payload.order.orderNumber).toMatch(/^SO-/)
  expect(payload.order.items).toHaveLength(1)
  expect(payload.order.items[0].productName).toBe('CXNext Demo Polo')

  await expect(page.getByText(`Order ${payload.order.orderNumber} has been placed.`)).toBeVisible()
  await expect(page.getByText('Playwright Tester')).toBeVisible()
})
