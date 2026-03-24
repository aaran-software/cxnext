import { billingCoreManifest } from '@billing-core/index'
import { frameworkServices } from '@framework-core/index'

export function BillingApp() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f4efe6 0%, #efe6d7 100%)',
        color: '#231f1a',
        fontFamily: '"Segoe UI", sans-serif',
      }}
    >
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 24px 32px' }}>
        <div
          style={{
            border: '1px solid rgba(35, 31, 26, 0.12)',
            borderRadius: 28,
            background: 'rgba(255, 250, 242, 0.88)',
            padding: 32,
            boxShadow: '0 18px 60px rgba(35, 31, 26, 0.08)',
          }}
        >
          <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.7 }}>
            Billing base
          </p>
          <h1 style={{ margin: '16px 0 12px', fontSize: 48, lineHeight: 1.05 }}>
            Accountant-first billing, accounts, and stock foundation.
          </h1>
          <p style={{ maxWidth: 760, margin: 0, fontSize: 16, lineHeight: 1.7, opacity: 0.82 }}>
            This is the first web base for the Billing app. It reuses the platform visual tone while
            keeping billing as its own application path for accounts, inventory, vouchers, and reports.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginTop: 24,
          }}
        >
          <section
            style={{
              borderRadius: 24,
              border: '1px solid rgba(35, 31, 26, 0.12)',
              background: 'rgba(255, 255, 255, 0.78)',
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Billing domain</h2>
            <ul style={{ margin: '16px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
              {billingCoreManifest.domain.accounts.voucherKinds.slice(0, 5).map((voucherKind) => (
                <li key={voucherKind}>{voucherKind}</li>
              ))}
            </ul>
          </section>

          <section
            style={{
              borderRadius: 24,
              border: '1px solid rgba(35, 31, 26, 0.12)',
              background: 'rgba(255, 255, 255, 0.78)',
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Platform contract</h2>
            <ul style={{ margin: '16px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
              {frameworkServices.slice(0, 5).map((service) => (
                <li key={service.id}>{service.name}</li>
              ))}
            </ul>
          </section>

          <section
            style={{
              borderRadius: 24,
              border: '1px solid rgba(35, 31, 26, 0.12)',
              background: 'rgba(255, 255, 255, 0.78)',
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Next build order</h2>
            <ol style={{ margin: '16px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
              <li>Accounts core</li>
              <li>Inventory core</li>
              <li>Billing documents</li>
              <li>Financial reports</li>
            </ol>
          </section>
        </div>
      </section>
    </main>
  )
}
