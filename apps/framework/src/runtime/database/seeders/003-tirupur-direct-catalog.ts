import type { RowDataPacket } from 'mysql2/promise'
import { environment } from '../../config/environment'
import {
  commonTableNames,
  companyTableNames,
  productTableNames,
} from '../table-names'
import type { Seeder } from './seeder'

type SqlValue = string | number | boolean | null
type UpsertRow = Record<string, SqlValue>

interface WarehouseRow extends RowDataPacket {
  id: string
}

interface CompanyRow extends RowDataPacket {
  id: string
}

type ProductSeed = {
  key: string
  name: string
  categoryId: string
  department: 'men' | 'women' | 'kids'
  styleId: 'style:casual' | 'style:formal' | 'style:sport'
  basePrice: number
  compareAtPrice: number
  costPrice: number
  fabric: string
  fit: string
  sleeve: string
  occasion: string
  badge: string
  colours: string[]
  sizes: string[]
  homeSliderOrder?: number
  promoSliderOrder?: number
  featureSectionOrder?: number
  isNewArrival?: boolean
  isBestSeller?: boolean
  isFeaturedLabel?: boolean
}

const categories = [
  ['product-category:mens-knit', 'MENS_KNIT', "Men's", 'Knitted mens garments made in Tiruppur.'],
  ['product-category:womens-knit', 'WOMENS_KNIT', "Women's", 'Knitted womens garments made in Tiruppur.'],
  ['product-category:boys-knit', 'BOYS_KNIT', 'Boys', 'Boys knitwear from Tiruppur factories.'],
  ['product-category:girls-knit', 'GIRLS_KNIT', 'Girls', 'Girls knitwear from Tiruppur factories.'],
  ['product-category:infant-knit', 'INFANT_KNIT', 'Infant', 'Infant knit essentials from Tiruppur.'],
  ['product-category:innerwear-knit', 'INNERWEAR_KNIT', 'Inner Wears', 'Innerwear and hosiery from Tiruppur.'],
  ['product-category:casual-tees', 'CASUAL_TEES', 'Casual T-Shirts', 'Casual knit tees from Tiruppur.'],
  ['product-category:festival-tees', 'FESTIVAL_TEES', 'Festival T-Shirts', 'Festival knit tees from Tiruppur.'],
  ['product-category:corporate-tees', 'CORPORATE_TEES', 'Corporate T-Shirts', 'Corporate knit tees from Tiruppur.'],
] as const

const colours = [
  ['colour:black', 'BLACK', 'Black', '#000000'],
  ['colour:white', 'WHITE', 'White', '#FFFFFF'],
  ['colour:navy', 'NAVY', 'Navy', '#1F2A44'],
  ['colour:maroon', 'MAROON', 'Maroon', '#7F1D1D'],
  ['colour:olive', 'OLIVE', 'Olive', '#556B2F'],
  ['colour:charcoal', 'CHARCOAL', 'Charcoal', '#374151'],
  ['colour:heather-grey', 'HEATHER_GREY', 'Heather Grey', '#9CA3AF'],
  ['colour:sky', 'SKY', 'Sky Blue', '#7DD3FC'],
  ['colour:peach', 'PEACH', 'Peach', '#FDBA74'],
  ['colour:pink', 'PINK', 'Pink', '#F472B6'],
  ['colour:mint', 'MINT', 'Mint', '#6EE7B7'],
  ['colour:mustard', 'MUSTARD', 'Mustard', '#D97706'],
] as const

const sizes = [
  ['size:s', 'S', 'Small', 2],
  ['size:m', 'M', 'Medium', 3],
  ['size:l', 'L', 'Large', 4],
  ['size:xl', 'XL', 'Extra Large', 5],
  ['size:xxl', 'XXL', '2XL', 6],
  ['size:22', '22', '22', 20],
  ['size:24', '24', '24', 21],
  ['size:26', '26', '26', 22],
  ['size:28', '28', '28', 23],
  ['size:0-3m', '0_3M', '0-3M', 30],
  ['size:3-6m', '3_6M', '3-6M', 31],
  ['size:6-12m', '6_12M', '6-12M', 32],
  ['size:12-18m', '12_18M', '12-18M', 33],
] as const

