import {
  deliveryChannels,
  navigationSections,
  productModules,
  validateBalancedVoucher,
} from '@shared/index'
import { Panel, StatusBadge } from '@ui/index'

const accountingInvariant = validateBalancedVoucher({
  voucherType: 'sales_invoice',
  voucherNumber: 'SI-0001',
  postingDate: '2026-03-21',
  effectiveDate: '2026-03-21',
  createdAt: '2026-03-21T09:00:00.000Z',
  lines: [
    { ledgerId: 'accounts_receivable', debit: 1000, credit: 0 },
    { ledgerId: 'sales_revenue', debit: 0, credit: 1000 },
  ],
})

export function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Shared Codebase ERP Platform</p>
          <h1>CXNext</h1>
          <p className="hero__summary">
            ERP, CRM, online store, billing, and desktop operations software
            built on one TypeScript platform with React, Electron, and Node.js.
          </p>
        </div>
        <div className="hero__card">
          <h2>Engineering baseline</h2>
          <ul>
            <li>TypeScript across web, API, desktop, and shared packages</li>
            <li>Clean separation between domain, application, transport, and UI</li>
            <li>Explicit accounting guardrails before feature expansion</li>
          </ul>
        </div>
      </header>

      <section className="grid grid--two">
        <Panel eyebrow="Channels" title="Delivery surfaces">
          <div className="stack">
            {deliveryChannels.map((channel) => (
              <article key={channel.id} className="list-card">
                <h3>{channel.name}</h3>
                <p>{channel.summary}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Guardrails" title="Accounting invariant sample">
          <div className="invariant">
            <p>
              Balanced voucher validation:
              <strong>{accountingInvariant.ok ? ' pass' : ' fail'}</strong>
            </p>
            <p>
              Every future posting workflow must preserve atomicity,
              traceability, and balanced ledger lines.
            </p>
          </div>
        </Panel>
      </section>

      <section className="grid">
        <Panel eyebrow="Module map" title="Product modules">
          <div className="module-grid">
            {productModules.map((module) => (
              <article key={module.id} className="module-card">
                <div className="module-card__header">
                  <h3>{module.name}</h3>
                  <StatusBadge status={module.readiness} />
                </div>
                <p>{module.summary}</p>
              </article>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid grid--three">
        {navigationSections.map((section) => (
          <Panel key={section.title} eyebrow="Workstreams" title={section.title}>
            <ul className="module-list">
              {section.moduleIds.map((moduleId) => {
                const module = productModules.find((entry) => entry.id === moduleId)

                return module ? <li key={module.id}>{module.name}</li> : null
              })}
            </ul>
          </Panel>
        ))}
      </section>
    </main>
  )
}
