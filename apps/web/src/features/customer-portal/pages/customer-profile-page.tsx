import { useMemo, useState } from "react"
import type { CommonModuleItem } from "@shared/index"
import { MapPinIcon, PlusIcon, SaveIcon, Trash2Icon, UserCircle2Icon } from "lucide-react"

import { AutocompleteLookup } from "@/components/lookups/AutocompleteLookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/components/auth-provider"
import {
  createEmptyAddress,
  emptyCustomerProfile,
  readCustomerProfile,
  type CustomerAddress,
  type CustomerProfile,
  writeCustomerProfile,
} from "@/features/customer-portal/lib/customer-profile-storage"
import { listCommonModuleItems } from "@/shared/api/client"
import { createCommonLookupOption, toLookupOption } from "@/shared/forms/common-lookup"
import { showSuccessToast } from "@/shared/notifications/toast"

function splitDisplayName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  }
}

function buildInitialProfile(sessionUser: { displayName?: string; email?: string; phoneNumber?: string | null } | null | undefined) {
  const storedProfile = readCustomerProfile()
  const fallbackName = splitDisplayName(sessionUser?.displayName ?? "")

  return {
    email: storedProfile.email || sessionUser?.email || "",
    addresses: storedProfile.addresses.map((address, index) => ({
      ...address,
      firstName: address.firstName || fallbackName.firstName,
      lastName: address.lastName || fallbackName.lastName,
      phone: address.phone || sessionUser?.phoneNumber || "",
      label: address.label || `Address ${index + 1}`,
    })),
  } satisfies CustomerProfile
}

function resolveLookupLabel(items: CommonModuleItem[], value: string) {
  const match = items.find((item) => String(item.id) === value)
  return match ? toLookupOption(match).label : value
}

function ProfileLookupField({
  label,
  value,
  options,
  placeholder,
  moduleKey,
  onChange,
  onItemsChange,
}: {
  label: string
  value: string
  options: CommonModuleItem[]
  placeholder: string
  moduleKey: "countries" | "states" | "cities" | "pincodes"
  onChange: (value: string) => void
  onItemsChange: (items: CommonModuleItem[]) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <AutocompleteLookup
        value={value}
        onChange={onChange}
        options={options.map(toLookupOption)}
        allowEmptyOption
        emptyOptionLabel="-"
        placeholder={placeholder}
        createOption={async (labelValue) => {
          const { item, option } = await createCommonLookupOption(moduleKey, labelValue)
          onItemsChange([...options, item])
          return option
        }}
      />
    </div>
  )
}

