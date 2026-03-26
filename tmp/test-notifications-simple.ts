import { CommerceNotificationService } from '../apps/ecommerce/api/src/features/commerce/application/commerce-notification-service.js'

async function runTest() {
  const mockOrder: any = {
    orderNumber: 'SO-TEST-999',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    subtotal: 500,
    shippingAmount: 50,
    handlingAmount: 0,
    totalAmount: 550,
    currency: 'USD',
    items: [{ productName: 'Mini Product', size: 'S', color: 'White', quantity: 1, lineTotal: 500 }],
    addressLine1: 'Jane Ave',
    city: 'JaneCity',
    state: 'JS',
    postalCode: '99999',
    country: 'JaneLand'
  }

  const sender = async (input: any) => {
    console.log(`[VERIFY] Subject: ${input.subject}`)
    if (input.html.includes('Order Received!')) console.log('[VERIFY] Body contains "Order Received!"')
    if (input.html.includes('Order Confirmed!')) console.log('[VERIFY] Body contains "Order Confirmed!"')
    if (input.html.includes('Your Order is Shipped!')) console.log('[VERIFY] Body contains "Your Order is Shipped!"')
    if (input.html.includes('Delivered!')) console.log('[VERIFY] Body contains "Delivered!"')
    if (input.html.includes('Order Cancelled')) console.log('[VERIFY] Body contains "Order Cancelled"')
    return { messageId: 'test-id' }
  }

  const service = new CommerceNotificationService(sender)
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  await service.sendOrderReceivedEmail(mockOrder)
  await sleep(100)
  await service.sendOrderConfirmedEmail(mockOrder)
  await sleep(100)
  await service.sendOrderShippedEmail(mockOrder, { courierName: 'DHL', trackingNumber: 'DHL123' } as any)
  await sleep(100)
  await service.sendOrderDeliveredEmail(mockOrder)
  await sleep(100)
  await service.sendOrderCancelledEmail(mockOrder, 'Customer request')
}

runTest().catch(console.error)
