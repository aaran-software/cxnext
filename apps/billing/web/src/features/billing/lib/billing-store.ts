import { useSyncExternalStore } from 'react'
import type { BillingLedger, BillingLedgerPostingLine, BillingStoreState, BillingTaxRate, BillingVoucher, BillingVoucherLine, BillingVoucherType } from '@billing-web/features/billing/lib/billing-types'

const STORAGE_KEY = 'cxnext.billing.workspace.v1'

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function createDefaultLedgers(): BillingLedger[] {
  return [
    { id: 'led-cash', code: 'CASH001', name: 'Cash-in-Hand', category: 'cash', parentGroup: 'Cash-in-Hand', gstin: '', state: 'Tamil Nadu', openingBalance: 25000, balanceSide: 'dr', isActive: true },
    { id: 'led-bank', code: 'BANK001', name: 'ICICI Current Account', category: 'bank', parentGroup: 'Bank Accounts', gstin: '', state: 'Tamil Nadu', openingBalance: 180000, balanceSide: 'dr', isActive: true },
    { id: 'led-customer', code: 'CUS001', name: 'Aaran Retail LLP', category: 'customer', parentGroup: 'Sundry Debtors', gstin: '33ABCDE1234F1Z5', state: 'Tamil Nadu', openingBalance: 64000, balanceSide: 'dr', isActive: true },
    { id: 'led-supplier', code: 'SUP001', name: 'Tiruppur Yarn Mills', category: 'supplier', parentGroup: 'Sundry Creditors', gstin: '33AACCT7788R1Z2', state: 'Tamil Nadu', openingBalance: 42000, balanceSide: 'cr', isActive: true },
    { id: 'led-sales', code: 'SAL001', name: 'Domestic Sales', category: 'sales', parentGroup: 'Sales Accounts', gstin: '', state: 'Tamil Nadu', openingBalance: 0, balanceSide: 'cr', isActive: true },
    { id: 'led-purchase', code: 'PUR001', name: 'Purchase Account', category: 'purchase', parentGroup: 'Purchase Accounts', gstin: '', state: 'Tamil Nadu', openingBalance: 0, balanceSide: 'dr', isActive: true },
    { id: 'led-gst', code: 'GST001', name: 'Output CGST/SGST', category: 'tax', parentGroup: 'Duties and Taxes', gstin: '', state: 'Tamil Nadu', openingBalance: 0, balanceSide: 'cr', isActive: true },
    { id: 'led-expense', code: 'EXP001', name: 'Freight Charges', category: 'expense', parentGroup: 'Indirect Expenses', gstin: '', state: 'Tamil Nadu', openingBalance: 0, balanceSide: 'dr', isActive: true },
  ]
}

function createDefaultTaxRates(): BillingTaxRate[] {
  return [
    { id: 'tax-0', code: 'GST0', label: 'GST 0%', rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0, cessRate: 0, isActive: true },
    { id: 'tax-5', code: 'GST5', label: 'GST 5%', rate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 5, cessRate: 0, isActive: true },
    { id: 'tax-12', code: 'GST12', label: 'GST 12%', rate: 12, cgstRate: 6, sgstRate: 6, igstRate: 12, cessRate: 0, isActive: true },
    { id: 'tax-18', code: 'GST18', label: 'GST 18%', rate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, cessRate: 0, isActive: true },
  ]
}

function createInventoryLine(id: string, ledgerId: string, itemName: string, gstRateId: string, quantity: number, rate: number): BillingVoucherLine {
  return { id, ledgerId, itemName, description: itemName, hsnSacCode: '6109', quantity, unit: 'Nos', rate, discountPercent: 0, gstRateId, debit: 0, credit: 0 }
}

function createAccountingLine(id: string, ledgerId: string, description: string, debit: number, credit: number): BillingVoucherLine {
  return { id, ledgerId, itemName: '', description, hsnSacCode: '', quantity: 1, unit: 'Nos', rate: 0, discountPercent: 0, gstRateId: 'tax-0', debit, credit }
}

