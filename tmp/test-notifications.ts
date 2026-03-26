import { CommerceNotificationService } from '../apps/ecommerce/api/src/features/commerce/application/commerce-notification-service.js'
import * as mailer from '../apps/framework/src/runtime/notifications/smtp-mailer.js'

// Mock the mailer function
const mockSendMail = async (input: any) => {
  console.log('--- MOCKED EMAIL START ---')
  console.log('To:', JSON.stringify(input.to))
  console.log('Subject:', input.subject)
  console.log('HTML Length:', input.html?.length)
  if (input.html?.includes('Order Received!')) console.log('Found Content: Order Received!')
  if (input.html?.includes('Order Confirmed!')) console.log('Found Content: Order Confirmed!')
  if (input.html?.includes('Your Order is Shipped!')) console.log('Found Content: Your Order is Shipped!')
  if (input.html?.includes('Delivered!')) console.log('Found Content: Delivered!')
  if (input.html?.includes('Order Cancelled')) console.log('Found Content: Order Cancelled')
  console.log('--- MOCKED EMAIL END ---')
  return { messageId: 'mock-id' }
}

const mockOrder: any = {
// ... existing mockOrder ...
  orderNumber: 'SO-TEST-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  subtotal: 1000,
  shippingAmount: 50,
  handlingAmount: 10,
  totalAmount: 1060,
  currency: 'INR',
  items: [
    { productName: 'Test Product', size: 'M', color: 'Blue', quantity: 1, lineTotal: 1000 }
  ],
  addressLine1: 'Test Address 1',
  city: 'Test City',
  state: 'Test State',
  postalCode: '123456',
  country: 'Test Country'
}

const mockShipment: any = {
  courierName: 'TEST Courier',
  trackingNumber: 'TRACK-789',
  trackingUrl: 'https://test-track.com/TRACK-789'
}

async function runTest() {
  const service = new CommerceNotificationService(mockSendMail)
  
  console.log('Test: Order Received')
  await service.sendOrderReceivedEmail(mockOrder)
  
  console.log('\nTest: Order Confirmed')
  await service.sendOrderConfirmedEmail(mockOrder)
  
  console.log('\nTest: Order Shipped')
  await service.sendOrderShippedEmail(mockOrder, mockShipment)
  
  console.log('\nTest: Order Delivered')
  await service.sendOrderDeliveredEmail(mockOrder)
  
  console.log('\nTest: Order Cancelled')
  await service.sendOrderCancelledEmail(mockOrder, 'Out of stock')
}

runTest().catch(console.error)
