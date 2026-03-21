import type {
  Contact,
  ContactAddressInput,
  ContactBankAccountInput,
  ContactEmailInput,
  ContactGstDetailInput,
  ContactPhoneInput,
  ContactUpsertPayload,
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
import { createContact, getContact, HttpError, listCommonModuleItems, updateContact } from '@/shared/api/client'

type ContactFormValues = ContactUpsertPayload

const emptyAddress = (): ContactAddressInput => ({ addressType: 'billing', addressLine1: '', addressLine2: null, cityId: null, stateId: null, countryId: null, pincodeId: null, latitude: null, longitude: null, isDefault: true })
const emptyEmail = (): ContactEmailInput => ({ email: '', emailType: 'primary', isPrimary: true })
const emptyPhone = (): ContactPhoneInput => ({ phoneNumber: '', phoneType: 'mobile', isPrimary: true })
const emptyBank = (): ContactBankAccountInput => ({ bankName: '', accountNumber: '', accountHolderName: '', ifsc: '', branch: null, isPrimary: true })
const emptyGst = (): ContactGstDetailInput => ({ gstin: '', state: '', isDefault: true })

function defaultValues(): ContactFormValues {
  return {
    contactTypeId: 'contact-type:company',
    name: '',
    legalName: null,
    pan: null,
    gstin: null,
    msmeType: null,
    msmeNo: null,
    openingBalance: 0,
    balanceType: null,
    creditLimit: 0,
    website: null,
    description: null,
    isActive: true,
    addresses: [emptyAddress()],
    emails: [emptyEmail()],
    phones: [emptyPhone()],
    bankAccounts: [emptyBank()],
    gstDetails: [emptyGst()],
  }
}

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) return error.message
  if (error instanceof Error) return error.message
  return 'Failed to save contact.'
}

function toFormValues(contact: Contact): ContactFormValues {
  return {
    contactTypeId: contact.contactTypeId,
    name: contact.name,
    legalName: contact.legalName,
    pan: contact.pan,
    gstin: contact.gstin,
    msmeType: contact.msmeType,
    msmeNo: contact.msmeNo,
    openingBalance: contact.openingBalance,
    balanceType: contact.balanceType,
    creditLimit: contact.creditLimit,
    website: contact.website,
    description: contact.description,
    isActive: contact.isActive,
    addresses: contact.addresses.length ? contact.addresses.map((entry) => ({ addressType: entry.addressType, addressLine1: entry.addressLine1, addressLine2: entry.addressLine2, cityId: entry.cityId, stateId: entry.stateId, countryId: entry.countryId, pincodeId: entry.pincodeId, latitude: entry.latitude, longitude: entry.longitude, isDefault: entry.isDefault })) : [emptyAddress()],
    emails: contact.emails.length ? contact.emails.map((entry) => ({ email: entry.email, emailType: entry.emailType, isPrimary: entry.isPrimary })) : [emptyEmail()],
    phones: contact.phones.length ? contact.phones.map((entry) => ({ phoneNumber: entry.phoneNumber, phoneType: entry.phoneType, isPrimary: entry.isPrimary })) : [emptyPhone()],
    bankAccounts: contact.bankAccounts.length ? contact.bankAccounts.map((entry) => ({ bankName: entry.bankName, accountNumber: entry.accountNumber, accountHolderName: entry.accountHolderName, ifsc: entry.ifsc, branch: entry.branch, isPrimary: entry.isPrimary })) : [emptyBank()],
    gstDetails: contact.gstDetails.length ? contact.gstDetails.map((entry) => ({ gstin: entry.gstin, state: entry.state, isDefault: entry.isDefault })) : [emptyGst()],
  }
}

