import { CommerceNotificationService } from '../apps/ecommerce/api/src/features/commerce/application/commerce-notification-service.js'

async function runTest() {
  const mockOrder: any = {
    orderNumber: 'SO-SEQ-111',
    firstName: 'Alice',
    lastName: 'Wonder',
    email: 'alice@example.com',
    subtotal: 100,
    shippingAmount: 0,
    handlingAmount: 0,
    totalAmount: 100,
    currency: 'USD',
    items: [{ productName: 'Magic Key', size: 'One', color: 'Gold', quantity: 1, lineTotal: 100 }],
    addressLine1: 'Rabbit Hole 1',
    city: 'Wonderland',
    state: 'WL',
    postalCode: '00000',
    country: 'Wonderland'
  }

  let seq = 0
  const sender = async (input: any) => {
    seq++
    console.log(`[EVENT ${seq}] Subject: ${input.subject}`)
    return { messageId: `msg-${seq}` }
  }

  const service = new CommerceNotificationService(sender)
  
  await service.sendOrderReceivedEmail(mockOrder)
  await service.sendOrderConfirmedEmail(mockOrder)
  await service.sendOrderShippedEmail(mockOrder, { courierName: 'Rabbit', trackingNumber: 'BUNNY-1' } as any)
  await service.sendOrderDeliveredEmail(mockOrder)
  await service.sendOrderCancelledEmail(mockOrder, 'Lost in time')
}

runTest().catch(console.error)