function createDefaultVouchers(): BillingVoucher[] {
  return [
    { id: 'v-sales-1', type: 'sales', voucherNumber: 'INV-0001', postingDate: '2026-03-24', referenceNumber: 'PO-1108', counterpartyLedgerId: 'led-customer', placeOfSupply: 'Tamil Nadu', gstTreatment: 'regular', paymentMode: 'bank', narration: 'Spring knitwear dispatch invoice.', status: 'posted', lines: [createInventoryLine('line-1', 'led-sales', 'Cotton Polo Tee', 'tax-12', 24, 450), createInventoryLine('line-2', 'led-sales', 'Ribbed Lounge Set', 'tax-5', 8, 680)] },
    { id: 'v-purchase-1', type: 'purchase', voucherNumber: 'PUR-0001', postingDate: '2026-03-22', referenceNumber: 'SUP-443', counterpartyLedgerId: 'led-supplier', placeOfSupply: 'Tamil Nadu', gstTreatment: 'regular', paymentMode: 'bank', narration: 'Yarn and trims inward purchase.', status: 'posted', lines: [createInventoryLine('line-3', 'led-purchase', 'Combed Cotton Yarn', 'tax-5', 120, 210)] },
    { id: 'v-receipt-1', type: 'receipt', voucherNumber: 'RCPT-0001', postingDate: '2026-03-23', referenceNumber: 'UTR-91091', counterpartyLedgerId: 'led-customer', placeOfSupply: 'Tamil Nadu', gstTreatment: 'regular', paymentMode: 'bank', narration: 'Collection against invoice INV-0001.', status: 'posted', lines: [createAccountingLine('line-4', 'led-bank', 'Bank receipt', 18000, 0), createAccountingLine('line-5', 'led-customer', 'Against customer ledger', 0, 18000)] },
    { id: 'v-journal-1', type: 'journal', voucherNumber: 'JRN-0001', postingDate: '2026-03-24', referenceNumber: 'ADJ-12', counterpartyLedgerId: '', placeOfSupply: 'Tamil Nadu', gstTreatment: 'regular', paymentMode: 'adjustment', narration: 'Month-end expense accrual.', status: 'draft', lines: [createAccountingLine('line-6', 'led-expense', 'Freight accrual', 3200, 0), createAccountingLine('line-7', 'led-bank', 'Provision', 0, 3200)] },
  ]
}

function getDefaultState(): BillingStoreState {
  return { ledgers: createDefaultLedgers(), taxRates: createDefaultTaxRates(), vouchers: createDefaultVouchers() }
}

function readState(): BillingStoreState {
  if (typeof window === 'undefined') return getDefaultState()
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return getDefaultState()
  try { return JSON.parse(raw) as BillingStoreState } catch { return getDefaultState() }
}

let state = readState()
const listeners = new Set<() => void>()

function emit() {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  listeners.forEach((listener) => listener())
}

function updateState(updater: (current: BillingStoreState) => BillingStoreState) {
  state = updater(state)
  emit()
}

export function useBillingStore() {
  const snapshot = useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener) }, () => state, () => state)
  return {
    state: snapshot,
    createLedger(input: Omit<BillingLedger, 'id'>) {
      const nextLedger: BillingLedger = { ...input, id: createId('ledger') }
      updateState((current) => ({ ...current, ledgers: [nextLedger, ...current.ledgers] }))
      return nextLedger
    },
    updateLedger(id: string, input: Omit<BillingLedger, 'id'>) {
      updateState((current) => ({ ...current, ledgers: current.ledgers.map((ledger) => (ledger.id === id ? { ...input, id } : ledger)) }))
    },
    createVoucher(input: Omit<BillingVoucher, 'id'>) {
      const nextVoucher: BillingVoucher = { ...input, id: createId('voucher'), lines: input.lines.map((line) => ({ ...line, id: line.id || createId('line') })) }
      updateState((current) => ({ ...current, vouchers: [nextVoucher, ...current.vouchers] }))
      return nextVoucher
    },
    updateVoucher(id: string, input: Omit<BillingVoucher, 'id'>) {
      updateState((current) => ({ ...current, vouchers: current.vouchers.map((voucher) => (voucher.id === id ? { ...input, id } : voucher)) }))
    },
    cancelVoucher(id: string) {
      updateState((current) => ({ ...current, vouchers: current.vouchers.map((voucher) => voucher.id === id ? { ...voucher, status: 'cancelled', narration: voucher.narration ? `${voucher.narration} (Cancelled)` : 'Cancelled voucher' } : voucher) }))
    },
    createTaxRate(input: Omit<BillingTaxRate, 'id'>) {
      const nextRate: BillingTaxRate = { ...input, id: createId('tax') }
      updateState((current) => ({ ...current, taxRates: [nextRate, ...current.taxRates] }))
      return nextRate
    },
  }
}

