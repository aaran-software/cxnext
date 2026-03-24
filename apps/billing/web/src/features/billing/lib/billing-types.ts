export type BillingVoucherType = 'sales' | 'purchase' | 'receipt' | 'payment' | 'journal' | 'contra'

export type BillingLedgerCategory =
  | 'customer'
  | 'supplier'
  | 'cash'
  | 'bank'
  | 'sales'
  | 'purchase'
  | 'tax'
  | 'expense'
  | 'income'

export type BillingVoucherStatus = 'draft' | 'posted' | 'cancelled'

export type BillingLedger = {
  id: string
  code: string
  name: string
  category: BillingLedgerCategory
  parentGroup: string
  gstin: string
  state: string
  openingBalance: number
  balanceSide: 'dr' | 'cr'
  isActive: boolean
}

export type BillingTaxRate = {
  id: string
  code: string
  label: string
  rate: number
  cgstRate: number
  sgstRate: number
  igstRate: number
  cessRate: number
  isActive: boolean
}

export type BillingVoucherLine = {
  id: string
  ledgerId: string
  itemName: string
  description: string
  hsnSacCode: string
  quantity: number
  unit: string
  rate: number
  discountPercent: number
  gstRateId: string
  debit: number
  credit: number
}

export type BillingVoucher = {
  id: string
  type: BillingVoucherType
  voucherNumber: string
  postingDate: string
  referenceNumber: string
  counterpartyLedgerId: string
  placeOfSupply: string
  gstTreatment: 'regular' | 'consumer' | 'sez' | 'export' | 'exempted'
  paymentMode: 'cash' | 'bank' | 'upi' | 'cheque' | 'adjustment'
  narration: string
  status: BillingVoucherStatus
  lines: BillingVoucherLine[]
}

export type BillingStoreState = {
  ledgers: BillingLedger[]
  taxRates: BillingTaxRate[]
  vouchers: BillingVoucher[]
}

export type BillingLedgerPostingLine = {
  voucherId: string
  voucherType: BillingVoucherType
  voucherNumber: string
  postingDate: string
  ledgerId: string
  debit: number
  credit: number
  narration: string
}

export type BillingOption = {
  value: string
  label: string
}

export type BillingVoucherModuleDefinition = {
  type: BillingVoucherType
  title: string
  description: string
  addLabel: string
  route: string
  documentLabel: string
  usesInventoryRows: boolean
  numberPrefix: string
}