export function CustomerProfilePage() {
  const { session } = useAuth()
  const initialProfile = useMemo(
    () => buildInitialProfile(session?.user),
    [session?.user],
  )
  const [profile, setProfile] = useState<CustomerProfile>(initialProfile)
  const [activeAddressId, setActiveAddressId] = useState<string>(initialProfile.addresses[0]?.id ?? createEmptyAddress().id)
  const [countries, setCountries] = useState<CommonModuleItem[]>([])
  const [states, setStates] = useState<CommonModuleItem[]>([])
  const [cities, setCities] = useState<CommonModuleItem[]>([])
  const [pincodes, setPincodes] = useState<CommonModuleItem[]>([])

  useState(() => {
    void Promise.all([
      listCommonModuleItems("countries", false),
      listCommonModuleItems("states", false),
      listCommonModuleItems("cities", false),
      listCommonModuleItems("pincodes", false),
    ]).then(([countryItems, stateItems, cityItems, pincodeItems]) => {
      setCountries(countryItems)
      setStates(stateItems)
      setCities(cityItems)
      setPincodes(pincodeItems)
    }).catch(() => {})

    return null
  })

  const activeAddress = profile.addresses.find((address) => address.id === activeAddressId) ?? profile.addresses[0]

  function updateAddress(addressId: string, updater: (address: CustomerAddress) => CustomerAddress) {
    setProfile((current) => ({
      ...current,
      addresses: current.addresses.map((address) => (address.id === addressId ? updater(address) : address)),
    }))
  }

  function handleAddAddress() {
    const nameParts = splitDisplayName(session?.user.displayName ?? "")
    const address = {
      ...createEmptyAddress(),
      label: `Address ${profile.addresses.length + 1}`,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      phone: session?.user.phoneNumber ?? "",
      isDefault: false,
    }

    setProfile((current) => ({
      ...current,
      addresses: [...current.addresses, address],
    }))
    setActiveAddressId(address.id)
  }

  function handleRemoveAddress(addressId: string) {
    setProfile((current) => {
      const remaining = current.addresses.filter((address) => address.id !== addressId)
      if (remaining.length === 0) {
        return {
          ...current,
          addresses: [createEmptyAddress()],
        }
      }

      if (!remaining.some((address) => address.isDefault)) {
        remaining[0] = {
          ...remaining[0],
          isDefault: true,
        }
      }

      return {
        ...current,
        addresses: remaining,
      }
    })

    if (activeAddressId === addressId) {
      const nextAddress = profile.addresses.find((address) => address.id !== addressId)
      setActiveAddressId(nextAddress?.id ?? createEmptyAddress().id)
    }
  }

  function handleSetDefault(addressId: string) {
    setProfile((current) => ({
      ...current,
      addresses: current.addresses.map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      })),
    }))
  }

  function handleSave() {
    writeCustomerProfile(profile)
    showSuccessToast({
      title: "Profile saved",
      description: "Saved addresses are ready for checkout.",
    })
  }

  if (!activeAddress) {
    return null
  }

  return (
    <div className="space-y-4 pb-36">
      <Card className="mesh-panel overflow-hidden">
        <CardHeader className="gap-4 border-b border-border/60 p-8">
          <Badge className="w-fit">Customer profile</Badge>
          <CardTitle className="text-4xl tracking-tight sm:text-5xl">
            Delivery details made simple.
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7">
            Save multiple delivery addresses, choose a default, and switch them during checkout like a proper shopping account.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Saved addresses</CardTitle>
                <CardDescription>
                  Choose the default delivery address and keep separate address books.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddAddress}>
                <PlusIcon className="size-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {profile.addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                className={`rounded-[1.3rem] border p-4 text-left transition ${address.id === activeAddress.id ? "border-primary bg-accent/30" : "border-border/70 bg-card/70 hover:bg-accent/20"}`}
                onClick={() => setActiveAddressId(address.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{address.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {address.firstName} {address.lastName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {address.city || "City"}, {address.state || "State"}
                    </p>
                  </div>
                  {address.isDefault ? <Badge>Default</Badge> : null}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCircle2Icon className="size-4 text-muted-foreground" />
                <CardTitle>Account contact</CardTitle>
              </div>
              <CardDescription>
                Email is shared across addresses. Name and phone can vary by delivery address.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-profile-email">Email</Label>
                <Input id="customer-profile-email" type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-address-label">Address label</Label>
                <Input id="customer-address-label" value={activeAddress.label} onChange={(event) => updateAddress(activeAddress.id, (address) => ({ ...address, label: event.target.value }))} />
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="default-address"
                    checked={activeAddress.isDefault}
                    onChange={() => handleSetDefault(activeAddress.id)}
                  />
                  Set as default delivery address
                </label>
                {profile.addresses.length > 1 ? (
                  <Button variant="outline" size="sm" onClick={() => handleRemoveAddress(activeAddress.id)}>
                    <Trash2Icon className="size-4" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPinIcon className="size-4 text-muted-foreground" />
                <CardTitle>Delivery address</CardTitle>
              </div>
              <CardDescription>
                Keep each address complete for smoother order confirmation and delivery.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer-profile-first-name">First name</Label>
                  <Input id="customer-profile-first-name" value={activeAddress.firstName} onChange={(event) => updateAddress(activeAddress.id, (address) => ({ ...address, firstName: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-profile-last-name">Last name</Label>
                  <Input id="customer-profile-last-name" value={activeAddress.lastName} onChange={(event) => updateAddress(activeAddress.id, (address) => ({ ...address, lastName: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="customer-profile-phone">Phone</Label>
                  <Input id="customer-profile-phone" value={activeAddress.phone} onChange={(event) => updateAddress(activeAddress.id, (address) => ({ ...address, phone: event.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-profile-address-line-1">Address line 1</Label>
                <Textarea id="customer-profile-address-line-1" value={activeAddress.addressLine1} rows={3} onChange={(event) => updateAddress(activeAddress.id, (address) => ({ ...address, addressLine1: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-profile-address-line-2">Address line 2</Label>
                <Input id="customer-profile-address-line-2" value={activeAddress.addressLine2} onChange={(event) => updateAddress(activeAddress.id, (address) => ({ ...address, addressLine2: event.target.value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ProfileLookupField
                  label="Country"
                  value={activeAddress.countryId}
                  options={countries}
                  placeholder="Search country"
                  moduleKey="countries"
                  onItemsChange={setCountries}
                  onChange={(value) => updateAddress(activeAddress.id, (address) => ({ ...address, countryId: value, country: value ? resolveLookupLabel(countries, value) : "" }))}
                />
                <ProfileLookupField
                  label="State"
                  value={activeAddress.stateId}
                  options={states}
                  placeholder="Search state"
                  moduleKey="states"
                  onItemsChange={setStates}
                  onChange={(value) => updateAddress(activeAddress.id, (address) => ({ ...address, stateId: value, state: value ? resolveLookupLabel(states, value) : "" }))}
                />
                <ProfileLookupField
                  label="City"
                  value={activeAddress.cityId}
                  options={cities}
                  placeholder="Search city"
                  moduleKey="cities"
                  onItemsChange={setCities}
                  onChange={(value) => updateAddress(activeAddress.id, (address) => ({ ...address, cityId: value, city: value ? resolveLookupLabel(cities, value) : "" }))}
                />
                <ProfileLookupField
                  label="Postal code"
                  value={activeAddress.postalCodeId}
                  options={pincodes}
                  placeholder="Search postal code"
                  moduleKey="pincodes"
                  onItemsChange={setPincodes}
                  onChange={(value) => updateAddress(activeAddress.id, (address) => ({ ...address, postalCodeId: value, postalCode: value ? resolveLookupLabel(pincodes, value) : "" }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Save profile</CardTitle>
          <CardDescription>
            The selected default address will be preselected in checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleSave}>
            <SaveIcon className="size-4" />
            Save profile
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const resetProfile = buildInitialProfile(session?.user)
              setProfile(resetProfile)
              setActiveAddressId(resetProfile.addresses[0]?.id ?? createEmptyAddress().id)
              writeCustomerProfile(resetProfile)
            }}
          >
            Reset
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