export function buildNextVoucherNumber(vouchers: BillingVoucher[], type: BillingVoucherType, prefix: string) {
  const currentMax = vouchers.filter((voucher) => voucher.type === type).map((voucher) => { const match = voucher.voucherNumber.match(/(\d+)$/); return match ? Number(match[1]) : 0 }).reduce((max, current) => Math.max(max, current), 0)
  return `${prefix}-${String(currentMax + 1).padStart(4, '0')}`
}

export function resolveLedgerName(ledgers: BillingLedger[], ledgerId: string) {
  return ledgers.find((ledger) => ledger.id === ledgerId)?.name ?? '-'
}

export function resolveTaxRate(taxRates: BillingTaxRate[], taxRateId: string) {
  return taxRates.find((rate) => rate.id === taxRateId)?.rate ?? 0
}

export function calculateInventoryLineTotal(line: BillingVoucherLine, taxRates: BillingTaxRate[]) {
  const gross = roundCurrency(line.quantity * line.rate)
  const discountAmount = roundCurrency(gross * (line.discountPercent / 100))
  const taxableValue = roundCurrency(gross - discountAmount)
  const gstAmount = roundCurrency(taxableValue * (resolveTaxRate(taxRates, line.gstRateId) / 100))
  const total = roundCurrency(taxableValue + gstAmount)
  return { gross, discountAmount, taxableValue, gstAmount, total }
}

export function calculateVoucherTotals(voucher: Pick<BillingVoucher, 'lines'>, taxRates: BillingTaxRate[], inventoryMode: boolean) {
  if (inventoryMode) {
    return voucher.lines.reduce((summary, line) => {
      const totals = calculateInventoryLineTotal(line, taxRates)
      return { taxableValue: roundCurrency(summary.taxableValue + totals.taxableValue), gstAmount: roundCurrency(summary.gstAmount + totals.gstAmount), total: roundCurrency(summary.total + totals.total), debit: 0, credit: 0 }
    }, { taxableValue: 0, gstAmount: 0, total: 0, debit: 0, credit: 0 })
  }
  return voucher.lines.reduce((summary, line) => ({ taxableValue: 0, gstAmount: 0, total: roundCurrency(summary.total + line.debit), debit: roundCurrency(summary.debit + line.debit), credit: roundCurrency(summary.credit + line.credit) }), { taxableValue: 0, gstAmount: 0, total: 0, debit: 0, credit: 0 })
}

export function getLockedPeriodCutoff() {
  return '2026-03-01'
}

