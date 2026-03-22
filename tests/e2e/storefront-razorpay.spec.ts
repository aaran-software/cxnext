import { createHmac } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import dotenv from 'dotenv'

const envFilePath = path.resolve(process.cwd(), '.env')
const razorpaySecret = existsSync(envFilePath)
  ? dotenv.parse(readFileSync(envFilePath, 'utf8')).RAZORPAY_KEY_SECRET
  : undefined

test.skip(!razorpaySecret, 'RAZORPAY_KEY_SECRET is required for the Razorpay checkout test.')

test('storefront checkout opens Razorpay flow and verifies payment', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('sundar@sundar.com')
  await page.getByLabel('Password').fill('kalarani')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.addInitScript(() => {
    class RazorpayMock {
      private options: {
        order_id: string
        handler: (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => void
      }

      constructor(options: RazorpayMock['options']) {
        this.options = options
      }

      on() {
        return undefined
      }

      open() {
        window.setTimeout(() => {
          this.options.handler({
            razorpay_payment_id: 'pay_playwright_001',
            razorpay_order_id: this.options.order_id,
            razorpay_signature: 'playwright-signature-placeholder',
          })
        }, 10)
      }
    }

    window.Razorpay = RazorpayMock as typeof window.Razorpay
  })

  await page.route('**/storefront/checkout/verify-payment', async (route) => {
    const payload = route.request().postDataJSON() as {
      storefrontOrderId: string
      razorpayOrderId: string
      razorpayPaymentId: string
      razorpaySignature: string
    }

    const razorpaySignature = createHmac('sha256', razorpaySecret ?? '')
      .update(`${payload.razorpayOrderId}|${payload.razorpayPaymentId}`)
      .digest('hex')

    await route.continue({
      headers: {
        ...route.request().headers(),
        'content-type': 'application/json',
      },
      postData: JSON.stringify({
        ...payload,
        razorpaySignature,
      }),
    })
  })

  const catalogResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/storefront/catalog') && response.request().method() === 'GET',
  )

  await page.goto('/search')

  const catalogResponse = await catalogResponsePromise
  expect(catalogResponse.ok()).toBeTruthy()

  await page.locator('a[href="/product/cxnext-demo-polo"]').nth(1).click()
  await expect(page.getByRole('heading', { name: 'CXNext Demo Polo' })).toBeVisible()

  await page.getByRole('button', { name: 'Add to cart', exact: true }).first().click()
  await page.goto('/cart')
  await page.getByRole('link', { name: 'Proceed to checkout' }).click()

  await expect(page.getByRole('heading', { name: 'Backend-connected checkout.' })).toBeVisible()
  await page.getByLabel('First name').fill('Playwright')
  await page.getByLabel('Last name').fill('Razorpay')
  await page.getByLabel('Email').fill('playwright-razorpay@cxnext.test')
  await page.getByLabel('Phone').fill('+91 90000 00001')
  await page.getByLabel('Address line 1').fill('100 Gateway Street')
  await page.getByLabel('City').fill('Chennai')
  await page.getByLabel('State').fill('Tamil Nadu')
  await page.getByLabel('Country').fill('India')
  await page.getByLabel('Postal code').fill('600001')
  await page.getByLabel('UPI / Wallet').check()

  const checkoutResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/storefront/checkout') && response.request().method() === 'POST',
  )
  const verifyResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/storefront/checkout/verify-payment') && response.request().method() === 'POST',
  )

  await page.getByRole('button', { name: 'Continue to pay' }).click()

  const checkoutResponse = await checkoutResponsePromise
  expect(checkoutResponse.status()).toBe(201)

  const checkoutPayload = await checkoutResponse.json()
  expect(checkoutPayload.requiresPayment).toBeTruthy()
  expect(checkoutPayload.paymentSession.provider).toBe('razorpay')
  expect(checkoutPayload.paymentSession.orderId).toMatch(/^order_/)

  const verifyResponse = await verifyResponsePromise
  expect(verifyResponse.status()).toBe(200)

  const verifiedPayload = await verifyResponse.json()
  const verifiedOrder = verifiedPayload.order
  expect(verifiedOrder.paymentGateway).toBe('razorpay')
  expect(verifiedOrder.paymentStatus).toBe('captured')
  expect(verifiedOrder.paymentGatewayPaymentId).toBe('pay_playwright_001')

  await expect(page.getByText(`Order ${verifiedOrder.orderNumber} has been placed.`)).toBeVisible()
  await expect(page.getByText('Payment verified')).toBeVisible()
})
