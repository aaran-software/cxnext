import { expect, test } from '@playwright/test'

test('storefront checkout requires login and returns to checkout after sign in', async ({ page }) => {
  await page.goto('/product/cxnext-demo-polo')
  await expect(page.getByRole('heading', { name: 'CXNext Demo Polo' })).toBeVisible()

  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/cart')

  await expect(page.getByRole('link', { name: 'Sign in to checkout' })).toBeVisible()
  await page.getByRole('link', { name: 'Sign in to checkout' }).click()

  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Email').fill('sundar@sundar.com')
  await page.getByLabel('Password').fill('kalarani')
  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('heading', { name: 'Backend-connected checkout.' })).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveValue('sundar@sundar.com')
})