const products: ProductSeed[] = [
  { key: 'mens-bio-washed-tee', name: "Men's Bio-Washed Crew Neck Tee", categoryId: 'product-category:casual-tees', department: 'men', styleId: 'style:casual', basePrice: 549, compareAtPrice: 699, costPrice: 295, fabric: '180 GSM Single Jersey', fit: 'Regular', sleeve: 'Half Sleeve', occasion: 'Daily Wear', badge: 'Factory Basic', colours: ['colour:black', 'colour:white'], sizes: ['size:s', 'size:m', 'size:l', 'size:xl'], homeSliderOrder: 1, featureSectionOrder: 1, isNewArrival: true, isBestSeller: true, isFeaturedLabel: true },
  { key: 'mens-export-pique-polo', name: "Men's Export Pique Polo", categoryId: 'product-category:mens-knit', department: 'men', styleId: 'style:formal', basePrice: 749, compareAtPrice: 899, costPrice: 410, fabric: '220 GSM Cotton Pique', fit: 'Regular', sleeve: 'Half Sleeve', occasion: 'Smart Casual', badge: 'Export Polo', colours: ['colour:navy', 'colour:maroon'], sizes: ['size:m', 'size:l', 'size:xl', 'size:xxl'], homeSliderOrder: 2, promoSliderOrder: 1, featureSectionOrder: 2, isBestSeller: true, isFeaturedLabel: true },
  { key: 'mens-french-terry-jogger', name: "Men's French Terry Jogger", categoryId: 'product-category:mens-knit', department: 'men', styleId: 'style:sport', basePrice: 799, compareAtPrice: 999, costPrice: 455, fabric: 'French Terry Knit', fit: 'Tapered', sleeve: 'N/A', occasion: 'Travel', badge: 'Lounge Knit', colours: ['colour:charcoal', 'colour:olive'], sizes: ['size:m', 'size:l', 'size:xl'], promoSliderOrder: 2, featureSectionOrder: 3, isBestSeller: true },
  { key: 'mens-melange-henley', name: "Men's Melange Henley Tee", categoryId: 'product-category:mens-knit', department: 'men', styleId: 'style:casual', basePrice: 699, compareAtPrice: 859, costPrice: 372, fabric: 'Melange Jersey Knit', fit: 'Slim', sleeve: 'Full Sleeve', occasion: 'Weekend', badge: 'Weekend Edit', colours: ['colour:heather-grey', 'colour:navy'], sizes: ['size:s', 'size:m', 'size:l', 'size:xl'], featureSectionOrder: 4, isNewArrival: true },
  { key: 'mens-inner-vest', name: "Men's Premium Inner Vest", categoryId: 'product-category:innerwear-knit', department: 'men', styleId: 'style:casual', basePrice: 329, compareAtPrice: 429, costPrice: 180, fabric: 'Combed Rib Knit', fit: 'Body Fit', sleeve: 'Sleeveless', occasion: 'Everyday Basics', badge: 'Hosiery', colours: ['colour:white', 'colour:black'], sizes: ['size:s', 'size:m', 'size:l', 'size:xl'], isBestSeller: true },
  { key: 'mens-corporate-tee', name: "Men's Corporate Team Tee", categoryId: 'product-category:corporate-tees', department: 'men', styleId: 'style:formal', basePrice: 599, compareAtPrice: 749, costPrice: 322, fabric: 'Compact Cotton Jersey', fit: 'Regular', sleeve: 'Half Sleeve', occasion: 'Corporate Events', badge: 'Corporate', colours: ['colour:navy', 'colour:white'], sizes: ['size:s', 'size:m', 'size:l', 'size:xl', 'size:xxl'], promoSliderOrder: 3, featureSectionOrder: 5, isBestSeller: true, isFeaturedLabel: true },
  { key: 'mens-festival-graphic-tee', name: "Men's Festival Graphic Tee", categoryId: 'product-category:festival-tees', department: 'men', styleId: 'style:casual', basePrice: 649, compareAtPrice: 829, costPrice: 338, fabric: 'Bio-Washed Jersey', fit: 'Regular', sleeve: 'Half Sleeve', occasion: 'Festival', badge: 'Festive Drop', colours: ['colour:maroon', 'colour:black'], sizes: ['size:m', 'size:l', 'size:xl'], homeSliderOrder: 3, promoSliderOrder: 4, featureSectionOrder: 6, isNewArrival: true },
  { key: 'womens-oversized-boxy-tee', name: "Women's Oversized Boxy Tee", categoryId: 'product-category:womens-knit', department: 'women', styleId: 'style:casual', basePrice: 679, compareAtPrice: 849, costPrice: 356, fabric: 'Single Jersey Bio-Wash', fit: 'Oversized', sleeve: 'Drop Shoulder', occasion: 'Daily Wear', badge: 'Boxy Fit', colours: ['colour:white', 'colour:peach'], sizes: ['size:s', 'size:m', 'size:l'], promoSliderOrder: 5, featureSectionOrder: 7, isNewArrival: true, isBestSeller: true },
  { key: 'womens-rib-knit-top', name: "Women's Rib Knit Top", categoryId: 'product-category:womens-knit', department: 'women', styleId: 'style:casual', basePrice: 599, compareAtPrice: 759, costPrice: 318, fabric: 'Cotton Lycra Rib', fit: 'Slim', sleeve: 'Cap Sleeve', occasion: 'Daywear', badge: 'Rib Essential', colours: ['colour:pink', 'colour:black'], sizes: ['size:s', 'size:m', 'size:l'], featureSectionOrder: 8, isNewArrival: true },
  { key: 'womens-tshirt-dress', name: "Women's Lounge T-Shirt Dress", categoryId: 'product-category:womens-knit', department: 'women', styleId: 'style:casual', basePrice: 899, compareAtPrice: 1099, costPrice: 492, fabric: 'Compact Single Jersey', fit: 'Relaxed', sleeve: 'Half Sleeve', occasion: 'Lounge', badge: 'Lounge Dress', colours: ['colour:charcoal', 'colour:mint'], sizes: ['size:s', 'size:m', 'size:l', 'size:xl'], featureSectionOrder: 9, isBestSeller: true },
  { key: 'womens-camisole-pack', name: "Women's Inner Camisole Pack", categoryId: 'product-category:innerwear-knit', department: 'women', styleId: 'style:casual', basePrice: 429, compareAtPrice: 549, costPrice: 232, fabric: 'Fine Rib Hosiery', fit: 'Body Fit', sleeve: 'Sleeveless', occasion: 'Innerwear', badge: 'Innerwear', colours: ['colour:white', 'colour:peach'], sizes: ['size:s', 'size:m', 'size:l', 'size:xl'], isNewArrival: true },
  { key: 'boys-active-school-tee', name: 'Boys Active School Tee', categoryId: 'product-category:boys-knit', department: 'kids', styleId: 'style:sport', basePrice: 399, compareAtPrice: 499, costPrice: 220, fabric: 'Compact Sports Jersey', fit: 'Regular', sleeve: 'Half Sleeve', occasion: 'School', badge: 'School Ready', colours: ['colour:navy', 'colour:sky'], sizes: ['size:22', 'size:24', 'size:26', 'size:28'], featureSectionOrder: 11, isBestSeller: true },
  { key: 'boys-printed-casual-tee', name: 'Boys Printed Casual Tee', categoryId: 'product-category:boys-knit', department: 'kids', styleId: 'style:casual', basePrice: 429, compareAtPrice: 549, costPrice: 236, fabric: 'Bio-Washed Kids Jersey', fit: 'Regular', sleeve: 'Half Sleeve', occasion: 'Playtime', badge: 'Kids Casual', colours: ['colour:mustard', 'colour:sky'], sizes: ['size:22', 'size:24', 'size:26', 'size:28'], featureSectionOrder: 12, isNewArrival: true },
  { key: 'boys-fleece-jogger', name: 'Boys Fleece Lounge Jogger', categoryId: 'product-category:boys-knit', department: 'kids', styleId: 'style:sport', basePrice: 549, compareAtPrice: 699, costPrice: 302, fabric: 'Brushed Fleece Knit', fit: 'Relaxed', sleeve: 'N/A', occasion: 'Travel', badge: 'Fleece Knit', colours: ['colour:charcoal', 'colour:navy'], sizes: ['size:22', 'size:24', 'size:26', 'size:28'], isBestSeller: true },
  { key: 'girls-ruffle-tee', name: 'Girls Ruffle Sleeve Tee', categoryId: 'product-category:girls-knit', department: 'kids', styleId: 'style:casual', basePrice: 449, compareAtPrice: 579, costPrice: 248, fabric: 'Soft Cotton Jersey', fit: 'Regular', sleeve: 'Ruffle Sleeve', occasion: 'Daywear', badge: 'Girls Pick', colours: ['colour:pink', 'colour:mint'], sizes: ['size:22', 'size:24', 'size:26', 'size:28'], featureSectionOrder: 13, isNewArrival: true, isBestSeller: true },
  { key: 'girls-glitter-top', name: 'Girls Glitter Print Top', categoryId: 'product-category:girls-knit', department: 'kids', styleId: 'style:casual', basePrice: 499, compareAtPrice: 629, costPrice: 276, fabric: 'Fine Jersey Knit', fit: 'Regular', sleeve: 'Cap Sleeve', occasion: 'Celebration', badge: 'Party Knit', colours: ['colour:peach', 'colour:pink'], sizes: ['size:22', 'size:24', 'size:26', 'size:28'], isNewArrival: true },
  { key: 'infant-interlock-romper', name: 'Infant Interlock Romper', categoryId: 'product-category:infant-knit', department: 'kids', styleId: 'style:casual', basePrice: 459, compareAtPrice: 579, costPrice: 250, fabric: 'Cotton Interlock Knit', fit: 'Comfort Fit', sleeve: 'Short Sleeve', occasion: 'Infant Essentials', badge: 'Soft Interlock', colours: ['colour:sky', 'colour:mint'], sizes: ['size:0-3m', 'size:3-6m', 'size:6-12m'], featureSectionOrder: 14, isNewArrival: true, isBestSeller: true },
  { key: 'infant-bodysuit-pack', name: 'Infant Bodysuit Value Pack', categoryId: 'product-category:infant-knit', department: 'kids', styleId: 'style:casual', basePrice: 549, compareAtPrice: 679, costPrice: 305, fabric: 'Combed Cotton Knit', fit: 'Comfort Fit', sleeve: 'Sleeveless', occasion: 'Infant Basics', badge: 'Value Pack', colours: ['colour:white', 'colour:peach'], sizes: ['size:0-3m', 'size:3-6m', 'size:6-12m', 'size:12-18m'], featureSectionOrder: 15, isBestSeller: true },
  { key: 'infant-sleepsuit-set', name: 'Infant Sleepsuit Set', categoryId: 'product-category:infant-knit', department: 'kids', styleId: 'style:casual', basePrice: 629, compareAtPrice: 779, costPrice: 352, fabric: 'Interlock Night Knit', fit: 'Comfort Fit', sleeve: 'Full Sleeve', occasion: 'Sleepwear', badge: 'Night Soft', colours: ['colour:sky', 'colour:pink'], sizes: ['size:3-6m', 'size:6-12m', 'size:12-18m'], isNewArrival: true },
  { key: 'womens-corporate-tee', name: "Women's Corporate Team Tee", categoryId: 'product-category:corporate-tees', department: 'women', styleId: 'style:formal', basePrice: 589, compareAtPrice: 729, costPrice: 318, fabric: 'Compact Cotton Knit', fit: 'Regular', sleeve: 'Half Sleeve', occasion: 'Corporate Events', badge: 'Corporate Knit', colours: ['colour:white', 'colour:navy'], sizes: ['size:s', 'size:m', 'size:l', 'size:xl'], promoSliderOrder: 6, featureSectionOrder: 16, isBestSeller: true, isFeaturedLabel: true },
] as const

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function labelFromId(id: string) {
  return id.split(':').at(-1)?.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') ?? id
}

