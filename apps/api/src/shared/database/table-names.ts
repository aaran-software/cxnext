export const migrationTableName = 'system_migrations'

export const authTableNames = {
  users: 'auth_users',
  roles: 'auth_roles',
  permissions: 'auth_permissions',
  userRoles: 'auth_user_roles',
  rolePermissions: 'auth_role_permissions',
} as const

export const commonTableNames = {
  countries: 'common_countries',
  states: 'common_states',
  districts: 'common_districts',
  cities: 'common_cities',
  pincodes: 'common_pincodes',
  contactGroups: 'common_contact_groups',
  contactTypes: 'common_contact_types',
  productGroups: 'common_product_groups',
  productCategories: 'common_product_categories',
  productTypes: 'common_product_types',
  units: 'common_units',
  hsnCodes: 'common_hsn_codes',
  taxes: 'common_taxes',
  brands: 'common_brands',
  colours: 'common_colours',
  sizes: 'common_sizes',
  currencies: 'common_currencies',
  orderTypes: 'common_order_types',
  styles: 'common_styles',
  transports: 'common_transports',
  warehouses: 'common_warehouses',
  destinations: 'common_destinations',
  paymentTerms: 'common_payment_terms',
} as const
