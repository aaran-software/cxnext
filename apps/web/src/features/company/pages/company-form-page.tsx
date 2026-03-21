import type {
  Company,
  CompanyAddressInput,
  CompanyBankAccountInput,
  CompanyEmailInput,
  CompanyLogoInput,
  CompanyPhoneInput,
  CompanyUpsertPayload,
  CommonModuleItem,
} from '@shared/index'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { AnimatedTabs, type AnimatedContentTab } from '@/components/ui/animated-tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  createCompany,
  getCompany,
  HttpError,
  listCommonModuleItems,
  updateCompany,
} from '@/shared/api/client'

type CompanyFormValues = CompanyUpsertPayload

const emptyLogo = (): CompanyLogoInput => ({ logoUrl: '', logoType: 'primary' })
const emptyAddress = (): CompanyAddressInput => ({
  addressType: 'head_office',
  addressLine1: '',
  addressLine2: null,
  cityId: null,
  stateId: null,
  countryId: null,
  pincodeId: null,
  latitude: null,
  longitude: null,
  isDefault: true,
})
const emptyEmail = (): CompanyEmailInput => ({ email: '', emailType: 'admin' })
const emptyPhone = (): CompanyPhoneInput => ({ phoneNumber: '', phoneType: 'phone', isPrimary: true })
const emptyBankAccount = (): CompanyBankAccountInput => ({
  bankName: '',
  accountNumber: '',
  accountHolderName: '',
  ifsc: '',
  branch: null,
  isPrimary: true,
})

function createDefaultValues(): CompanyFormValues {
  return {
    name: '',
    legalName: null,
    registrationNumber: null,
    pan: null,
    financialYearStart: null,
    booksStart: null,
    website: null,
    description: null,
    isActive: true,
    logos: [],
    addresses: [emptyAddress()],
    emails: [emptyEmail()],
    phones: [emptyPhone()],
    bankAccounts: [emptyBankAccount()],
  }
}

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Failed to save company.'
}

function toFormValues(company: Company): CompanyFormValues {
  return {
    name: company.name,
    legalName: company.legalName,
    registrationNumber: company.registrationNumber,
    pan: company.pan,
    financialYearStart: company.financialYearStart,
    booksStart: company.booksStart,
    website: company.website,
    description: company.description,
    isActive: company.isActive,
    logos: company.logos.map((logo) => ({ logoUrl: logo.logoUrl, logoType: logo.logoType })),
    addresses: company.addresses.length
      ? company.addresses.map((address) => ({
          addressType: address.addressType,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          cityId: address.cityId,
          stateId: address.stateId,
          countryId: address.countryId,
          pincodeId: address.pincodeId,
          latitude: address.latitude,
          longitude: address.longitude,
          isDefault: address.isDefault,
        }))
      : [emptyAddress()],
    emails: company.emails.length
      ? company.emails.map((email) => ({ email: email.email, emailType: email.emailType }))
      : [emptyEmail()],
    phones: company.phones.length
      ? company.phones.map((phone) => ({
          phoneNumber: phone.phoneNumber,
          phoneType: phone.phoneType,
          isPrimary: phone.isPrimary,
        }))
      : [emptyPhone()],
    bankAccounts: company.bankAccounts.length
      ? company.bankAccounts.map((account) => ({
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountHolderName: account.accountHolderName,
          ifsc: account.ifsc,
          branch: account.branch,
          isPrimary: account.isPrimary,
        }))
      : [emptyBankAccount()],
  }
}

function CollectionCard({
  title,
  description,
  onAdd,
  children,
}: React.PropsWithChildren<{ title: string; description: string; onAdd: () => void }>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

function CollectionRow({
  children,
  onRemove,
}: React.PropsWithChildren<{ onRemove: () => void }>) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 p-4">
      <div className="mb-4 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>
      {children}
    </div>
  )
}

function LookupSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | null
  options: CommonModuleItem[]
  onChange: (value: string | null) => void
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">Not set</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {String(option.name ?? option.code ?? option.id)}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CompanyFormPage() {
  const navigate = useNavigate()
  const { companyId } = useParams()
  const isEditMode = Boolean(companyId)
  const [values, setValues] = useState<CompanyFormValues>(createDefaultValues())
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [countries, setCountries] = useState<CommonModuleItem[]>([])
  const [states, setStates] = useState<CommonModuleItem[]>([])
  const [cities, setCities] = useState<CommonModuleItem[]>([])
  const [pincodes, setPincodes] = useState<CommonModuleItem[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadLookups() {
      const [countryItems, stateItems, cityItems, pincodeItems] = await Promise.all([
        listCommonModuleItems('countries', false),
        listCommonModuleItems('states', false),
        listCommonModuleItems('cities', false),
        listCommonModuleItems('pincodes', false),
      ])

      if (!cancelled) {
        setCountries(countryItems)
        setStates(stateItems)
        setCities(cityItems)
        setPincodes(pincodeItems)
      }
    }

    void loadLookups()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadCompany() {
      if (!companyId) {
        return
      }

      setLoading(true)
      setErrorMessage(null)

      try {
        const company = await getCompany(companyId)
        if (!cancelled) {
          setValues(toFormValues(company))
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(toErrorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadCompany()
    return () => { cancelled = true }
  }, [companyId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setErrorMessage(null)

    try {
      if (companyId) {
        await updateCompany(companyId, values)
      } else {
        await createCompany(values)
      }

      navigate('/dashboard/companies')
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-muted-foreground">Loading company...</CardContent>
      </Card>
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link to="/dashboard/companies">
              <ArrowLeft className="size-4" />
              Back to companies
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold text-foreground">{isEditMode ? 'Edit Company' : 'New Company'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Capture company identity, contacts, addresses, and bank details.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/companies')}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Company'}</Button>
        </div>
      </div>

      {errorMessage ? (
        <Card><CardContent className="p-4 text-sm text-destructive">{errorMessage}</CardContent></Card>
      ) : null}

      <AnimatedTabs
        defaultTabValue="company"
        tabs={[
          {
            label: 'Company',
            value: 'company',
            content: (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Company Basics</CardTitle>
                    <CardDescription>Legal identity and book-opening details.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2"><Label>Name</Label><Input value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} required /></div>
                    <div className="grid gap-2"><Label>Legal Name</Label><Input value={values.legalName ?? ''} onChange={(event) => setValues((current) => ({ ...current, legalName: event.target.value || null }))} /></div>
                    <div className="grid gap-2"><Label>Registration Number</Label><Input value={values.registrationNumber ?? ''} onChange={(event) => setValues((current) => ({ ...current, registrationNumber: event.target.value || null }))} /></div>
                    <div className="grid gap-2"><Label>PAN</Label><Input value={values.pan ?? ''} onChange={(event) => setValues((current) => ({ ...current, pan: event.target.value || null }))} /></div>
                    <div className="grid gap-2"><Label>Financial Year Start</Label><Input type="date" value={values.financialYearStart ?? ''} onChange={(event) => setValues((current) => ({ ...current, financialYearStart: event.target.value || null }))} /></div>
                    <div className="grid gap-2"><Label>Books Start</Label><Input type="date" value={values.booksStart ?? ''} onChange={(event) => setValues((current) => ({ ...current, booksStart: event.target.value || null }))} /></div>
                    <div className="grid gap-2 md:col-span-2"><Label>Website</Label><Input value={values.website ?? ''} onChange={(event) => setValues((current) => ({ ...current, website: event.target.value || null }))} /></div>
                    <div className="grid gap-2 md:col-span-2"><Label>Description</Label><Textarea value={values.description ?? ''} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value || null }))} rows={4} /></div>
                    <label className="flex items-center gap-3 md:col-span-2"><Checkbox checked={values.isActive} onCheckedChange={(checked) => setValues((current) => ({ ...current, isActive: Boolean(checked) }))} /><span className="text-sm font-medium">Active company</span></label>
                  </CardContent>
                </Card>
                <CollectionCard title="Company Logos" description="Primary, secondary, and favicon branding assets." onAdd={() => setValues((current) => ({ ...current, logos: [...current.logos, emptyLogo()] }))}>
                  {values.logos.map((logo, index) => (
                    <CollectionRow key={`logo-${index}`} onRemove={() => setValues((current) => ({ ...current, logos: current.logos.filter((_, rowIndex) => rowIndex !== index) }))}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2"><Label>Logo URL</Label><Input value={logo.logoUrl} onChange={(event) => setValues((current) => ({ ...current, logos: current.logos.map((entry, rowIndex) => rowIndex === index ? { ...entry, logoUrl: event.target.value } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>Logo Type</Label><Input value={logo.logoType} onChange={(event) => setValues((current) => ({ ...current, logos: current.logos.map((entry, rowIndex) => rowIndex === index ? { ...entry, logoType: event.target.value } : entry) }))} /></div>
                      </div>
                    </CollectionRow>
                  ))}
                </CollectionCard>
              </>
            ),
          },
          {
            label: 'Communication',
            value: 'communication',
            content: (
              <>
                <CollectionCard title="Company Emails" description="Operational and communication email addresses." onAdd={() => setValues((current) => ({ ...current, emails: [...current.emails, emptyEmail()] }))}>
                  {values.emails.map((email, index) => (
                    <CollectionRow key={`email-${index}`} onRemove={() => setValues((current) => ({ ...current, emails: current.emails.filter((_, rowIndex) => rowIndex !== index) }))}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email.email} onChange={(event) => setValues((current) => ({ ...current, emails: current.emails.map((entry, rowIndex) => rowIndex === index ? { ...entry, email: event.target.value } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>Email Type</Label><Input value={email.emailType} onChange={(event) => setValues((current) => ({ ...current, emails: current.emails.map((entry, rowIndex) => rowIndex === index ? { ...entry, emailType: event.target.value } : entry) }))} /></div>
                      </div>
                    </CollectionRow>
                  ))}
                </CollectionCard>
                <CollectionCard title="Company Phones" description="Phone and messaging contacts." onAdd={() => setValues((current) => ({ ...current, phones: [...current.phones, emptyPhone()] }))}>
                  {values.phones.map((phone, index) => (
                    <CollectionRow key={`phone-${index}`} onRemove={() => setValues((current) => ({ ...current, phones: current.phones.filter((_, rowIndex) => rowIndex !== index) }))}>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="grid gap-2"><Label>Phone Number</Label><Input value={phone.phoneNumber} onChange={(event) => setValues((current) => ({ ...current, phones: current.phones.map((entry, rowIndex) => rowIndex === index ? { ...entry, phoneNumber: event.target.value } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>Phone Type</Label><Input value={phone.phoneType} onChange={(event) => setValues((current) => ({ ...current, phones: current.phones.map((entry, rowIndex) => rowIndex === index ? { ...entry, phoneType: event.target.value } : entry) }))} /></div>
                        <label className="flex items-center gap-3 pt-8"><Checkbox checked={phone.isPrimary} onCheckedChange={(checked) => setValues((current) => ({ ...current, phones: current.phones.map((entry, rowIndex) => rowIndex === index ? { ...entry, isPrimary: Boolean(checked) } : entry) }))} /><span className="text-sm font-medium">Primary</span></label>
                      </div>
                    </CollectionRow>
                  ))}
                </CollectionCard>
              </>
            ),
          },
          {
            label: 'Addressing',
            value: 'addressing',
            content: (
              <CollectionCard title="Company Addresses" description="Billing, shipping, and head-office locations." onAdd={() => setValues((current) => ({ ...current, addresses: [...current.addresses, emptyAddress()] }))}>
                {values.addresses.map((address, index) => (
                  <CollectionRow key={`address-${index}`} onRemove={() => setValues((current) => ({ ...current, addresses: current.addresses.filter((_, rowIndex) => rowIndex !== index) }))}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2"><Label>Address Type</Label><Input value={address.addressType} onChange={(event) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, addressType: event.target.value } : entry) }))} /></div>
                      <label className="flex items-center gap-3 pt-8"><Checkbox checked={address.isDefault} onCheckedChange={(checked) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, isDefault: Boolean(checked) } : entry) }))} /><span className="text-sm font-medium">Default address</span></label>
                      <div className="grid gap-2 md:col-span-2"><Label>Address Line 1</Label><Input value={address.addressLine1} onChange={(event) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, addressLine1: event.target.value } : entry) }))} /></div>
                      <div className="grid gap-2 md:col-span-2"><Label>Address Line 2</Label><Input value={address.addressLine2 ?? ''} onChange={(event) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, addressLine2: event.target.value || null } : entry) }))} /></div>
                      <LookupSelect label="Country" value={address.countryId} options={countries} onChange={(value) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, countryId: value } : entry) }))} />
                      <LookupSelect label="State" value={address.stateId} options={states} onChange={(value) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, stateId: value } : entry) }))} />
                      <LookupSelect label="City" value={address.cityId} options={cities} onChange={(value) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, cityId: value } : entry) }))} />
                      <LookupSelect label="Pincode" value={address.pincodeId} options={pincodes} onChange={(value) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, pincodeId: value } : entry) }))} />
                      <div className="grid gap-2"><Label>Latitude</Label><Input type="number" step="0.0000001" value={address.latitude ?? ''} onChange={(event) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, latitude: event.target.value ? Number(event.target.value) : null } : entry) }))} /></div>
                      <div className="grid gap-2"><Label>Longitude</Label><Input type="number" step="0.0000001" value={address.longitude ?? ''} onChange={(event) => setValues((current) => ({ ...current, addresses: current.addresses.map((entry, rowIndex) => rowIndex === index ? { ...entry, longitude: event.target.value ? Number(event.target.value) : null } : entry) }))} /></div>
                    </div>
                  </CollectionRow>
                ))}
              </CollectionCard>
            ),
          },
          {
            label: 'Banking',
            value: 'banking',
            content: (
              <CollectionCard title="Bank Accounts" description="Settlement and accounting accounts used by the company." onAdd={() => setValues((current) => ({ ...current, bankAccounts: [...current.bankAccounts, emptyBankAccount()] }))}>
                {values.bankAccounts.map((account, index) => (
                  <CollectionRow key={`bank-${index}`} onRemove={() => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.filter((_, rowIndex) => rowIndex !== index) }))}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2"><Label>Bank Name</Label><Input value={account.bankName} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, bankName: event.target.value } : entry) }))} /></div>
                      <div className="grid gap-2"><Label>Branch</Label><Input value={account.branch ?? ''} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, branch: event.target.value || null } : entry) }))} /></div>
                      <div className="grid gap-2"><Label>Account Number</Label><Input value={account.accountNumber} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, accountNumber: event.target.value } : entry) }))} /></div>
                      <div className="grid gap-2"><Label>Account Holder Name</Label><Input value={account.accountHolderName} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, accountHolderName: event.target.value } : entry) }))} /></div>
                      <div className="grid gap-2"><Label>IFSC</Label><Input value={account.ifsc} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, ifsc: event.target.value } : entry) }))} /></div>
                      <label className="flex items-center gap-3 pt-8"><Checkbox checked={account.isPrimary} onCheckedChange={(checked) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, isPrimary: Boolean(checked) } : entry) }))} /><span className="text-sm font-medium">Primary account</span></label>
                    </div>
                  </CollectionRow>
                ))}
              </CollectionCard>
            ),
          },
        ] satisfies AnimatedContentTab[]}
      />
    </form>
  )
}