function imageUrl(label: string) {
  return `https://placehold.co/1200x1200/F7E8D5/2B1A14?text=${encodeURIComponent(label)}`
}

async function upsertRows(
  execute: (sql: string, params?: SqlValue[]) => Promise<unknown>,
  tableName: string,
  rows: UpsertRow[],
) {
  for (const row of rows) {
    const columns = Object.keys(row)
    const updateColumns = columns.filter((column) => column !== 'id')
    await execute(
      `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')}) ON DUPLICATE KEY UPDATE ${updateColumns.map((column) => `${column} = VALUES(${column})`).join(', ')}`,
      columns.map((column) => row[column] ?? null),
    )
  }
}

async function resolveWarehouseId(
  first: <T extends RowDataPacket = RowDataPacket>(sql: string, params?: SqlValue[]) => Promise<T | null>,
) {
  const warehouse = await first<WarehouseRow>(
    `
      SELECT id
      FROM ${commonTableNames.warehouses}
      WHERE is_active = 1
      ORDER BY
        CASE
          WHEN id = 'warehouse:tirupur-direct' THEN 0
          WHEN id = 'warehouse:main' THEN 1
          ELSE 2
        END,
        created_at ASC
      LIMIT 1
    `,
  )

  return warehouse?.id ?? 'warehouse:main'
}