function Section({ title, description, addLabel, onAdd, children }: React.PropsWithChildren<{ title:string; description:string; addLabel?:string; onAdd?:()=>void }>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></div>
        {addLabel && onAdd ? <Button type="button" variant="outline" size="sm" onClick={onAdd}><Plus className="size-4" />{addLabel}</Button> : null}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

function Row({ children, onRemove }: React.PropsWithChildren<{ onRemove:()=>void }>) {
  return <div className="rounded-[1.5rem] border border-border/70 p-4"><div className="mb-4 flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={onRemove}><Trash2 className="size-4" />Remove</Button></div>{children}</div>
}

function LookupSelect({ label, value, options, onChange }: { label:string; value:string|null; options:CommonModuleItem[]; onChange:(value:string|null)=>void }) {
  return <div className="grid gap-2"><Label>{label}</Label><select value={value ?? ''} onChange={(event) => onChange(event.target.value || null)} className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Not set</option>{options.map((option) => <option key={option.id} value={option.id}>{String(option.name ?? option.code ?? option.id)}</option>)}</select></div>
}

export function ContactFormPage() {
  const navigate = useNavigate()
  const { contactId } = useParams()
  const [values, setValues] = useState<ContactFormValues>(defaultValues())
  const [loading, setLoading] = useState(Boolean(contactId))
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [contactTypes, setContactTypes] = useState<CommonModuleItem[]>([])
  const [countries, setCountries] = useState<CommonModuleItem[]>([])
  const [states, setStates] = useState<CommonModuleItem[]>([])
  const [cities, setCities] = useState<CommonModuleItem[]>([])
  const [pincodes, setPincodes] = useState<CommonModuleItem[]>([])

  useEffect(() => {
    let cancelled = false
    async function loadLookups() {
      const [typeItems, countryItems, stateItems, cityItems, pincodeItems] = await Promise.all([
        listCommonModuleItems('contactTypes', false),
        listCommonModuleItems('countries', false),
        listCommonModuleItems('states', false),
        listCommonModuleItems('cities', false),
        listCommonModuleItems('pincodes', false),
      ])
      if (!cancelled) {
        setContactTypes(typeItems)
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
    async function load() {
      if (!contactId) return
      setLoading(true)
      setErrorMessage(null)
      try {
        const contact = await getContact(contactId)
        if (!cancelled) setValues(toFormValues(contact))
      } catch (error) {
        if (!cancelled) setErrorMessage(toErrorMessage(error))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [contactId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setErrorMessage(null)
    try {
      if (contactId) await updateContact(contactId, values)
      else await createContact(values)
      navigate('/dashboard/contacts')
    } catch (error) {
      setErrorMessage(toErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Card><CardContent className="p-8 text-sm text-muted-foreground">Loading contact...</CardContent></Card>

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2"><Link to="/dashboard/contacts"><ArrowLeft className="size-4" />Back to contacts</Link></Button>
          <h1 className="text-3xl font-semibold text-foreground">{contactId ? 'Edit Contact' : 'New Contact'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Capture contact identity, tax, addresses, communication channels, and bank details.</p>
        </div>
        <div className="flex items-center gap-3"><Button type="button" variant="outline" onClick={() => navigate('/dashboard/contacts')}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Contact'}</Button></div>
      </div>
      {errorMessage ? <Card><CardContent className="p-4 text-sm text-destructive">{errorMessage}</CardContent></Card> : null}

      <AnimatedTabs
        defaultTabValue="contact"
        tabs={[
          {
            label: 'Contact',
            value: 'contact',
            content: (
              <Section title="Contact Basics" description="Contact classification, financial defaults, and tax identifiers.">
                <div className="grid gap-4 md:grid-cols-2">
                  <LookupSelect label="Contact Type" value={values.contactTypeId} options={contactTypes} onChange={(value) => setValues((current) => ({ ...current, contactTypeId: value ?? current.contactTypeId }))} />
                  <div className="grid gap-2"><Label>Name</Label><Input value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} required /></div>
                  <div className="grid gap-2"><Label>Legal Name</Label><Input value={values.legalName ?? ''} onChange={(event) => setValues((current) => ({ ...current, legalName: event.target.value || null }))} /></div>
                  <div className="grid gap-2"><Label>PAN</Label><Input value={values.pan ?? ''} onChange={(event) => setValues((current) => ({ ...current, pan: event.target.value || null }))} /></div>
                  <div className="grid gap-2"><Label>GSTIN</Label><Input value={values.gstin ?? ''} onChange={(event) => setValues((current) => ({ ...current, gstin: event.target.value || null }))} /></div>
                  <div className="grid gap-2"><Label>MSME Type</Label><Input value={values.msmeType ?? ''} onChange={(event) => setValues((current) => ({ ...current, msmeType: event.target.value || null }))} /></div>
                  <div className="grid gap-2"><Label>MSME Number</Label><Input value={values.msmeNo ?? ''} onChange={(event) => setValues((current) => ({ ...current, msmeNo: event.target.value || null }))} /></div>
                  <div className="grid gap-2"><Label>Opening Balance</Label><Input type="number" step="0.01" value={values.openingBalance} onChange={(event) => setValues((current) => ({ ...current, openingBalance: Number(event.target.value || 0) }))} /></div>
                  <div className="grid gap-2"><Label>Balance Type</Label><Input value={values.balanceType ?? ''} onChange={(event) => setValues((current) => ({ ...current, balanceType: event.target.value || null }))} /></div>
                  <div className="grid gap-2"><Label>Credit Limit</Label><Input type="number" step="0.01" value={values.creditLimit} onChange={(event) => setValues((current) => ({ ...current, creditLimit: Number(event.target.value || 0) }))} /></div>
                  <div className="grid gap-2"><Label>Website</Label><Input value={values.website ?? ''} onChange={(event) => setValues((current) => ({ ...current, website: event.target.value || null }))} /></div>
                  <div className="grid gap-2 md:col-span-2"><Label>Description</Label><Textarea value={values.description ?? ''} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value || null }))} rows={4} /></div>
                  <label className="flex items-center gap-3 md:col-span-2"><Checkbox checked={values.isActive} onCheckedChange={(checked) => setValues((current) => ({ ...current, isActive: Boolean(checked) }))} /><span className="text-sm font-medium">Active contact</span></label>
                </div>
              </Section>
            ),
          },
          {
            label: 'Communication',
            value: 'communication',
            content: (
              <>
                <Section title="Emails" description="Primary and supporting email channels." addLabel="Add Email" onAdd={() => setValues((current) => ({ ...current, emails: [...current.emails, emptyEmail()] }))}>
                  {values.emails.map((email, index) => (
                    <Row key={`email-${index}`} onRemove={() => setValues((current) => ({ ...current, emails: current.emails.filter((_, rowIndex) => rowIndex !== index) }))}>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email.email} onChange={(event) => setValues((current) => ({ ...current, emails: current.emails.map((entry, rowIndex) => rowIndex === index ? { ...entry, email: event.target.value } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>Email Type</Label><Input value={email.emailType} onChange={(event) => setValues((current) => ({ ...current, emails: current.emails.map((entry, rowIndex) => rowIndex === index ? { ...entry, emailType: event.target.value } : entry) }))} /></div>
                        <label className="flex items-center gap-3 pt-8"><Checkbox checked={email.isPrimary} onCheckedChange={(checked) => setValues((current) => ({ ...current, emails: current.emails.map((entry, rowIndex) => rowIndex === index ? { ...entry, isPrimary: Boolean(checked) } : entry) }))} /><span className="text-sm font-medium">Primary</span></label>
                      </div>
                    </Row>
                  ))}
                </Section>
                <Section title="Phones" description="Phone and messaging channels." addLabel="Add Phone" onAdd={() => setValues((current) => ({ ...current, phones: [...current.phones, emptyPhone()] }))}>
                  {values.phones.map((phone, index) => (
                    <Row key={`phone-${index}`} onRemove={() => setValues((current) => ({ ...current, phones: current.phones.filter((_, rowIndex) => rowIndex !== index) }))}>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="grid gap-2"><Label>Phone Number</Label><Input value={phone.phoneNumber} onChange={(event) => setValues((current) => ({ ...current, phones: current.phones.map((entry, rowIndex) => rowIndex === index ? { ...entry, phoneNumber: event.target.value } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>Phone Type</Label><Input value={phone.phoneType} onChange={(event) => setValues((current) => ({ ...current, phones: current.phones.map((entry, rowIndex) => rowIndex === index ? { ...entry, phoneType: event.target.value } : entry) }))} /></div>
                        <label className="flex items-center gap-3 pt-8"><Checkbox checked={phone.isPrimary} onCheckedChange={(checked) => setValues((current) => ({ ...current, phones: current.phones.map((entry, rowIndex) => rowIndex === index ? { ...entry, isPrimary: Boolean(checked) } : entry) }))} /><span className="text-sm font-medium">Primary</span></label>
                      </div>
                    </Row>
                  ))}
                </Section>
              </>
            ),
          },
          {
            label: 'Addressing',
            value: 'addressing',
            content: (
              <Section title="Addresses" description="Billing, shipping, office, and branch locations." addLabel="Add Address" onAdd={() => setValues((current) => ({ ...current, addresses: [...current.addresses, emptyAddress()] }))}>
                {values.addresses.map((address, index) => (
                  <Row key={`address-${index}`} onRemove={() => setValues((current) => ({ ...current, addresses: current.addresses.filter((_, rowIndex) => rowIndex !== index) }))}>
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
                  </Row>
                ))}
              </Section>
            ),
          },
          {
            label: 'Finance',
            value: 'finance',
            content: (
              <>
                <Section title="Bank Accounts" description="Settlement accounts and payment banking details." addLabel="Add Bank Account" onAdd={() => setValues((current) => ({ ...current, bankAccounts: [...current.bankAccounts, emptyBank()] }))}>
                  {values.bankAccounts.map((account, index) => (
                    <Row key={`bank-${index}`} onRemove={() => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.filter((_, rowIndex) => rowIndex !== index) }))}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2"><Label>Bank Name</Label><Input value={account.bankName} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, bankName: event.target.value } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>Branch</Label><Input value={account.branch ?? ''} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, branch: event.target.value || null } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>Account Number</Label><Input value={account.accountNumber} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, accountNumber: event.target.value } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>Account Holder Name</Label><Input value={account.accountHolderName} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, accountHolderName: event.target.value } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>IFSC</Label><Input value={account.ifsc} onChange={(event) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, ifsc: event.target.value } : entry) }))} /></div>
                        <label className="flex items-center gap-3 pt-8"><Checkbox checked={account.isPrimary} onCheckedChange={(checked) => setValues((current) => ({ ...current, bankAccounts: current.bankAccounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, isPrimary: Boolean(checked) } : entry) }))} /><span className="text-sm font-medium">Primary account</span></label>
                      </div>
                    </Row>
                  ))}
                </Section>
                <Section title="GST Details" description="GST registrations for the contact." addLabel="Add GST Detail" onAdd={() => setValues((current) => ({ ...current, gstDetails: [...current.gstDetails, emptyGst()] }))}>
                  {values.gstDetails.map((detail, index) => (
                    <Row key={`gst-${index}`} onRemove={() => setValues((current) => ({ ...current, gstDetails: current.gstDetails.filter((_, rowIndex) => rowIndex !== index) }))}>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="grid gap-2"><Label>GSTIN</Label><Input value={detail.gstin} onChange={(event) => setValues((current) => ({ ...current, gstDetails: current.gstDetails.map((entry, rowIndex) => rowIndex === index ? { ...entry, gstin: event.target.value } : entry) }))} /></div>
                        <div className="grid gap-2"><Label>State</Label><Input value={detail.state} onChange={(event) => setValues((current) => ({ ...current, gstDetails: current.gstDetails.map((entry, rowIndex) => rowIndex === index ? { ...entry, state: event.target.value } : entry) }))} /></div>
                        <label className="flex items-center gap-3 pt-8"><Checkbox checked={detail.isDefault} onCheckedChange={(checked) => setValues((current) => ({ ...current, gstDetails: current.gstDetails.map((entry, rowIndex) => rowIndex === index ? { ...entry, isDefault: Boolean(checked) } : entry) }))} /><span className="text-sm font-medium">Default</span></label>
                      </div>
                    </Row>
                  ))}
                </Section>
              </>
            ),
          },
        ] satisfies AnimatedContentTab[]}
      />
    </form>
  )
}
