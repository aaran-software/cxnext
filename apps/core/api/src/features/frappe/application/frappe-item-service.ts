import {
  frappeItemManagerResponseSchema,
  frappeItemResponseSchema,
  frappeItemSchema,
  frappeItemUpsertPayloadSchema,
  frappeReferenceOptionSchema,
  type AuthUser,
} from '@shared/index'
import { ApplicationError } from '@framework-core/runtime/errors/application-error'
import { environment } from '@framework-core/runtime/config/environment'
import { assertFrappeViewer, assertSuperAdmin, requestFrappeJson } from './frappe-client'

function toStringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function toBooleanValue(value: unknown) {
  return value === true || value === 1 || value === '1'
}

function extractRows(payload: Record<string, unknown> | null) {
  return Array.isArray(payload?.data)
    ? payload.data as Record<string, unknown>[]
    : []
}

async function listFrappeDoctype(
  doctype: string,
  fields: string[],
  options?: {
    limitPageLength?: number
    orderBy?: string
  },
) {
  const query = new URLSearchParams({
    fields: JSON.stringify(fields),
    limit_page_length: String(options?.limitPageLength ?? 200),
  })

  if (options?.orderBy) {
    query.set('order_by', options.orderBy)
  }

  return extractRows(await requestFrappeJson(`/api/resource/${encodeURIComponent(doctype)}?${query.toString()}`))
}

function toReferenceOption(record: Record<string, unknown>, options?: { description?: string }) {
  return frappeReferenceOptionSchema.parse({
    id: toStringValue(record.name),
    label: toStringValue(record.name),
    description: options?.description ?? '',
    disabled: toBooleanValue(record.disabled) || !toBooleanValue(record.enabled ?? true),
    isGroup: toBooleanValue(record.is_group),
  })
}

function readItemDefault(record: Record<string, unknown>, field: 'company' | 'default_warehouse') {
  const itemDefaults = Array.isArray(record.item_defaults)
    ? record.item_defaults as Record<string, unknown>[]
    : []

  return toStringValue(itemDefaults[0]?.[field])
}

function toFrappeItem(record: Record<string, unknown>) {
  return frappeItemSchema.parse({
    id: toStringValue(record.name),
    itemCode: toStringValue(record.item_code || record.name),
    itemName: toStringValue(record.item_name),
    description: toStringValue(record.description),
    itemGroup: toStringValue(record.item_group),
    stockUom: toStringValue(record.stock_uom),
    brand: toStringValue(record.brand),
    gstHsnCode: toStringValue(record.gst_hsn_code),
    defaultCompany: readItemDefault(record, 'company'),
    defaultWarehouse: readItemDefault(record, 'default_warehouse'),
    disabled: toBooleanValue(record.disabled),
    isStockItem: toBooleanValue(record.is_stock_item),
    hasVariants: toBooleanValue(record.has_variants),
    modifiedAt: toStringValue(record.modified),
  })
}

async function readFrappeItemById(itemId: string) {
  const payload = await requestFrappeJson(`/api/resource/Item/${encodeURIComponent(itemId)}`)
  const record = payload && typeof payload.data === 'object' && payload.data
    ? payload.data as Record<string, unknown>
    : null

  if (!record) {
    throw new ApplicationError('Frappe Item could not be loaded.', { itemId }, 502)
  }

  return toFrappeItem(record)
}

function buildItemDefaults(defaultWarehouse: string) {
  const company = environment.frappe.defaultCompany.trim()
  const warehouse = defaultWarehouse.trim()

  if (!company || !warehouse) {
    return undefined
  }

  return [
    {
      company,
      default_warehouse: warehouse,
    },
  ]
}

function toItemRequestBody(payload: {
  itemCode: string
  itemName: string
  description: string
  itemGroup: string
  stockUom: string
  brand: string
  gstHsnCode: string
  defaultWarehouse: string
  disabled: boolean
  isStockItem: boolean
}) {
  const itemDefaults = buildItemDefaults(payload.defaultWarehouse)

  return JSON.stringify({
    item_code: payload.itemCode,
    item_name: payload.itemName,
    custom_print_name: payload.itemName,
    description: payload.description || null,
    item_group: payload.itemGroup,
    stock_uom: payload.stockUom,
    brand: payload.brand || null,
    gst_hsn_code: payload.gstHsnCode,
    disabled: payload.disabled ? 1 : 0,
    is_stock_item: payload.isStockItem ? 1 : 0,
    is_sales_item: 1,
    is_purchase_item: 1,
    uoms: [
      {
        uom: payload.stockUom,
        conversion_factor: 1,
      },
    ],
    item_defaults: itemDefaults,
  })
}

