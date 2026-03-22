import { expect, test } from '@playwright/test'

test('guest can register with email and mobile OTP and return to checkout', async ({ page }) => {
  const unique = Date.now()
  const email = `playwright-customer-${unique}@cxnext.test`
  const mobile = `98${String(unique).slice(-8)}`
  let emailOtp = ''
  let mobileOtp = ''

  await page.goto('/product/cxnext-demo-polo')
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/cart')
  await page.getByRole('link', { name: 'Sign in to checkout' }).click()

  await expect(page).toHaveURL(/\/login$/)
  await page.getByRole('link', { name: 'Request access' }).click()
  await expect(page).toHaveURL(/\/register$/)

  await page.route('**/auth/register/request-otp', async (route) => {
    const response = await route.fetch()
    const payload = await response.json()
    const requestBody = route.request().postDataJSON() as { channel: 'email' | 'mobile' }

    if (requestBody.channel === 'email') {
      emailOtp = payload.debugOtp
    } else {
      mobileOtp = payload.debugOtp
    }

    await route.fulfill({ response })
  })

  await page.getByLabel('Name').fill('Playwright Customer')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mobile number').fill(mobile)
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Send OTP' }).first().click()
  await expect.poll(() => emailOtp.length).toBe(6)
  await page.getByPlaceholder('Enter email OTP').fill(emailOtp)
  await page.getByRole('button', { name: 'Verify email OTP' }).click()
  await expect(page.getByText('Email verified')).toBeVisible()

  await page.getByRole('button', { name: 'Send OTP', exact: true }).click()
  await expect.poll(() => mobileOtp.length).toBe(6)
  await page.getByPlaceholder('Enter mobile OTP').fill(mobileOtp)
  await page.getByRole('button', { name: 'Verify mobile OTP' }).click()
  await expect(page.getByText('Mobile verified')).toBeVisible()

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.locator('#register-password').fill('playwright123')
  await page.locator('#register-confirm-password').fill('playwright123')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('heading', { name: 'Backend-connected checkout.' })).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveValue(email)
})
