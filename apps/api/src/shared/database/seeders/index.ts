import { dummyProductSeeder } from './001-dummy-product'
import { storefrontDemoCatalogSeeder } from './002-storefront-demo-catalog'
import type { Seeder } from './seeder'

export const seeders: Seeder[] = [
  dummyProductSeeder,
  storefrontDemoCatalogSeeder,
]
