import { expect, test } from '@playwright/test'

test('guest can register with email OTP and return to checkout', async ({ page }) => {
  const unique = Date.now()
  const email = `playwright-customer-${unique}@cxnext.test`
  const mobile = `98${String(unique).slice(-8)}`
  const emailOtp = '123456'
  let emailVerificationId = ''
  await page.goto('/product/cxnext-demo-polo')
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.goto('/cart')
  await page.getByRole('link', { name: 'Sign in to checkout' }).click()

  await expect(page).toHaveURL(/\/login$/)
  await page.getByRole('link', { name: 'Request access' }).click()
  await expect(page).toHaveURL(/\/register$/)

  await page.route('**/auth/register/request-otp', async (route) => {
    emailVerificationId = `email-verification-${unique}`
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        verificationId: emailVerificationId,
        expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
        debugOtp: null,
      }),
    })
  })

  await page.route('**/auth/register/verify-otp', async (route) => {
    const body = route.request().postDataJSON() as { accessToken?: string; verificationId: string; otp?: string }

    if (body.verificationId === emailVerificationId && body.otp === emailOtp) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          verificationId: body.verificationId,
          verified: true,
        }),
      })
      return
    }

    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Invalid OTP',
      }),
    })
  })

  await page.route('**/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'playwright-auth-token',
        tokenType: 'Bearer',
        expiresInSeconds: 3600,
        user: {
          id: `customer-${unique}`,
          email,
          phoneNumber: `+91${mobile}`,
          displayName: 'Playwright Customer',
          actorType: 'customer',
          avatarUrl: null,
          organizationName: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    })
  })

  await page.getByLabel('Name').fill('Playwright Customer')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mobile number').fill(mobile)
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Send OTP' }).first().click()
  await page.getByPlaceholder('Enter email OTP').fill(emailOtp)
  await page.getByRole('button', { name: 'Verify email OTP' }).click()
  await expect(page.getByRole('button', { name: 'Verified' }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Continue' }).click()
  await page.locator('#register-password').fill('playwright123')
  await page.locator('#register-confirm-password').fill('playwright123')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('heading', { name: 'Backend-connected checkout.' })).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveValue(email)
})
