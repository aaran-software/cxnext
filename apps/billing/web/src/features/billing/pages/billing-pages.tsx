import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, Landmark, Printer, ReceiptText, Scale, ShieldCheck, Wallet, XCircle } from 'lucide-react'
import { CommonList, type CommonListColumn } from '@admin-web/components/forms/CommonList'
import { Badge } from '@admin-web/components/ui/badge'
import { Button } from '@admin-web/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@admin-web/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@admin-web/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@admin-web/components/ui/table'
import { buildLedgerPostingLines, calculateVoucherTotals, resolveLedgerName, summarizeLedgerBalances, useBillingStore } from '@billing-web/features/billing/lib/billing-store'
import { billingVoucherModules } from '@billing-web/features/billing/lib/billing-config'
import type { BillingVoucher, BillingVoucherModuleDefinition, BillingVoucherType } from '@billing-web/features/billing/lib/billing-types'

function VoucherDetailDialog({
  open,
  voucher,
  module,
  onOpenChange,
  onCancel,
}: {
  open: boolean
  voucher: BillingVoucher | null
  module: BillingVoucherModuleDefinition
  onOpenChange: (open: boolean) => void
  onCancel: () => void
}) {
  const { state } = useBillingStore()

  if (!voucher) {
    return null
  }

  const totals = calculateVoucherTotals(voucher, state.taxRates, module.usesInventoryRows)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-2xl p-0">
        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle>{voucher.voucherNumber}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">{module.documentLabel} detail surface.</p>
            </div>
            <Badge variant={voucher.status === 'posted' ? 'default' : voucher.status === 'cancelled' ? 'secondary' : 'outline'}>
              {voucher.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid gap-6 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1rem] border border-border/70 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Date</p>
              <p className="mt-2 font-semibold">{voucher.postingDate}</p>
            </div>
            <div className="rounded-[1rem] border border-border/70 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Reference</p>
              <p className="mt-2 font-semibold">{voucher.referenceNumber || '-'}</p>
            </div>
            <div className="rounded-[1rem] border border-border/70 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Counterparty</p>
              <p className="mt-2 font-semibold">{resolveLedgerName(state.ledgers, voucher.counterpartyLedgerId)}</p>
            </div>
            <div className="rounded-[1rem] border border-border/70 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total</p>
              <p className="mt-2 font-semibold">{(module.usesInventoryRows ? totals.total : totals.debit).toFixed(2)}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.2rem] border border-border/70">
            <div className="border-b border-border/60 bg-muted/20 px-4 py-3">
              <p className="font-semibold text-foreground">Rows</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Ledger</TableHead>
                    <TableHead>Description</TableHead>
                    {module.usesInventoryRows ? (
                      <TableHead className="text-right">Total</TableHead>
                    ) : (
                      <>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voucher.lines.map((line, index) => (
                    <TableRow key={line.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{resolveLedgerName(state.ledgers, line.ledgerId)}</TableCell>
                      <TableCell>{line.itemName || line.description || '-'}</TableCell>
                      {module.usesInventoryRows ? (
                        <TableCell className="text-right">{(line.quantity * line.rate).toFixed(2)}</TableCell>
                      ) : (
                        <>
                          <TableCell className="text-right">{line.debit.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{line.credit.toFixed(2)}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={voucher.status === 'cancelled'}>
            <XCircle className="size-4" />
            Cancel Voucher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BillingVoucherPage({ type }: { type: BillingVoucherType }) {
  const module = billingVoucherModules[type]
  const { state, cancelVoucher } = useBillingStore()
  const [searchValue, setSearchValue] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)

  const items = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase()
    return state.vouchers
      .filter((voucher) => voucher.type === type)
      .filter((voucher) =>
        normalized.length === 0
          || [voucher.voucherNumber, voucher.referenceNumber, voucher.narration, resolveLedgerName(state.ledgers, voucher.counterpartyLedgerId)]
            .join(' ')
            .toLowerCase()
            .includes(normalized),
      )
  }, [searchValue, state.ledgers, state.vouchers, type])

  const detailVoucher = detailId ? state.vouchers.find((item) => item.id === detailId) ?? null : null

  const columns: CommonListColumn<BillingVoucher>[] = [
    {
      id: 'voucher',
      header: module.documentLabel,
      accessor: (item) => item.voucherNumber,
      sortable: true,
      cell: (item) => (
        <div>
          <p className="font-medium text-foreground">{item.voucherNumber}</p>
          <p className="text-sm text-muted-foreground">{item.referenceNumber || 'No reference'}</p>
        </div>
      ),
    },
    {
      id: 'party',
      header: 'Party / Ledger',
      accessor: (item) => resolveLedgerName(state.ledgers, item.counterpartyLedgerId),
      cell: (item) => (
        <div>
          <p className="font-medium text-foreground">{resolveLedgerName(state.ledgers, item.counterpartyLedgerId)}</p>
          <p className="text-sm text-muted-foreground">{item.placeOfSupply}</p>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessor: (item) => item.postingDate,
      sortable: true,
      cell: (item) => item.postingDate,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item) => item.status,
      cell: (item) => (
        <Badge variant={item.status === 'posted' ? 'default' : item.status === 'cancelled' ? 'secondary' : 'outline'}>
          {item.status}
        </Badge>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      cell: (item) => (
        <Button type="button" variant="outline" size="sm" onClick={() => setDetailId(item.id)}>
          View
        </Button>
      ),
      className: 'w-24 text-right',
      headerClassName: 'w-24 text-right',
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="border-b border-border/60 p-8">
          <Badge className="w-fit">Billing</Badge>
          <CardTitle className="text-4xl tracking-tight sm:text-5xl">{module.title}</CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">{module.description}</CardDescription>
        </CardHeader>
      </Card>

      <CommonList
        header={{
          pageTitle: module.title,
          pageDescription: `${module.documentLabel} list from the billing workspace.`,
          addLabel: 'Create in Billing App',
          onAddClick: () => {},
        }}
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: `Search ${module.title.toLowerCase()}`,
        }}
        table={{
          columns,
          data: items,
          emptyMessage: `No ${module.title.toLowerCase()} found.`,
          rowKey: (item) => item.id,
        }}
        footer={{
          content: (
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Total vouchers: <span className="font-medium text-foreground">{items.length}</span>
              </span>
            </div>
          ),
        }}
      />

      <VoucherDetailDialog
        open={detailId !== null}
        voucher={detailVoucher}
        module={module}
        onOpenChange={(open) => {
          if (!open) {
            setDetailId(null)
          }
        }}
        onCancel={() => {
          if (!detailVoucher) {
            return
          }
          cancelVoucher(detailVoucher.id)
          setDetailId(null)
        }}
      />
    </div>
  )
}

export function BillingLedgerListPage() {
  const { state } = useBillingStore()

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="border-b border-border/60 p-8">
          <Badge className="w-fit">Billing</Badge>
          <CardTitle className="text-4xl tracking-tight sm:text-5xl">Ledger Masters</CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
            Customer, supplier, cash, bank, tax, expense, and revenue ledgers with GST and opening balance controls.
          </CardDescription>
        </CardHeader>
      </Card>

      <CommonList
        header={{
          pageTitle: 'Ledgers',
          pageDescription: 'Ledger masters across the billing app.',
        }}
        table={{
          columns: [
            {
              id: 'ledger',
              header: 'Ledger',
              accessor: (item) => item.name,
              sortable: true,
              cell: (item) => (
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.code}</p>
                </div>
              ),
            },
            {
              id: 'category',
              header: 'Category',
              accessor: (item) => item.category,
              sortable: true,
              cell: (item) => <Badge variant="outline">{item.category}</Badge>,
            },
            {
              id: 'group',
              header: 'Parent Group',
              accessor: (item) => item.parentGroup,
              sortable: true,
              cell: (item) => item.parentGroup,
            },
            {
              id: 'gstin',
              header: 'GSTIN',
              accessor: (item) => item.gstin,
              cell: (item) => item.gstin || '-',
            },
          ],
          data: state.ledgers,
          rowKey: (item) => item.id,
        }}
      />
    </div>
  )
}

export function BillingGstCenterPage() {
  const { state } = useBillingStore()
  const salesTotals = state.vouchers
    .filter((item) => item.type === 'sales')
    .reduce((sum, item) => sum + calculateVoucherTotals(item, state.taxRates, true).gstAmount, 0)
  const purchaseTotals = state.vouchers
    .filter((item) => item.type === 'purchase')
    .reduce((sum, item) => sum + calculateVoucherTotals(item, state.taxRates, true).gstAmount, 0)
  const postingLines = buildLedgerPostingLines(state.vouchers, state.ledgers, state.taxRates)
  const balances = summarizeLedgerBalances(postingLines)
  const topLedgers = state.ledgers
    .map((ledger) => ({ ledger, ...(balances.get(ledger.id) ?? { debit: 0, credit: 0 }) }))
    .filter((entry) => entry.debit + entry.credit > 0)
    .slice(0, 6)

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="border-b border-border/60 p-8">
          <Badge className="w-fit">Billing</Badge>
          <CardTitle className="text-4xl tracking-tight sm:text-5xl">GST Compliance Center</CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
            Track tax rates, filing-ready totals, and ledger drill-down from billing reports.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Output GST</span><ReceiptText className="size-4 text-muted-foreground" /></div><p className="mt-3 text-2xl font-semibold">{salesTotals.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Input GST</span><Wallet className="size-4 text-muted-foreground" /></div><p className="mt-3 text-2xl font-semibold">{purchaseTotals.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Net Liability</span><Calculator className="size-4 text-muted-foreground" /></div><p className="mt-3 text-2xl font-semibold">{(salesTotals - purchaseTotals).toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Active Rates</span><Scale className="size-4 text-muted-foreground" /></div><p className="mt-3 text-2xl font-semibold">{state.taxRates.filter((item) => item.isActive).length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ledger Drill-down</CardTitle>
          <CardDescription>Jump from billing reports into active ledgers carrying posting movement.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topLedgers.map((entry) => (
            <Link key={entry.ledger.id} to={`/admin/dashboard/billing/ledgers?focus=${encodeURIComponent(entry.ledger.id)}`} className="rounded-[1rem] border border-border/70 bg-background/60 px-4 py-3 transition hover:border-accent/40 hover:bg-background">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{entry.ledger.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.ledger.code}</p>
                </div>
                <Badge variant="outline">{entry.ledger.category}</Badge>
              </div>
              <div className="mt-3 grid gap-1 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Debit</span><span>{entry.debit.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">Credit</span><span>{entry.credit.toFixed(2)}</span></div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Checklist</CardTitle>
          <CardDescription>Billing app readiness points for GST-aware accounting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            'GST treatment present on every sales and purchase voucher.',
            'HSN/SAC captured in item rows.',
            'Input vs output GST visible before filing handoff.',
            'Voucher posting remains traceable from list to row level.',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-[1rem] border border-border/70 bg-background/60 px-4 py-3">
              <ShieldCheck className="mt-0.5 size-4 text-emerald-600" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function BillingOverviewPage() {
  const modules = [
    { name: 'Ledgers', route: '/admin/dashboard/billing/ledgers', icon: Landmark, summary: 'Account masters, groups, GSTIN, and opening balances.' },
    { name: 'Sales Invoices', route: '/admin/dashboard/billing/invoices', icon: ReceiptText, summary: 'GST invoice review and voucher surface.' },
    { name: 'Purchase Vouchers', route: '/admin/dashboard/billing/purchases', icon: Wallet, summary: 'Supplier inward purchase entries and totals.' },
    { name: 'Receipts', route: '/admin/dashboard/billing/receipts', icon: Wallet, summary: 'Customer receipts and collection posting.' },
    { name: 'Payments', route: '/admin/dashboard/billing/payments', icon: Wallet, summary: 'Supplier and expense payments from cash or bank.' },
    { name: 'Journals', route: '/admin/dashboard/billing/journals', icon: Calculator, summary: 'Manual adjustments with balanced posting lines.' },
    { name: 'Contra', route: '/admin/dashboard/billing/contra', icon: Scale, summary: 'Cash and bank transfer entries.' },
    { name: 'GST Center', route: '/admin/dashboard/billing/gst', icon: ShieldCheck, summary: 'Tax rates, compliance totals, and filing-readiness surface.' },
  ]

  return (
    <div className="space-y-4">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="border-b border-border/60 p-8">
          <Badge className="w-fit">Billing</Badge>
          <CardTitle className="text-4xl tracking-tight sm:text-5xl">Accounts and Billing Desk</CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">Voucher-style accounting modules, GST surfaces, and billing reports under one app boundary.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((item) => {
            const ItemIcon = item.icon
            return (
              <Link key={item.route} to={item.route} className="rounded-[1.5rem] border border-border/70 bg-card/70 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.summary}</p>
                  </div>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
                    <ItemIcon className="size-5 text-accent" />
                  </div>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export function BillingSalesInvoicePage() {
  return <BillingVoucherPage type="sales" />
}

export function BillingPurchaseVoucherPage() {
  return <BillingVoucherPage type="purchase" />
}

export function BillingReceiptVoucherPage() {
  return <BillingVoucherPage type="receipt" />
}

export function BillingPaymentVoucherPage() {
  return <BillingVoucherPage type="payment" />
}

export function BillingJournalVoucherPage() {
  return <BillingVoucherPage type="journal" />
}

export function BillingContraVoucherPage() {
  return <BillingVoucherPage type="contra" />
}