async function resolveCompanyId(
  first: <T extends RowDataPacket = RowDataPacket>(sql: string, params?: SqlValue[]) => Promise<T | null>,
  requestedId: string,
  requestedName: string,
) {
  const company = await first<CompanyRow>(
    `
      SELECT id
      FROM ${companyTableNames.companies}
      WHERE id = ? OR name = ?
      ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END, created_at ASC
      LIMIT 1
    `,
    [requestedId, requestedName, requestedId],
  )

  return company?.id ?? requestedId
}

function buildStorefrontTemplates(): UpsertRow[] {
  return [
    {
      id: 'storefront-template:home-category',
      code: 'home-category',
      name: 'Home Category',
      sort_order: 10,
      badge_text: 'Tiruppur Knit Range',
      title: 'Garment online shopping delivered direct from export factories.',
      description:
        'Tirupur Direct brings Tiruppur-made knitwear across men’s, women’s, boys, girls, infant, innerwear, casual, festival, and corporate T-shirt programs.',
      cta_primary_label: 'Browse Tiruppur catalog',
      cta_primary_href: '/search',
      cta_secondary_label: null,
      cta_secondary_href: null,
      icon_key: null,
      theme_key: 'sand',
      is_active: 1,
    },
    {
      id: 'storefront-template:home-featured',
      code: 'home-featured',
      name: 'Home Featured',
      sort_order: 20,
      badge_text: 'Factory Featured',
      title: 'Top knitwear picks from Tirupur Direct.',
      description:
        'These products spotlight export-factory quality, ready stock, and direct dispatch capability from the Tiruppur garment base.',
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      icon_key: null,
      theme_key: 'neutral',
      is_active: 1,
    },
    {
      id: 'storefront-template:home-new-arrivals',
      code: 'home-new-arrivals',
      name: 'Home New Arrivals',
      sort_order: 30,
      badge_text: 'Latest Knits',
      title: 'Fresh Tiruppur knit drops for every age group.',
      description: 'New arrivals come straight from hosiery and knitwear lines with updated fits, colours, and print programs.',
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      icon_key: null,
      theme_key: 'sand',
      is_active: 1,
    },
    {
      id: 'storefront-template:home-bestsellers',
      code: 'home-bestsellers',
      name: 'Home Best Sellers',
      sort_order: 40,
      badge_text: 'Best Sellers',
      title: 'Popular Tiruppur Direct styles moving fastest.',
      description: 'These proven knitwear lines lead demand across basics, polos, innerwear, and kids programs.',
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      icon_key: null,
      theme_key: 'mist',
      is_active: 1,
    },
    {
      id: 'storefront-template:home-featured-labels',
      code: 'home-featured-labels',
      name: 'Home Featured Labels',
      sort_order: 50,
      badge_text: 'Industry Link',
      title: 'Tirupur Direct with TEAMA-linked manufacturing confidence.',
      description:
        'Built around Tiruppur’s exporter and manufacturer ecosystem, the shop reflects knitwear specialization and scalable production thinking.',
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      icon_key: null,
      theme_key: 'neutral',
      is_active: 1,
    },
    {
      id: 'storefront-template:home-cta',
      code: 'home-cta',
      name: 'Home CTA',
      sort_order: 60,
      badge_text: 'Direct From Tiruppur',
      title: 'Shop Tiruppur knitwear with factory-direct pricing and ready stock.',
      description:
        'From casual T-shirts to innerwear, kidswear, festival drops, and corporate programs, Tirupur Direct is built for wide-range garment selling from the Tiruppur base.',
      cta_primary_label: 'Start shopping',
      cta_primary_href: '/search',
      cta_secondary_label: 'Open cart',
      cta_secondary_href: '/cart',
      icon_key: null,
      theme_key: 'cta',
      is_active: 1,
    },
    {
      id: 'storefront-template:trust-editorial',
      code: 'trust-editorial',
      name: 'Trust Editorial',
      sort_order: 70,
      badge_text: null,
      title: 'Tiruppur knitwear focus only',
      description: 'This store is intentionally centered on knitted garments and excludes woven-item catalog noise.',
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      icon_key: 'sparkles',
      theme_key: 'trust',
      is_active: 1,
    },
    {
      id: 'storefront-template:trust-delivery',
      code: 'trust-delivery',
      name: 'Trust Delivery',
      sort_order: 80,
      badge_text: null,
      title: 'Delivered direct from export factories',
      description: 'Dispatch planning is aligned to Tiruppur manufacturing flow for faster, cleaner garment movement.',
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      icon_key: 'truck',
      theme_key: 'trust',
      is_active: 1,
    },
    {
      id: 'storefront-template:trust-shell',
      code: 'trust-shell',
      name: 'Trust Shell',
      sort_order: 90,
      badge_text: null,
      title: 'Built around Tiruppur industry association confidence',
      description: 'The merchandising story aligns with TEAMA, the Tiruppur Exporter and Manufacturer Association.',
      cta_primary_label: null,
      cta_primary_href: null,
      cta_secondary_label: null,
      cta_secondary_href: null,
      icon_key: 'shield',
      theme_key: 'trust',
      is_active: 1,
    },
  ]
}

