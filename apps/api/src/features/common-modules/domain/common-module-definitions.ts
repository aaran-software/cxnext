import type {
  CommonModuleKey,
  CommonModuleMetadata,
  CommonModuleMetadataColumn,
} from '@shared/index'
import { commonTableNames } from '../../../shared/database/table-names'

type CommonModuleColumnDefinition = CommonModuleMetadataColumn & {
  numberMode?: 'integer' | 'decimal'
}

export interface CommonModuleDefinition {
  key: CommonModuleKey
  label: string
  tableName: string
  idPrefix: string
  defaultSortKey: string
  columns: readonly CommonModuleColumnDefinition[]
}

const commonModuleDefinitions = [
  {
    key: 'countries',
    label: 'Countries',
    tableName: commonTableNames.countries,
    idPrefix: 'country',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'phone_code', label: 'Phone Code', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'states',
    label: 'States',
    tableName: commonTableNames.states,
    idPrefix: 'state',
    defaultSortKey: 'name',
    columns: [
      {
        key: 'country_id',
        label: 'Country',
        type: 'string',
        required: true,
        nullable: false,
        referenceModule: 'countries',
      },
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
    ],
  },
  {
    key: 'districts',
    label: 'Districts',
    tableName: commonTableNames.districts,
    idPrefix: 'district',
    defaultSortKey: 'name',
    columns: [
      {
        key: 'state_id',
        label: 'State',
        type: 'string',
        required: true,
        nullable: false,
        referenceModule: 'states',
      },
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
    ],
  },
  {
    key: 'cities',
    label: 'Cities',
    tableName: commonTableNames.cities,
    idPrefix: 'city',
    defaultSortKey: 'name',
    columns: [
      {
        key: 'state_id',
        label: 'State',
        type: 'string',
        required: true,
        nullable: false,
        referenceModule: 'states',
      },
      {
        key: 'district_id',
        label: 'District',
        type: 'string',
        required: true,
        nullable: false,
        referenceModule: 'districts',
      },
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
    ],
  },
  {
    key: 'pincodes',
    label: 'Pincodes',
    tableName: commonTableNames.pincodes,
    idPrefix: 'pincode',
    defaultSortKey: 'code',
    columns: [
      {
        key: 'country_id',
        label: 'Country',
        type: 'string',
        required: true,
        nullable: false,
        referenceModule: 'countries',
      },
      {
        key: 'state_id',
        label: 'State',
        type: 'string',
        required: true,
        nullable: false,
        referenceModule: 'states',
      },
      {
        key: 'district_id',
        label: 'District',
        type: 'string',
        required: true,
        nullable: false,
        referenceModule: 'districts',
      },
      {
        key: 'city_id',
        label: 'City',
        type: 'string',
        required: true,
        nullable: false,
        referenceModule: 'cities',
      },
      { key: 'code', label: 'Pincode', type: 'string', required: true, nullable: false },
      { key: 'area_name', label: 'Area Name', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'contactGroups',
    label: 'Contact Groups',
    tableName: commonTableNames.contactGroups,
    idPrefix: 'contact-group',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'contactTypes',
    label: 'Contact Types',
    tableName: commonTableNames.contactTypes,
    idPrefix: 'contact-type',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'productGroups',
    label: 'Product Groups',
    tableName: commonTableNames.productGroups,
    idPrefix: 'product-group',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'productCategories',
    label: 'Product Categories',
    tableName: commonTableNames.productCategories,
    idPrefix: 'product-category',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'productTypes',
    label: 'Product Types',
    tableName: commonTableNames.productTypes,
    idPrefix: 'product-type',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'units',
    label: 'Units',
    tableName: commonTableNames.units,
    idPrefix: 'unit',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'symbol', label: 'Symbol', type: 'string', required: false, nullable: true },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'hsnCodes',
    label: 'HSN Codes',
    tableName: commonTableNames.hsnCodes,
    idPrefix: 'hsn',
    defaultSortKey: 'code',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: true, nullable: false },
    ],
  },
  {
    key: 'taxes',
    label: 'Taxes',
    tableName: commonTableNames.taxes,
    idPrefix: 'tax',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'tax_type', label: 'Tax Type', type: 'string', required: true, nullable: false },
      {
        key: 'rate_percent',
        label: 'Rate Percent',
        type: 'number',
        numberMode: 'decimal',
        required: true,
        nullable: false,
      },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'brands',
    label: 'Brands',
    tableName: commonTableNames.brands,
    idPrefix: 'brand',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'colours',
    label: 'Colours',
    tableName: commonTableNames.colours,
    idPrefix: 'colour',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'hex_code', label: 'Hex Code', type: 'string', required: false, nullable: true },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'sizes',
    label: 'Sizes',
    tableName: commonTableNames.sizes,
    idPrefix: 'size',
    defaultSortKey: 'sort_order',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      {
        key: 'sort_order',
        label: 'Sort Order',
        type: 'number',
        numberMode: 'integer',
        required: false,
        nullable: false,
      },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'currencies',
    label: 'Currencies',
    tableName: commonTableNames.currencies,
    idPrefix: 'currency',
    defaultSortKey: 'code',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'symbol', label: 'Symbol', type: 'string', required: true, nullable: false },
      {
        key: 'decimal_places',
        label: 'Decimal Places',
        type: 'number',
        numberMode: 'integer',
        required: false,
        nullable: false,
      },
    ],
  },
  {
    key: 'orderTypes',
    label: 'Order Types',
    tableName: commonTableNames.orderTypes,
    idPrefix: 'order-type',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'styles',
    label: 'Styles',
    tableName: commonTableNames.styles,
    idPrefix: 'style',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'transports',
    label: 'Transports',
    tableName: commonTableNames.transports,
    idPrefix: 'transport',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'warehouses',
    label: 'Warehouses',
    tableName: commonTableNames.warehouses,
    idPrefix: 'warehouse',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      {
        key: 'country_id',
        label: 'Country',
        type: 'string',
        required: false,
        nullable: true,
        referenceModule: 'countries',
      },
      {
        key: 'state_id',
        label: 'State',
        type: 'string',
        required: false,
        nullable: true,
        referenceModule: 'states',
      },
      {
        key: 'district_id',
        label: 'District',
        type: 'string',
        required: false,
        nullable: true,
        referenceModule: 'districts',
      },
      {
        key: 'city_id',
        label: 'City',
        type: 'string',
        required: false,
        nullable: true,
        referenceModule: 'cities',
      },
      {
        key: 'pincode_id',
        label: 'Pincode',
        type: 'string',
        required: false,
        nullable: true,
        referenceModule: 'pincodes',
      },
      { key: 'address_line1', label: 'Address Line 1', type: 'string', required: false, nullable: true },
      { key: 'address_line2', label: 'Address Line 2', type: 'string', required: false, nullable: true },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'destinations',
    label: 'Destinations',
    tableName: commonTableNames.destinations,
    idPrefix: 'destination',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
  {
    key: 'paymentTerms',
    label: 'Payment Terms',
    tableName: commonTableNames.paymentTerms,
    idPrefix: 'payment-term',
    defaultSortKey: 'name',
    columns: [
      { key: 'code', label: 'Code', type: 'string', required: true, nullable: false },
      { key: 'name', label: 'Name', type: 'string', required: true, nullable: false },
      {
        key: 'due_days',
        label: 'Due Days',
        type: 'number',
        numberMode: 'integer',
        required: false,
        nullable: false,
      },
      { key: 'description', label: 'Description', type: 'string', required: false, nullable: true },
    ],
  },
] as const satisfies readonly CommonModuleDefinition[]

const commonModuleDefinitionByKey = Object.fromEntries(
  commonModuleDefinitions.map((definition) => [definition.key, definition]),
) as unknown as Record<CommonModuleKey, CommonModuleDefinition>

export function listCommonModuleDefinitions() {
  return [...commonModuleDefinitions]
}

export function getCommonModuleDefinition(key: CommonModuleKey) {
  return commonModuleDefinitionByKey[key]
}

export function toCommonModuleMetadata(definition: CommonModuleDefinition): CommonModuleMetadata {
  return {
    key: definition.key,
    label: definition.label,
    defaultSortKey: definition.defaultSortKey,
    columns: [...definition.columns],
  }
}