async function readFrappeItemReferences() {
  const [itemGroups, stockUoms, warehouses, brands, gstHsnCodes] = await Promise.all([
    listFrappeDoctype('Item Group', ['name', 'is_group'], {
      limitPageLength: 1000,
      orderBy: 'name asc',
    }),
    listFrappeDoctype('UOM', ['name', 'enabled'], {
      limitPageLength: 1000,
      orderBy: 'name asc',
    }),
    listFrappeDoctype('Warehouse', ['name', 'company', 'is_group', 'disabled'], {
      limitPageLength: 1000,
      orderBy: 'name asc',
    }),
    listFrappeDoctype('Brand', ['name'], {
      limitPageLength: 1000,
      orderBy: 'name asc',
    }),
    listFrappeDoctype('GST HSN Code', ['name', 'description'], {
      limitPageLength: 500,
      orderBy: 'name asc',
    }),
  ])

  return {
    itemGroups: itemGroups.map((record) =>
      toReferenceOption(record, {
        description: toBooleanValue(record.is_group) ? 'Group node' : '',
      })),
    stockUoms: stockUoms.map((record) => toReferenceOption(record)),
    warehouses: warehouses.map((record) =>
      toReferenceOption(record, {
        description: toStringValue(record.company),
      })),
    brands: brands.map((record) => toReferenceOption(record)),
    gstHsnCodes: gstHsnCodes.map((record) =>
      toReferenceOption(record, {
        description: toStringValue(record.description),
      })),
    defaults: {
      company: environment.frappe.defaultCompany.trim(),
      warehouse: environment.frappe.defaultWarehouse.trim(),
      itemGroup: environment.frappe.defaultItemGroup.trim(),
      priceList: environment.frappe.defaultPriceList.trim(),
    },
  }
}

export async function listFrappeItems(user: AuthUser) {
  assertFrappeViewer(user)

  const [items, references] = await Promise.all([
    listFrappeDoctype(
      'Item',
      ['name', 'item_code', 'item_name', 'description', 'item_group', 'stock_uom', 'brand', 'gst_hsn_code', 'disabled', 'is_stock_item', 'has_variants', 'modified'],
      {
        limitPageLength: 1000,
        orderBy: 'modified desc',
      },
    ),
    readFrappeItemReferences(),
  ])

  return frappeItemManagerResponseSchema.parse({
    manager: {
      items: items.map((record) => toFrappeItem(record)),
      references,
      syncedAt: new Date().toISOString(),
    },
  })
}

export async function getFrappeItem(user: AuthUser, itemId: string) {
  assertSuperAdmin(user)

  return frappeItemResponseSchema.parse({
    item: await readFrappeItemById(itemId),
  })
}

export async function createFrappeItem(user: AuthUser, payload: unknown) {
  assertSuperAdmin(user)

  const parsedPayload = frappeItemUpsertPayloadSchema.parse(payload)
  const createdPayload = await requestFrappeJson('/api/resource/Item', {
    method: 'POST',
    body: toItemRequestBody(parsedPayload),
  })
  const createdRecord = createdPayload && typeof createdPayload.data === 'object' && createdPayload.data
    ? createdPayload.data as Record<string, unknown>
    : null
  const itemId = toStringValue(createdRecord?.name)

  if (!itemId) {
    throw new ApplicationError('Frappe Item create response did not include a document id.', {}, 502)
  }

  return frappeItemResponseSchema.parse({
    item: await readFrappeItemById(itemId),
  })
}

export async function updateFrappeItem(user: AuthUser, itemId: string, payload: unknown) {
  assertSuperAdmin(user)

  const parsedPayload = frappeItemUpsertPayloadSchema.parse(payload)
  await requestFrappeJson(`/api/resource/Item/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    body: toItemRequestBody(parsedPayload),
  })

  return frappeItemResponseSchema.parse({
    item: await readFrappeItemById(itemId),
  })
}