export function validateVoucherRules(voucher: Omit<BillingVoucher, 'id'>, vouchers: BillingVoucher[], ledgers: BillingLedger[], taxRates: BillingTaxRate[], inventoryMode: boolean, editingId?: string | null) {
  if (voucher.postingDate < getLockedPeriodCutoff()) return `The period before ${getLockedPeriodCutoff()} is locked.`
  const duplicate = vouchers.find((item) => item.type === voucher.type && item.voucherNumber.trim().toLowerCase() === voucher.voucherNumber.trim().toLowerCase() && item.id !== editingId)
  if (duplicate) return `Voucher number ${voucher.voucherNumber} already exists for this voucher type.`
  const activeLedgerIds = new Set(ledgers.filter((item) => item.isActive).map((item) => item.id))
  if (voucher.lines.some((line) => !activeLedgerIds.has(line.ledgerId))) return 'Every voucher line must use an active ledger.'
  if (voucher.counterpartyLedgerId && !activeLedgerIds.has(voucher.counterpartyLedgerId)) return 'Counterparty ledger must be active.'
  if (!inventoryMode) {
    const totals = calculateVoucherTotals(voucher, taxRates, false)
    if (totals.debit !== totals.credit) return `Voucher is not balanced. Debit ${totals.debit} and credit ${totals.credit} must match.`
  }
  if (voucher.type === 'contra' && voucher.lines.some((line) => { const ledger = ledgers.find((item) => item.id === line.ledgerId); return ledger && !['cash', 'bank'].includes(ledger.category) })) return 'Contra vouchers allow only cash and bank ledgers.'
  if (voucher.type === 'receipt' && voucher.lines.some((line) => { const ledger = ledgers.find((item) => item.id === line.ledgerId); return ledger && ['purchase', 'expense'].includes(ledger.category) })) return 'Receipt vouchers cannot post directly to purchase or expense ledgers.'
  if (voucher.type === 'payment' && voucher.lines.some((line) => { const ledger = ledgers.find((item) => item.id === line.ledgerId); return ledger && ['sales', 'income'].includes(ledger.category) })) return 'Payment vouchers cannot post directly to sales or income ledgers.'
  return null
}

export function buildLedgerPostingLines(vouchers: BillingVoucher[], ledgers: BillingLedger[], taxRates: BillingTaxRate[]) {
  const postingLines: BillingLedgerPostingLine[] = []
  vouchers.filter((voucher) => voucher.status === 'posted').forEach((voucher) => {
    if (voucher.type === 'sales' || voucher.type === 'purchase') {
      const total = calculateVoucherTotals(voucher, taxRates, true)
      const revenueLedgerId = voucher.lines[0]?.ledgerId ?? ''
      const controlLedgerId = voucher.counterpartyLedgerId
      const taxLedgerId = ledgers.find((item) => item.category === 'tax')?.id ?? ''
      if (controlLedgerId) postingLines.push({ voucherId: voucher.id, voucherType: voucher.type, voucherNumber: voucher.voucherNumber, postingDate: voucher.postingDate, ledgerId: controlLedgerId, debit: voucher.type === 'sales' ? total.total : 0, credit: voucher.type === 'purchase' ? total.total : 0, narration: voucher.narration })
      if (revenueLedgerId) postingLines.push({ voucherId: voucher.id, voucherType: voucher.type, voucherNumber: voucher.voucherNumber, postingDate: voucher.postingDate, ledgerId: revenueLedgerId, debit: voucher.type === 'purchase' ? total.taxableValue : 0, credit: voucher.type === 'sales' ? total.taxableValue : 0, narration: voucher.narration })
      if (taxLedgerId && total.gstAmount > 0) postingLines.push({ voucherId: voucher.id, voucherType: voucher.type, voucherNumber: voucher.voucherNumber, postingDate: voucher.postingDate, ledgerId: taxLedgerId, debit: voucher.type === 'purchase' ? total.gstAmount : 0, credit: voucher.type === 'sales' ? total.gstAmount : 0, narration: voucher.narration })
      return
    }
    voucher.lines.forEach((line) => postingLines.push({ voucherId: voucher.id, voucherType: voucher.type, voucherNumber: voucher.voucherNumber, postingDate: voucher.postingDate, ledgerId: line.ledgerId, debit: line.debit, credit: line.credit, narration: line.description || voucher.narration }))
  })
  return postingLines
}

export function summarizeLedgerBalances(lines: BillingLedgerPostingLine[]) {
  const summary = new Map<string, { debit: number; credit: number }>()
  lines.forEach((line) => {
    const current = summary.get(line.ledgerId) ?? { debit: 0, credit: 0 }
    summary.set(line.ledgerId, { debit: roundCurrency(current.debit + line.debit), credit: roundCurrency(current.credit + line.credit) })
  })
  return summary
}
