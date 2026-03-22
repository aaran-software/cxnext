import { dummyProductSeeder } from './001-dummy-product'
import { storefrontDemoCatalogSeeder } from './002-storefront-demo-catalog'
import { tirupurDirectCatalogSeeder } from './003-tirupur-direct-catalog'
import type { Seeder } from './seeder'

export const seeders: Seeder[] = [
  dummyProductSeeder,
  storefrontDemoCatalogSeeder,
  tirupurDirectCatalogSeeder,
]
