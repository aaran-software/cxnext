import { z } from 'zod'

export const contactAddressSchema = z.object({
  id: z.string().min(1),
  contactId: z.string().min(1),
  addressType: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().nullable(),
  cityId: z.string().nullable(),
  stateId: z.string().nullable(),
  countryId: z.string().nullable(),
  pincodeId: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const contactEmailSchema = z.object({
  id: z.string().min(1),
  contactId: z.string().min(1),
  email: z.email(),
  emailType: z.string().min(1),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const contactPhoneSchema = z.object({
  id: z.string().min(1),
  contactId: z.string().min(1),
  phoneNumber: z.string().min(1),
  phoneType: z.string().min(1),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const contactBankAccountSchema = z.object({
  id: z.string().min(1),
  contactId: z.string().min(1),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountHolderName: z.string().min(1),
  ifsc: z.string().min(1),
  branch: z.string().nullable(),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const contactGstDetailSchema = z.object({
  id: z.string().min(1),
  contactId: z.string().min(1),
  gstin: z.string().min(1),
  state: z.string().min(1),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const contactSummarySchema = z.object({
  id: z.string().min(1),
  uuid: z.string().min(1),
  contactTypeId: z.string().min(1),
  name: z.string().min(1),
  legalName: z.string().nullable(),
  pan: z.string().nullable(),
  gstin: z.string().nullable(),
  msmeType: z.string().nullable(),
  msmeNo: z.string().nullable(),
  openingBalance: z.number(),
  balanceType: z.string().nullable(),
  creditLimit: z.number(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  primaryEmail: z.string().nullable(),
  primaryPhone: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const contactSchema = contactSummarySchema.extend({
  addresses: z.array(contactAddressSchema),
  emails: z.array(contactEmailSchema),
  phones: z.array(contactPhoneSchema),
  bankAccounts: z.array(contactBankAccountSchema),
  gstDetails: z.array(contactGstDetailSchema),
})

export const contactAddressInputSchema = z.object({
  addressType: z.string().trim().min(1),
  addressLine1: z.string().trim().min(1),
  addressLine2: z.string().trim().nullish().transform((value) => value || null),
  cityId: z.string().trim().nullish().transform((value) => value || null),
  stateId: z.string().trim().nullish().transform((value) => value || null),
  countryId: z.string().trim().nullish().transform((value) => value || null),
  pincodeId: z.string().trim().nullish().transform((value) => value || null),
  latitude: z.number().finite().nullable().optional().default(null),
  longitude: z.number().finite().nullable().optional().default(null),
  isDefault: z.boolean().optional().default(false),
})

export const contactEmailInputSchema = z.object({
  email: z.email(),
  emailType: z.string().trim().min(1),
  isPrimary: z.boolean().optional().default(false),
})

export const contactPhoneInputSchema = z.object({
  phoneNumber: z.string().trim().min(1),
  phoneType: z.string().trim().min(1),
  isPrimary: z.boolean().optional().default(false),
})

export const contactBankAccountInputSchema = z.object({
  bankName: z.string().trim().min(1),
  accountNumber: z.string().trim().min(1),
  accountHolderName: z.string().trim().min(1),
  ifsc: z.string().trim().min(1),
  branch: z.string().trim().nullish().transform((value) => value || null),
  isPrimary: z.boolean().optional().default(false),
})

export const contactGstDetailInputSchema = z.object({
  gstin: z.string().trim().min(1),
  state: z.string().trim().min(1),
  isDefault: z.boolean().optional().default(false),
})

export const contactUpsertPayloadSchema = z.object({
  contactTypeId: z.string().trim().min(1),
  name: z.string().trim().min(2),
  legalName: z.string().trim().nullish().transform((value) => value || null),
  pan: z.string().trim().nullish().transform((value) => value || null),
  gstin: z.string().trim().nullish().transform((value) => value || null),
  msmeType: z.string().trim().nullish().transform((value) => value || null),
  msmeNo: z.string().trim().nullish().transform((value) => value || null),
  openingBalance: z.number().finite().default(0),
  balanceType: z.string().trim().nullish().transform((value) => value || null),
  creditLimit: z.number().finite().default(0),
  website: z.string().trim().nullish().transform((value) => value || null),
  description: z.string().trim().nullish().transform((value) => value || null),
  isActive: z.boolean().optional().default(true),
  addresses: z.array(contactAddressInputSchema).default([]),
  emails: z.array(contactEmailInputSchema).default([]),
  phones: z.array(contactPhoneInputSchema).default([]),
  bankAccounts: z.array(contactBankAccountInputSchema).default([]),
  gstDetails: z.array(contactGstDetailInputSchema).default([]),
})

export const contactListResponseSchema = z.object({
  items: z.array(contactSummarySchema),
})

export const contactResponseSchema = z.object({
  item: contactSchema,
})

export type ContactAddress = z.infer<typeof contactAddressSchema>
export type ContactEmail = z.infer<typeof contactEmailSchema>
export type ContactPhone = z.infer<typeof contactPhoneSchema>
export type ContactBankAccount = z.infer<typeof contactBankAccountSchema>
export type ContactGstDetail = z.infer<typeof contactGstDetailSchema>
export type ContactSummary = z.infer<typeof contactSummarySchema>
export type Contact = z.infer<typeof contactSchema>
export type ContactAddressInput = z.infer<typeof contactAddressInputSchema>
export type ContactEmailInput = z.infer<typeof contactEmailInputSchema>
export type ContactPhoneInput = z.infer<typeof contactPhoneInputSchema>
export type ContactBankAccountInput = z.infer<typeof contactBankAccountInputSchema>
export type ContactGstDetailInput = z.infer<typeof contactGstDetailInputSchema>
export type ContactUpsertPayload = z.infer<typeof contactUpsertPayloadSchema>
export type ContactListResponse = z.infer<typeof contactListResponseSchema>
export type ContactResponse = z.infer<typeof contactResponseSchema>
