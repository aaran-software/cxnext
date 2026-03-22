import type { RowDataPacket } from 'mysql2/promise'
import { environment } from '../../config/environment'
import { commonTableNames, productTableNames } from '../table-names'
import type { Seeder } from './seeder'

type SqlValue = string | number | boolean | null

interface WarehouseRow extends RowDataPacket {
  id: string
}

type DemoProductSeed = {
  id: string
  uuid: string
  name: string
  slug: string
  description: string
  shortDescription: string
  brandId: string
  categoryId: string
  sku: string
  basePrice: number
  costPrice: number
  imageUrl: string
  compareAtPrice: number
  reviewRating: number
  reviewText: string
  stockQuantity: number
  storefront: {
    department: 'women' | 'men' | 'kids' | 'accessories'
    homeSliderEnabled: boolean
    homeSliderOrder: number
    promoSliderEnabled: boolean
    promoSliderOrder: number
    featureSectionEnabled: boolean
    featureSectionOrder: number
    isNewArrival: boolean
    isBestSeller: boolean
    isFeaturedLabel: boolean
    catalogBadge: string | null
    fabric: string | null
    fit: string | null
    sleeve: string | null
    occasion: string | null
    shippingNote: string | null
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
          WHEN id = 'warehouse:main' THEN 0
          WHEN id = '1' THEN 1
          ELSE 2
        END,
        created_at ASC
      LIMIT 1
    `,
  )

  return warehouse?.id ?? '1'
}

const demoProducts: DemoProductSeed[] = [
  {
    id: 'product:demo-occasion-saree',
    uuid: 'demo-occasion-saree',
    name: 'Occasion Saree',
    slug: 'occasion-saree',
    description: 'Silk-blend festive saree used to validate storefront hero, feature placement, and checkout flows.',
    shortDescription: 'Festive storefront hero product.',
    brandId: 'brand:codexsun',
    categoryId: 'product-category:womenswear',
    sku: 'CXN-SAREE-001',
    basePrice: 3299,
    costPrice: 1750,
    imageUrl: 'https://placehold.co/1200x1200?text=Occasion+Saree',
    compareAtPrice: 3799,
    reviewRating: 5,
    reviewText: 'Useful seeded record for validating hero slider and checkout.',
    stockQuantity: 14,
    storefront: {
      department: 'women',
      homeSliderEnabled: true,
      homeSliderOrder: 2,
      promoSliderEnabled: false,
      promoSliderOrder: 0,
      featureSectionEnabled: true,
      featureSectionOrder: 3,
      isNewArrival: true,
      isBestSeller: false,
      isFeaturedLabel: false,
      catalogBadge: 'Festive Edit',
      fabric: 'Silk Blend',
      fit: 'Draped',
      sleeve: 'Blouse Piece',
      occasion: 'Celebration',
      shippingNote: 'Handled with protective festive packaging.',
    },
  },
  {
    id: 'product:demo-linen-kurta',
    uuid: 'demo-linen-kurta',
    name: 'Linen Kurta Set',
    slug: 'linen-kurta-set',
    description: 'Breathable linen kurta set for feature section, promo placement, and arrival filters.',
    shortDescription: 'Fresh arrival storefront feature.',
    brandId: 'brand:codexsun',
    categoryId: 'product-category:womenswear',
    sku: 'CXN-KURTA-001',
    basePrice: 1899,
    costPrice: 980,
    imageUrl: 'https://placehold.co/1200x1200?text=Linen+Kurta',
    compareAtPrice: 2199,
    reviewRating: 4,
    reviewText: 'Helps verify new-arrival and promo storefront sections.',
    stockQuantity: 22,
    storefront: {
      department: 'women',
      homeSliderEnabled: false,
      homeSliderOrder: 0,
      promoSliderEnabled: true,
      promoSliderOrder: 1,
      featureSectionEnabled: true,
      featureSectionOrder: 2,
      isNewArrival: true,
      isBestSeller: false,
      isFeaturedLabel: false,
      catalogBadge: 'Fresh Edit',
      fabric: 'Linen',
      fit: 'Relaxed',
      sleeve: 'Three Quarter',
      occasion: 'Daywear',
      shippingNote: 'Ships within 48 hours from the central warehouse.',
    },
  },
  {
    id: 'product:demo-city-blazer',
    uuid: 'demo-city-blazer',
    name: 'City Blazer',
    slug: 'city-blazer',
    description: 'Structured blazer seeded for menswear listing, feature placement, and best-seller grouping.',
    shortDescription: 'Tailored menswear highlight.',
    brandId: 'brand:codexsun',
    categoryId: 'product-category:menswear',
    sku: 'CXN-BLAZER-001',
    basePrice: 3899,
    costPrice: 2140,
    imageUrl: 'https://placehold.co/1200x1200?text=City+Blazer',
    compareAtPrice: 4299,
    reviewRating: 5,
    reviewText: 'Strong seeded sample for featured labels and best-seller blocks.',
    stockQuantity: 10,
    storefront: {
      department: 'men',
      homeSliderEnabled: false,
      homeSliderOrder: 0,
      promoSliderEnabled: false,
      promoSliderOrder: 0,
      featureSectionEnabled: true,
      featureSectionOrder: 1,
      isNewArrival: false,
      isBestSeller: true,
      isFeaturedLabel: true,
      catalogBadge: 'Tailored',
      fabric: 'Poly Wool',
      fit: 'Slim',
      sleeve: 'Full',
      occasion: 'Workwear',
      shippingNote: 'Delivered on hanger-ready packing where available.',
    },
  },
  {
    id: 'product:demo-weekend-tote',
    uuid: 'demo-weekend-tote',
    name: 'Weekend Tote',
    slug: 'weekend-tote',
    description: 'Accessory product used for accessory recommendations, promo rotation, and best-seller grouping.',
    shortDescription: 'Accessory add-on for cart and catalog testing.',
    brandId: 'brand:generic',
    categoryId: 'product-category:accessories',
    sku: 'CXN-TOTE-001',
    basePrice: 1299,
    costPrice: 640,
    imageUrl: 'https://placehold.co/1200x1200?text=Weekend+Tote',
    compareAtPrice: 1499,
    reviewRating: 4,
    reviewText: 'Useful accessory seed for cart recommendations and promo slider.',
    stockQuantity: 30,
    storefront: {
      department: 'accessories',
      homeSliderEnabled: false,
      homeSliderOrder: 0,
      promoSliderEnabled: true,
      promoSliderOrder: 2,
      featureSectionEnabled: false,
      featureSectionOrder: 0,
      isNewArrival: false,
      isBestSeller: true,
      isFeaturedLabel: false,
      catalogBadge: 'Carry All',
      fabric: 'Canvas',
      fit: null,
      sleeve: null,
      occasion: 'Travel',
      shippingNote: 'Packed flat to reduce transit bulk.',
    },
  },
]

export const storefrontDemoCatalogSeeder: Seeder = {
  id: '002-storefront-demo-catalog',
  name: 'Storefront demo catalog expansion',
  isEnabled: () => environment.seed.products.enabled,
  async run({ db }) {
    await db.transaction(async (transaction) => {
      const warehouseId = await resolveWarehouseId(transaction.first.bind(transaction))

      await transaction.execute(
        `
          INSERT INTO ${productTableNames.storefront} (
            id,
            product_id,
            department,
            home_slider_enabled,
            home_slider_order,
            promo_slider_enabled,
            promo_slider_order,
            feature_section_enabled,
            feature_section_order,
            is_new_arrival,
            is_best_seller,
            is_featured_label,
            catalog_badge,
            fabric,
            fit,
            sleeve,
            occasion,
            shipping_note
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            department = VALUES(department),
            home_slider_enabled = VALUES(home_slider_enabled),
            home_slider_order = VALUES(home_slider_order),
            promo_slider_enabled = VALUES(promo_slider_enabled),
            promo_slider_order = VALUES(promo_slider_order),
            feature_section_enabled = VALUES(feature_section_enabled),
            feature_section_order = VALUES(feature_section_order),
            is_new_arrival = VALUES(is_new_arrival),
            is_best_seller = VALUES(is_best_seller),
            is_featured_label = VALUES(is_featured_label),
            catalog_badge = VALUES(catalog_badge),
            fabric = VALUES(fabric),
            fit = VALUES(fit),
            sleeve = VALUES(sleeve),
            occasion = VALUES(occasion),
            shipping_note = VALUES(shipping_note),
            is_active = 1
        `,
        [
          'storefront:demo-cxnext-polo',
          'product:demo-cxnext-polo',
          'men',
          true,
          1,
          false,
          0,
          true,
          4,
          false,
          false,
          true,
          'Signature Polo',
          'Cotton Pique',
          'Regular',
          'Half',
          'Weekend',
          'Ships from the main warehouse with folded apparel packing.',
        ],
      )

      for (const product of demoProducts) {
        const existing = await transaction.first<RowDataPacket>(
          `SELECT id FROM ${productTableNames.products} WHERE id = ? LIMIT 1`,
          [product.id],
        )

        if (!existing) {
          await transaction.execute(
            `
              INSERT INTO ${productTableNames.products} (
                id, uuid, name, slug, description, short_description, brand_id, category_id, product_group_id, product_type_id, unit_id, hsn_code_id, style_id, sku, has_variants, base_price, cost_price, tax_id, is_featured, is_active
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              product.id,
              product.uuid,
              product.name,
              product.slug,
              product.description,
              product.shortDescription,
              product.brandId,
              product.categoryId,
              'product-group:apparel',
              'product-type:finished-goods',
              'unit:pcs',
              'hsn:610910',
              product.categoryId === 'product-category:menswear' ? 'style:formal' : 'style:casual',
              product.sku,
              false,
              product.basePrice,
              product.costPrice,
              'tax:gst-12',
              product.storefront.featureSectionEnabled,
              true,
            ],
          )

          await transaction.execute(
            `INSERT INTO ${productTableNames.images} (id, product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)`,
            [`image:${product.id}`, product.id, product.imageUrl, true, 1],
          )

          await transaction.execute(
            `INSERT INTO ${productTableNames.prices} (id, product_id, variant_id, mrp, selling_price, cost_price) VALUES (?, ?, ?, ?, ?, ?)`,
            [`price:${product.id}`, product.id, null, product.compareAtPrice, product.basePrice, product.costPrice],
          )

          await transaction.execute(
            `INSERT INTO ${productTableNames.reviews} (id, product_id, user_id, rating, review, review_date) VALUES (?, ?, ?, ?, ?, ?)`,
            [`review:${product.id}`, product.id, null, product.reviewRating, product.reviewText, '2026-03-20 10:00:00'],
          )

          await transaction.execute(
            `INSERT INTO ${productTableNames.stockItems} (id, product_id, variant_id, warehouse_id, quantity, reserved_quantity) VALUES (?, ?, ?, ?, ?, ?)`,
            [`stock:${product.id}`, product.id, null, warehouseId, product.stockQuantity, 0],
          )
        }

        await transaction.execute(
          `
            INSERT INTO ${productTableNames.storefront} (
              id,
              product_id,
              department,
              home_slider_enabled,
              home_slider_order,
              promo_slider_enabled,
              promo_slider_order,
              feature_section_enabled,
              feature_section_order,
              is_new_arrival,
              is_best_seller,
              is_featured_label,
              catalog_badge,
              fabric,
              fit,
              sleeve,
              occasion,
              shipping_note
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              department = VALUES(department),
              home_slider_enabled = VALUES(home_slider_enabled),
              home_slider_order = VALUES(home_slider_order),
              promo_slider_enabled = VALUES(promo_slider_enabled),
              promo_slider_order = VALUES(promo_slider_order),
              feature_section_enabled = VALUES(feature_section_enabled),
              feature_section_order = VALUES(feature_section_order),
              is_new_arrival = VALUES(is_new_arrival),
              is_best_seller = VALUES(is_best_seller),
              is_featured_label = VALUES(is_featured_label),
              catalog_badge = VALUES(catalog_badge),
              fabric = VALUES(fabric),
              fit = VALUES(fit),
              sleeve = VALUES(sleeve),
              occasion = VALUES(occasion),
              shipping_note = VALUES(shipping_note),
              is_active = 1
          `,
          [
            `storefront:${product.id}`,
            product.id,
            product.storefront.department,
            product.storefront.homeSliderEnabled,
            product.storefront.homeSliderOrder,
            product.storefront.promoSliderEnabled,
            product.storefront.promoSliderOrder,
            product.storefront.featureSectionEnabled,
            product.storefront.featureSectionOrder,
            product.storefront.isNewArrival,
            product.storefront.isBestSeller,
            product.storefront.isFeaturedLabel,
            product.storefront.catalogBadge,
            product.storefront.fabric,
            product.storefront.fit,
            product.storefront.sleeve,
            product.storefront.occasion,
            product.storefront.shippingNote,
          ],
        )
      }
    })
  },
}
