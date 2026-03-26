import { CommerceNotificationService } from '../apps/ecommerce/api/src/features/commerce/application/commerce-notification-service.js'

async function runTest() {
  const mockOrder: any = {
    orderNumber: 'SO-FINAL-1',
    firstName: 'Frank',
    lastName: 'Test',
    email: 'frank@example.com',
    subtotal: 10,
    shippingAmount: 0,
    handlingAmount: 0,
    totalAmount: 10,
    currency: 'USD',
    items: [{ productName: 'Final Test', size: 'N/A', color: 'N/A', quantity: 1, lineTotal: 10 }],
    addressLine1: 'Final Address',
    city: 'FinalCity',
    state: 'FC',
    postalCode: '000',
    country: 'FinalLand'
  }

  const sender = async (input: any) => {
    console.log(`[PASS] Subject: ${input.subject}`)
    return { messageId: 'final-msg' }
  }

  const service = new CommerceNotificationService(sender)
  await service.sendOrderReceivedEmail(mockOrder)
}

runTest().catch(console.error)