function buildTags() {
  return [
    { id: 'product-tag:tirupur-direct', name: 'tirupur-direct', is_active: 1 },
    { id: 'product-tag:tirupur-knitwear', name: 'tirupur-knitwear', is_active: 1 },
    { id: 'product-tag:factory-direct', name: 'factory-direct', is_active: 1 },
    { id: 'product-tag:teama', name: 'teama', is_active: 1 },
  ] satisfies UpsertRow[]
}

export const tirupurDirectCatalogSeeder: Seeder = {
  id: '003-tirupur-direct-catalog',
  name: 'Tirupur Direct storefront catalog and branding',
  isEnabled: () => environment.seed.products.enabled,
  async run({ db }) {
    await db.transaction(async (transaction) => {
      const execute = transaction.execute.bind(transaction)

      await execute(`UPDATE ${productTableNames.products} SET is_active = 0 WHERE id = 'product:demo-cxnext-polo' OR id LIKE 'product:demo-%'`)
      await execute(`UPDATE ${productTableNames.storefront} SET is_active = 0 WHERE product_id = 'product:demo-cxnext-polo' OR product_id LIKE 'product:demo-%'`)

      await upsertRows(execute, commonTableNames.districts, [
        { id: 'district:IN-TN-TUP', state_id: 'state:IN-TN', code: 'TUP', name: 'Tiruppur', is_active: 1 },
      ])
      await upsertRows(execute, commonTableNames.cities, [
        { id: 'city:IN-TN-TIRUPPUR', state_id: 'state:IN-TN', district_id: 'district:IN-TN-TUP', code: 'TIRUPPUR', name: 'Tiruppur', is_active: 1 },
      ])
      await upsertRows(execute, commonTableNames.pincodes, [
        { id: 'pincode:641601', country_id: 'country:IN', state_id: 'state:IN-TN', district_id: 'district:IN-TN-TUP', city_id: 'city:IN-TN-TIRUPPUR', code: '641601', area_name: 'Tiruppur', is_active: 1 },
      ])
      await upsertRows(execute, commonTableNames.warehouses, [
        { id: 'warehouse:tirupur-direct', code: 'TIRUPUR_DIRECT', name: 'Tirupur Direct Warehouse', country_id: 'country:IN', state_id: 'state:IN-TN', district_id: 'district:IN-TN-TUP', city_id: 'city:IN-TN-TIRUPPUR', pincode_id: 'pincode:641601', address_line1: 'No. 12, Export Knit Cluster', address_line2: 'Avinashi Road', description: 'Primary Tiruppur knitwear dispatch point.', is_active: 1 },
      ])

      await upsertRows(execute, commonTableNames.brands, [
        { id: 'brand:tirupur-direct', code: 'TIRUPUR_DIRECT', name: 'TIRUPUR DIRECT', description: 'The Tirupur Direct knitwear label connected to Tiruppur exporter and manufacturer networks.', is_active: 1 },
      ])
      await upsertRows(execute, commonTableNames.productCategories, categories.map(([id, code, name, description]) => ({ id, code, name, description, is_active: 1 })))
      await upsertRows(execute, commonTableNames.colours, colours.map(([id, code, name, hex]) => ({ id, code, name, hex_code: hex, description: `${name} knitwear tone.`, is_active: 1 })))
      await upsertRows(execute, commonTableNames.sizes, sizes.map(([id, code, name, sortOrder]) => ({ id, code, name, sort_order: sortOrder, description: `${name} size.`, is_active: 1 })))

      await upsertRows(execute, companyTableNames.companies, [
        { id: 'company:tirupur-direct', name: 'TIRUPUR DIRECT', legal_name: 'TIRUPUR TEXTILES', registration_number: 'TD-TEAMA-2026', pan: 'AAJCT4001L', financial_year_start: '2025-04-01', books_start: '2025-04-01', website: 'https://tirupurdirect.com', description: 'Garment online shopping delivered direct from Tiruppur export factories. Tirupur Direct works in association with TEAMA, the Tiruppur Exporter and Manufacturer Association, to present knitwear-focused factory collections.', is_active: 1 },
      ])
      const companyId = await resolveCompanyId(transaction.first.bind(transaction), 'company:tirupur-direct', 'TIRUPUR DIRECT')
      await upsertRows(execute, companyTableNames.logos, [
        { id: 'company-logo:tirupur-direct-primary', company_id: companyId, logo_url: imageUrl('TIRUPUR DIRECT Logo'), logo_type: 'primary', is_active: 1 },
      ])
      await upsertRows(execute, companyTableNames.addresses, [
        { id: 'company-address:tirupur-direct-head-office', company_id: companyId, address_type: 'head_office', address_line1: 'No. 12, Export Knit Cluster', address_line2: 'Avinashi Road', city_id: 'city:IN-TN-TIRUPPUR', state_id: 'state:IN-TN', country_id: 'country:IN', pincode_id: 'pincode:641601', latitude: 11.1085, longitude: 77.3411, is_default: 1, is_active: 1 },
      ])
      await upsertRows(execute, companyTableNames.emails, [
        { id: 'company-email:tirupur-direct-primary', company_id: companyId, email: 'sales@tirupurdirect.com', email_type: 'sales', is_active: 1 },
      ])
      await upsertRows(execute, companyTableNames.phones, [
        { id: 'company-phone:tirupur-direct-primary', company_id: companyId, phone_number: '+91 90039 64160', phone_type: 'phone', is_primary: 1, is_active: 1 },
      ])

      await upsertRows(execute, commonTableNames.storefrontTemplates, buildStorefrontTemplates())
      await upsertRows(execute, productTableNames.tags, buildTags())

      const warehouseId = await resolveWarehouseId(transaction.first.bind(transaction))

      for (const [productIndex, product] of products.entries()) {
        const productId = `product:${product.key}`
        const slug = slugify(product.name)
        const skuBase = `TD-${product.key.replace(/[^a-z0-9]+/gi, '-').toUpperCase()}`
        const shortDescription = `${product.fabric} ${product.badge.toLowerCase()} made in Tiruppur and sold on Tirupur Direct.`
        const description = `${product.name} is part of the Tirupur Direct knitwear range, built for ${product.occasion.toLowerCase()} with ${product.fabric.toLowerCase()} and delivery direct from export factory networks.`

        await upsertRows(execute, productTableNames.products, [
          { id: productId, uuid: product.key, name: product.name, slug, description, short_description: shortDescription, brand_id: 'brand:tirupur-direct', category_id: product.categoryId, product_group_id: 'product-group:apparel', product_type_id: 'product-type:finished-goods', unit_id: 'unit:pcs', hsn_code_id: 'hsn:610910', style_id: product.styleId, sku: skuBase, has_variants: 1, base_price: product.basePrice, cost_price: product.costPrice, tax_id: 'tax:gst-12', is_featured: product.featureSectionOrder ? 1 : 0, is_active: 1 },
          ])
        await upsertRows(execute, productTableNames.images, [
          { id: `product-image:${product.key}:1`, product_id: productId, image_url: imageUrl(`${product.name} Front`), is_primary: 1, sort_order: 1, is_active: 1 },
          { id: `product-image:${product.key}:2`, product_id: productId, image_url: imageUrl(`${product.name} Detail`), is_primary: 0, sort_order: 2, is_active: 1 },
        ])
        await upsertRows(execute, productTableNames.attributes, [
          { id: `product-attribute:${product.key}:size`, product_id: productId, name: 'Size', is_active: 1 },
          { id: `product-attribute:${product.key}:colour`, product_id: productId, name: 'Colour', is_active: 1 },
        ])
        await upsertRows(execute, productTableNames.attributeValues, [
          ...product.sizes.map((sizeId) => ({ id: `product-attribute-value:${product.key}:${sizeId.replace(':', '-')}`, product_id: productId, attribute_id: `product-attribute:${product.key}:size`, value: labelFromId(sizeId), is_active: 1 })),
          ...product.colours.map((colourId) => ({ id: `product-attribute-value:${product.key}:${colourId.replace(':', '-')}`, product_id: productId, attribute_id: `product-attribute:${product.key}:colour`, value: labelFromId(colourId), is_active: 1 })),
        ])
        await upsertRows(execute, productTableNames.variantMap, [
          ...product.sizes.map((sizeId) => ({ id: `product-variant-map:${product.key}:${sizeId.replace(':', '-')}`, product_id: productId, attribute_id: `product-attribute:${product.key}:size`, value_id: `product-attribute-value:${product.key}:${sizeId.replace(':', '-')}`, is_active: 1 })),
          ...product.colours.map((colourId) => ({ id: `product-variant-map:${product.key}:${colourId.replace(':', '-')}`, product_id: productId, attribute_id: `product-attribute:${product.key}:colour`, value_id: `product-attribute-value:${product.key}:${colourId.replace(':', '-')}`, is_active: 1 })),
        ])

        const variantRows: UpsertRow[] = []
        const variantImageRows: UpsertRow[] = []
        const variantAttributeRows: UpsertRow[] = []
        const priceRows: UpsertRow[] = [{ id: `product-price:${product.key}:base`, product_id: productId, variant_id: null, mrp: product.compareAtPrice, selling_price: product.basePrice, cost_price: product.costPrice, is_active: 1 }]
        const stockItemRows: UpsertRow[] = []
        const stockMovementRows: UpsertRow[] = []

        product.colours.forEach((colourId, colourIndex) => {
          product.sizes.forEach((sizeId, sizeIndex) => {
            const variantId = `product-variant:${product.key}:${colourIndex}:${sizeIndex}`
            const price = product.basePrice + sizeIndex * 15 + colourIndex * 10
            const costPrice = product.costPrice + sizeIndex * 8 + colourIndex * 5
            const openingStock = 12 + productIndex + sizeIndex * 2 + colourIndex * 3
            variantRows.push({ id: variantId, product_id: productId, sku: `${skuBase}-${colourIndex + 1}-${sizeIndex + 1}`, variant_name: `${labelFromId(colourId)} / ${labelFromId(sizeId)}`, price, cost_price: costPrice, stock_quantity: openingStock, opening_stock: openingStock, weight: 0.18 + productIndex * 0.01, barcode: `89026${String(productIndex + 1).padStart(2, '0')}${String(colourIndex + 1).padStart(2, '0')}${String(sizeIndex + 1).padStart(2, '0')}`, is_active: 1 })
            variantImageRows.push({ id: `product-variant-image:${product.key}:${colourIndex}:${sizeIndex}`, variant_id: variantId, image_url: imageUrl(`${product.name} ${labelFromId(colourId)}`), is_primary: 1, is_active: 1 })
            variantAttributeRows.push({ id: `product-variant-attribute:${product.key}:${colourIndex}:${sizeIndex}:size`, variant_id: variantId, attribute_name: 'Size', attribute_value: labelFromId(sizeId), is_active: 1 })
            variantAttributeRows.push({ id: `product-variant-attribute:${product.key}:${colourIndex}:${sizeIndex}:colour`, variant_id: variantId, attribute_name: 'Colour', attribute_value: labelFromId(colourId), is_active: 1 })
            priceRows.push({ id: `product-price:${product.key}:${colourIndex}:${sizeIndex}`, product_id: productId, variant_id: variantId, mrp: price + 120, selling_price: price, cost_price: costPrice, is_active: 1 })
            stockItemRows.push({ id: `stock-item:${product.key}:${colourIndex}:${sizeIndex}`, product_id: productId, variant_id: variantId, warehouse_id: warehouseId, quantity: openingStock, reserved_quantity: sizeIndex % 2, is_active: 1 })
            stockMovementRows.push({ id: `stock-movement:${product.key}:${colourIndex}:${sizeIndex}`, product_id: productId, variant_id: variantId, warehouse_id: warehouseId, movement_type: 'OPENING_STOCK', quantity: openingStock, reference_type: 'SEEDER', reference_id: '003-tirupur-direct-catalog', movement_at: '2026-03-23 09:00:00', is_active: 1 })
          })
        })

        await upsertRows(execute, productTableNames.variants, variantRows)
        await upsertRows(execute, productTableNames.variantImages, variantImageRows)
        await upsertRows(execute, productTableNames.variantAttributes, variantAttributeRows)
        await upsertRows(execute, productTableNames.prices, priceRows)
        await upsertRows(execute, productTableNames.discounts, [{ id: `product-discount:${product.key}`, product_id: productId, variant_id: null, discount_type: 'PERCENTAGE', discount_value: 12, start_date: null, end_date: null, is_active: 1 }])
        await upsertRows(execute, productTableNames.offers, [{ id: `product-offer:${product.key}`, product_id: productId, title: 'Factory-direct offer', description: 'Direct-from-Tiruppur knitwear pricing for the current drop.', offer_price: Math.max(product.basePrice - 60, product.costPrice + 30), start_date: null, end_date: null, is_active: 1 }])
        await upsertRows(execute, productTableNames.seo, [{ id: `product-seo:${product.key}`, product_id: productId, meta_title: `${product.name} | Tirupur Direct`, meta_description: shortDescription, meta_keywords: `tirupur direct,tiruppur knitwear,${slug}`, is_active: 1 }])
        await upsertRows(execute, productTableNames.reviews, [
          { id: `product-review:${product.key}:1`, product_id: productId, user_id: null, rating: product.isBestSeller ? 5 : 4, review: `${product.name} delivers clean Tiruppur knit quality and strong value.`, review_date: '2026-03-20 10:00:00', is_active: 1 },
          { id: `product-review:${product.key}:2`, product_id: productId, user_id: null, rating: 4, review: 'Reliable sizing, clean knit finish, and good factory-direct pricing.', review_date: '2026-03-21 10:00:00', is_active: 1 },
        ])
        await upsertRows(execute, productTableNames.tagMap, [
          { id: `product-tag-map:${product.key}:1`, product_id: productId, tag_id: 'product-tag:tirupur-direct', is_active: 1 },
          { id: `product-tag-map:${product.key}:2`, product_id: productId, tag_id: 'product-tag:tirupur-knitwear', is_active: 1 },
          { id: `product-tag-map:${product.key}:3`, product_id: productId, tag_id: 'product-tag:factory-direct', is_active: 1 },
          ...(product.isFeaturedLabel ? [{ id: `product-tag-map:${product.key}:4`, product_id: productId, tag_id: 'product-tag:teama', is_active: 1 }] : []),
        ])
        await upsertRows(execute, productTableNames.stockItems, stockItemRows)
        await upsertRows(execute, productTableNames.stockMovements, stockMovementRows)
        await upsertRows(execute, productTableNames.storefront, [
          { id: `storefront:${product.key}`, product_id: productId, department: product.department, home_slider_enabled: product.homeSliderOrder ? 1 : 0, home_slider_order: product.homeSliderOrder ?? 0, promo_slider_enabled: product.promoSliderOrder ? 1 : 0, promo_slider_order: product.promoSliderOrder ?? 0, feature_section_enabled: product.featureSectionOrder ? 1 : 0, feature_section_order: product.featureSectionOrder ?? 0, is_new_arrival: product.isNewArrival ? 1 : 0, is_best_seller: product.isBestSeller ? 1 : 0, is_featured_label: product.isFeaturedLabel ? 1 : 0, catalog_badge: product.badge, fabric: product.fabric, fit: product.fit, sleeve: product.sleeve, occasion: product.occasion, shipping_note: 'Delivered direct from Tiruppur export factory.', is_active: 1 },
        ])
      }
    })
  },
}
