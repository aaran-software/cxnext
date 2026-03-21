import type {
  Product,
  ProductAttribute,
  ProductAttributeInput,
  ProductAttributeValue,
  ProductAttributeValueInput,
  ProductDiscount,
  ProductDiscountInput,
  ProductImage,
  ProductImageInput,
  ProductOffer,
  ProductOfferInput,
  ProductPrice,
  ProductPriceInput,
  ProductReview,
  ProductReviewInput,
  ProductSeo,
  ProductStockItem,
  ProductStockItemInput,
  ProductStockMovement,
  ProductStockMovementInput,
  ProductSummary,
  ProductTag,
  ProductTagInput,
  ProductUpsertPayload,
  ProductVariant,
  ProductVariantInput,
  ProductVariantMap,
} from '@shared/index'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { randomUUID } from 'node:crypto'
import { ensureDatabaseSchema } from '../../../shared/database/database'
import { db } from '../../../shared/database/orm'
import { productTableNames } from '../../../shared/database/table-names'
import { ApplicationError } from '../../../shared/errors/application-error'

interface ProductSummaryRow extends RowDataPacket {
  id: string
  uuid: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  brand_id: string | null
  category_id: string | null
  product_group_id: string | null
  product_type_id: string | null
  unit_id: string | null
  hsn_code_id: string | null
  style_id: string | null
  sku: string
  has_variants: number
  base_price: number | string
  cost_price: number | string
  tax_id: string | null
  is_featured: number
  is_active: number
  primary_image_url: string | null
  variant_count: number
  tag_count: number
  created_at: Date
  updated_at: Date
}

interface ProductRow extends ProductSummaryRow {}
interface ProductImageRow extends RowDataPacket { id: string; product_id: string; image_url: string; is_primary: number; sort_order: number; is_active: number; created_at: Date; updated_at: Date }
interface ProductVariantRow extends RowDataPacket { id: string; product_id: string; sku: string; variant_name: string; price: number | string; cost_price: number | string; stock_quantity: number | string; opening_stock: number | string; weight: number | string | null; barcode: string | null; is_active: number; created_at: Date; updated_at: Date }
interface ProductVariantImageRow extends RowDataPacket { id: string; variant_id: string; image_url: string; is_primary: number; is_active: number; created_at: Date; updated_at: Date }
interface ProductVariantAttributeRow extends RowDataPacket { id: string; variant_id: string; attribute_name: string; attribute_value: string; is_active: number; created_at: Date; updated_at: Date }
interface ProductPriceRow extends RowDataPacket { id: string; product_id: string; variant_id: string | null; mrp: number | string; selling_price: number | string; cost_price: number | string; is_active: number; created_at: Date; updated_at: Date }
interface ProductDiscountRow extends RowDataPacket { id: string; product_id: string; variant_id: string | null; discount_type: string; discount_value: number | string; start_date: Date | null; end_date: Date | null; is_active: number; created_at: Date; updated_at: Date }
interface ProductOfferRow extends RowDataPacket { id: string; product_id: string; title: string; description: string | null; offer_price: number | string; start_date: Date | null; end_date: Date | null; is_active: number; created_at: Date; updated_at: Date }
interface ProductAttributeRow extends RowDataPacket { id: string; product_id: string; name: string; is_active: number; created_at: Date; updated_at: Date }
interface ProductAttributeValueRow extends RowDataPacket { id: string; product_id: string; attribute_id: string; value: string; is_active: number; created_at: Date; updated_at: Date }
interface ProductVariantMapRow extends RowDataPacket { id: string; product_id: string; attribute_id: string; value_id: string; is_active: number; created_at: Date; updated_at: Date }
interface ProductStockItemRow extends RowDataPacket { id: string; product_id: string; variant_id: string | null; warehouse_id: string; quantity: number | string; reserved_quantity: number | string; is_active: number; created_at: Date; updated_at: Date }
interface ProductStockMovementRow extends RowDataPacket { id: string; product_id: string; variant_id: string | null; warehouse_id: string | null; movement_type: string; quantity: number | string; reference_type: string | null; reference_id: string | null; movement_at: Date; is_active: number; created_at: Date; updated_at: Date }
interface ProductSeoRow extends RowDataPacket { id: string; product_id: string; meta_title: string | null; meta_description: string | null; meta_keywords: string | null; is_active: number; created_at: Date; updated_at: Date }
interface ProductTagRow extends RowDataPacket { id: string; name: string; is_active: number; created_at: Date; updated_at: Date }
interface ProductReviewRow extends RowDataPacket { id: string; product_id: string; user_id: string | null; rating: number; review: string | null; review_date: Date; is_active: number; created_at: Date; updated_at: Date }

type SqlExecutor = (sql: string, params?: (string | number | boolean | null)[]) => Promise<unknown>
type SqlFirst = <T extends RowDataPacket = RowDataPacket>(sql: string, params?: (string | number | boolean | null)[]) => Promise<T | null>

const asTimestamp = (value: Date) => value.toISOString()
const asDateOnly = (value: Date | null) => value ? value.toISOString().slice(0, 10) : null
const asDateTimeInput = (value: string | null) => value ? value.replace('T', ' ').slice(0, 19) : new Date().toISOString().slice(0, 19).replace('T', ' ')

function toProductSummary(row: ProductSummaryRow): ProductSummary {
  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    brandId: row.brand_id,
    categoryId: row.category_id,
    productGroupId: row.product_group_id,
    productTypeId: row.product_type_id,
    unitId: row.unit_id,
    hsnCodeId: row.hsn_code_id,
    styleId: row.style_id,
    sku: row.sku,
    hasVariants: Boolean(row.has_variants),
    basePrice: Number(row.base_price),
    costPrice: Number(row.cost_price),
    taxId: row.tax_id,
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active),
    primaryImageUrl: row.primary_image_url,
    variantCount: Number(row.variant_count),
    tagCount: Number(row.tag_count),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductImage(row: ProductImageRow): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    imageUrl: row.image_url,
    isPrimary: Boolean(row.is_primary),
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductPrice(row: ProductPriceRow): ProductPrice {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    mrp: Number(row.mrp),
    sellingPrice: Number(row.selling_price),
    costPrice: Number(row.cost_price),
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductDiscount(row: ProductDiscountRow): ProductDiscount {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    startDate: asDateOnly(row.start_date),
    endDate: asDateOnly(row.end_date),
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductOffer(row: ProductOfferRow): ProductOffer {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    description: row.description,
    offerPrice: Number(row.offer_price),
    startDate: asDateOnly(row.start_date),
    endDate: asDateOnly(row.end_date),
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductAttribute(row: ProductAttributeRow): ProductAttribute {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductAttributeValue(row: ProductAttributeValueRow): ProductAttributeValue {
  return {
    id: row.id,
    productId: row.product_id,
    attributeId: row.attribute_id,
    value: row.value,
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductVariantMap(row: ProductVariantMapRow): ProductVariantMap {
  return {
    id: row.id,
    productId: row.product_id,
    attributeId: row.attribute_id,
    valueId: row.value_id,
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductStockItem(row: ProductStockItemRow): ProductStockItem {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    warehouseId: row.warehouse_id,
    quantity: Number(row.quantity),
    reservedQuantity: Number(row.reserved_quantity),
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductStockMovement(row: ProductStockMovementRow): ProductStockMovement {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    warehouseId: row.warehouse_id,
    movementType: row.movement_type,
    quantity: Number(row.quantity),
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    movementAt: asTimestamp(row.movement_at),
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductSeo(row: ProductSeoRow): ProductSeo {
  return {
    id: row.id,
    productId: row.product_id,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    metaKeywords: row.meta_keywords,
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductTag(row: ProductTagRow): ProductTag {
  return {
    id: row.id,
    name: row.name,
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

function toProductReview(row: ProductReviewRow): ProductReview {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    rating: Number(row.rating),
    review: row.review,
    reviewDate: asTimestamp(row.review_date),
    isActive: Boolean(row.is_active),
    createdAt: asTimestamp(row.created_at),
    updatedAt: asTimestamp(row.updated_at),
  }
}

export class ProductRepository {
  async list() {
    await ensureDatabaseSchema()

    const rows = await db.query<ProductSummaryRow>(`
      SELECT
        p.*,
        (
          SELECT pi.image_url
          FROM ${productTableNames.images} pi
          WHERE pi.product_id = p.id AND pi.is_active = 1
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.created_at ASC
          LIMIT 1
        ) AS primary_image_url,
        (
          SELECT COUNT(*)
          FROM ${productTableNames.variants} pv
          WHERE pv.product_id = p.id AND pv.is_active = 1
        ) AS variant_count,
        (
          SELECT COUNT(*)
          FROM ${productTableNames.tagMap} ptm
          WHERE ptm.product_id = p.id AND ptm.is_active = 1
        ) AS tag_count
      FROM ${productTableNames.products} p
      ORDER BY p.created_at DESC
    `)

    return rows.map(toProductSummary)
  }

  async findById(id: string) {
    await ensureDatabaseSchema()

    const row = await db.first<ProductRow>(`
      SELECT
        p.*,
        (
          SELECT pi.image_url
          FROM ${productTableNames.images} pi
          WHERE pi.product_id = p.id AND pi.is_active = 1
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.created_at ASC
          LIMIT 1
        ) AS primary_image_url,
        (
          SELECT COUNT(*)
          FROM ${productTableNames.variants} pv
          WHERE pv.product_id = p.id AND pv.is_active = 1
        ) AS variant_count,
        (
          SELECT COUNT(*)
          FROM ${productTableNames.tagMap} ptm
          WHERE ptm.product_id = p.id AND ptm.is_active = 1
        ) AS tag_count
      FROM ${productTableNames.products} p
      WHERE p.id = ?
      LIMIT 1
    `, [id])

    if (!row) {
      return null
    }

    const [
      images,
      variants,
      variantImages,
      variantAttributes,
      prices,
      discounts,
      offers,
      attributes,
      attributeValues,
      variantMap,
      stockItems,
      stockMovements,
      seo,
      tags,
      reviews,
    ] = await Promise.all([
      db.query<ProductImageRow>(`SELECT * FROM ${productTableNames.images} WHERE product_id = ? AND is_active = 1 ORDER BY is_primary DESC, sort_order ASC, created_at ASC`, [id]),
      db.query<ProductVariantRow>(`SELECT * FROM ${productTableNames.variants} WHERE product_id = ? AND is_active = 1 ORDER BY created_at ASC`, [id]),
      db.query<ProductVariantImageRow>(`
        SELECT pvi.*
        FROM ${productTableNames.variantImages} pvi
        INNER JOIN ${productTableNames.variants} pv ON pv.id = pvi.variant_id
        WHERE pv.product_id = ? AND pvi.is_active = 1 AND pv.is_active = 1
        ORDER BY pvi.is_primary DESC, pvi.created_at ASC
      `, [id]),
      db.query<ProductVariantAttributeRow>(`
        SELECT pva.*
        FROM ${productTableNames.variantAttributes} pva
        INNER JOIN ${productTableNames.variants} pv ON pv.id = pva.variant_id
        WHERE pv.product_id = ? AND pva.is_active = 1 AND pv.is_active = 1
        ORDER BY pva.created_at ASC
      `, [id]),
      db.query<ProductPriceRow>(`SELECT * FROM ${productTableNames.prices} WHERE product_id = ? AND is_active = 1 ORDER BY created_at ASC`, [id]),
      db.query<ProductDiscountRow>(`SELECT * FROM ${productTableNames.discounts} WHERE product_id = ? AND is_active = 1 ORDER BY created_at ASC`, [id]),
      db.query<ProductOfferRow>(`SELECT * FROM ${productTableNames.offers} WHERE product_id = ? AND is_active = 1 ORDER BY created_at ASC`, [id]),
      db.query<ProductAttributeRow>(`SELECT * FROM ${productTableNames.attributes} WHERE product_id = ? AND is_active = 1 ORDER BY created_at ASC`, [id]),
      db.query<ProductAttributeValueRow>(`SELECT * FROM ${productTableNames.attributeValues} WHERE product_id = ? AND is_active = 1 ORDER BY created_at ASC`, [id]),
      db.query<ProductVariantMapRow>(`SELECT * FROM ${productTableNames.variantMap} WHERE product_id = ? AND is_active = 1 ORDER BY created_at ASC`, [id]),
      db.query<ProductStockItemRow>(`SELECT * FROM ${productTableNames.stockItems} WHERE product_id = ? AND is_active = 1 ORDER BY created_at ASC`, [id]),
      db.query<ProductStockMovementRow>(`SELECT * FROM ${productTableNames.stockMovements} WHERE product_id = ? AND is_active = 1 ORDER BY movement_at DESC, created_at DESC`, [id]),
      db.first<ProductSeoRow>(`SELECT * FROM ${productTableNames.seo} WHERE product_id = ? AND is_active = 1 LIMIT 1`, [id]),
      db.query<ProductTagRow>(`
        SELECT pt.*
        FROM ${productTableNames.tags} pt
        INNER JOIN ${productTableNames.tagMap} ptm ON ptm.tag_id = pt.id
        WHERE ptm.product_id = ? AND ptm.is_active = 1 AND pt.is_active = 1
        ORDER BY pt.name ASC
      `, [id]),
      db.query<ProductReviewRow>(`SELECT * FROM ${productTableNames.reviews} WHERE product_id = ? AND is_active = 1 ORDER BY review_date DESC, created_at DESC`, [id]),
    ])

    const variantImagesByVariantId = new Map<string, ProductVariantImageRow[]>()
    const variantAttributesByVariantId = new Map<string, ProductVariantAttributeRow[]>()

    for (const image of variantImages) {
      const collection = variantImagesByVariantId.get(image.variant_id) ?? []
      collection.push(image)
      variantImagesByVariantId.set(image.variant_id, collection)
    }

    for (const attribute of variantAttributes) {
      const collection = variantAttributesByVariantId.get(attribute.variant_id) ?? []
      collection.push(attribute)
      variantAttributesByVariantId.set(attribute.variant_id, collection)
    }

    const mappedVariants: ProductVariant[] = variants.map((variant) => ({
      id: variant.id,
      productId: variant.product_id,
      sku: variant.sku,
      variantName: variant.variant_name,
      price: Number(variant.price),
      costPrice: Number(variant.cost_price),
      stockQuantity: Number(variant.stock_quantity),
      openingStock: Number(variant.opening_stock),
      weight: variant.weight == null ? null : Number(variant.weight),
      barcode: variant.barcode,
      isActive: Boolean(variant.is_active),
      createdAt: asTimestamp(variant.created_at),
      updatedAt: asTimestamp(variant.updated_at),
      images: (variantImagesByVariantId.get(variant.id) ?? []).map((image) => ({
        id: image.id,
        variantId: image.variant_id,
        imageUrl: image.image_url,
        isPrimary: Boolean(image.is_primary),
        isActive: Boolean(image.is_active),
        createdAt: asTimestamp(image.created_at),
        updatedAt: asTimestamp(image.updated_at),
      })),
      attributes: (variantAttributesByVariantId.get(variant.id) ?? []).map((attribute) => ({
        id: attribute.id,
        variantId: attribute.variant_id,
        attributeName: attribute.attribute_name,
        attributeValue: attribute.attribute_value,
        isActive: Boolean(attribute.is_active),
        createdAt: asTimestamp(attribute.created_at),
        updatedAt: asTimestamp(attribute.updated_at),
      })),
    }))

    return {
      ...toProductSummary(row),
      images: images.map(toProductImage),
      variants: mappedVariants,
      prices: prices.map(toProductPrice),
      discounts: discounts.map(toProductDiscount),
      offers: offers.map(toProductOffer),
      attributes: attributes.map(toProductAttribute),
      attributeValues: attributeValues.map(toProductAttributeValue),
      variantMap: variantMap.map(toProductVariantMap),
      stockItems: stockItems.map(toProductStockItem),
      stockMovements: stockMovements.map(toProductStockMovement),
      seo: seo ? toProductSeo(seo) : null,
      tags: tags.map(toProductTag),
      reviews: reviews.map(toProductReview),
    } satisfies Product
  }

  async create(payload: ProductUpsertPayload) {
    await ensureDatabaseSchema()
    const id = randomUUID()
    const uuid = randomUUID()

    await db.transaction(async (transaction) => {
      await transaction.execute(
        `
          INSERT INTO ${productTableNames.products} (
            id, uuid, name, slug, description, short_description, brand_id, category_id, product_group_id, product_type_id, unit_id, hsn_code_id, style_id, sku, has_variants, base_price, cost_price, tax_id, is_featured, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id,
          uuid,
          payload.name,
          payload.slug,
          payload.description,
          payload.shortDescription,
          payload.brandId,
          payload.categoryId,
          payload.productGroupId,
          payload.productTypeId,
          payload.unitId,
          payload.hsnCodeId,
          payload.styleId,
          payload.sku,
          payload.hasVariants,
          payload.basePrice,
          payload.costPrice,
          payload.taxId,
          payload.isFeatured,
          payload.isActive,
        ],
      )

      await this.replaceChildren(transaction.execute.bind(transaction), transaction.first.bind(transaction), id, payload)
    })

    const item = await this.findById(id)
    if (!item) {
      throw new ApplicationError('Expected created product to be retrievable.', { id }, 500)
    }

    return item
  }

  async update(id: string, payload: ProductUpsertPayload) {
    await ensureDatabaseSchema()

    await db.transaction(async (transaction) => {
      const existing = await transaction.first<RowDataPacket>(`SELECT id FROM ${productTableNames.products} WHERE id = ? LIMIT 1`, [id])
      if (!existing) {
        throw new ApplicationError('Product not found.', { id }, 404)
      }

      await transaction.execute(
        `
          UPDATE ${productTableNames.products}
          SET
            name = ?,
            slug = ?,
            description = ?,
            short_description = ?,
            brand_id = ?,
            category_id = ?,
            product_group_id = ?,
            product_type_id = ?,
            unit_id = ?,
            hsn_code_id = ?,
            style_id = ?,
            sku = ?,
            has_variants = ?,
            base_price = ?,
            cost_price = ?,
            tax_id = ?,
            is_featured = ?,
            is_active = ?
          WHERE id = ?
        `,
        [
          payload.name,
          payload.slug,
          payload.description,
          payload.shortDescription,
          payload.brandId,
          payload.categoryId,
          payload.productGroupId,
          payload.productTypeId,
          payload.unitId,
          payload.hsnCodeId,
          payload.styleId,
          payload.sku,
          payload.hasVariants,
          payload.basePrice,
          payload.costPrice,
          payload.taxId,
          payload.isFeatured,
          payload.isActive,
          id,
        ],
      )

      await this.replaceChildren(transaction.execute.bind(transaction), transaction.first.bind(transaction), id, payload)
    })

    const item = await this.findById(id)
    if (!item) {
      throw new ApplicationError('Expected updated product to be retrievable.', { id }, 500)
    }

    return item
  }

  async setActiveState(id: string, isActive: boolean) {
    await ensureDatabaseSchema()

    const result = await db.execute(`UPDATE ${productTableNames.products} SET is_active = ? WHERE id = ?`, [isActive, id]) as ResultSetHeader
    if (result.affectedRows === 0) {
      throw new ApplicationError('Product not found.', { id }, 404)
    }

    const item = await this.findById(id)
    if (!item) {
      throw new ApplicationError('Expected product to be retrievable after state update.', { id }, 500)
    }

    return item
  }

  private async replaceChildren(execute: SqlExecutor, first: SqlFirst, productId: string, payload: ProductUpsertPayload) {
    await this.replaceProductImages(execute, productId, payload.images)
    await this.replaceAttributes(execute, productId, payload.attributes, payload.attributeValues)
    const variantIdByClientKey = await this.replaceVariants(execute, productId, payload.variants)
    await this.replacePrices(execute, productId, payload.prices, variantIdByClientKey)
    await this.replaceDiscounts(execute, productId, payload.discounts, variantIdByClientKey)
    await this.replaceOffers(execute, productId, payload.offers)
    await this.replaceStockItems(execute, productId, payload.stockItems, variantIdByClientKey)
    await this.replaceStockMovements(execute, productId, payload.stockMovements, variantIdByClientKey)
    await this.replaceSeo(execute, productId, payload.seo)
    await this.replaceTags(execute, first, productId, payload.tags)
    await this.replaceReviews(execute, productId, payload.reviews)
  }

  private async replaceProductImages(execute: SqlExecutor, productId: string, images: ProductImageInput[]) {
    await execute(`UPDATE ${productTableNames.images} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    for (const image of images) {
      await execute(
        `INSERT INTO ${productTableNames.images} (id, product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?, ?)`,
        [randomUUID(), productId, image.imageUrl, image.isPrimary, image.sortOrder],
      )
    }
  }

  private async replaceAttributes(
    execute: SqlExecutor,
    productId: string,
    attributes: ProductAttributeInput[],
    attributeValues: ProductAttributeValueInput[],
  ) {
    await execute(`UPDATE ${productTableNames.variantMap} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    await execute(`UPDATE ${productTableNames.attributeValues} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    await execute(`UPDATE ${productTableNames.attributes} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])

    const attributeIdByClientKey = new Map<string, string>()

    for (const attribute of attributes) {
      const attributeId = randomUUID()
      attributeIdByClientKey.set(attribute.clientKey, attributeId)
      await execute(`INSERT INTO ${productTableNames.attributes} (id, product_id, name) VALUES (?, ?, ?)`, [attributeId, productId, attribute.name])
    }

    for (const attributeValue of attributeValues) {
      const attributeId = attributeIdByClientKey.get(attributeValue.attributeClientKey)
      if (!attributeId) {
        throw new ApplicationError('Attribute value references an unknown attribute.', { attributeClientKey: attributeValue.attributeClientKey }, 400)
      }

      const valueId = randomUUID()
      await execute(
        `INSERT INTO ${productTableNames.attributeValues} (id, product_id, attribute_id, value) VALUES (?, ?, ?, ?)`,
        [valueId, productId, attributeId, attributeValue.value],
      )
      await execute(
        `INSERT INTO ${productTableNames.variantMap} (id, product_id, attribute_id, value_id) VALUES (?, ?, ?, ?)`,
        [randomUUID(), productId, attributeId, valueId],
      )
    }
  }

  private async replaceVariants(execute: SqlExecutor, productId: string, variants: ProductVariantInput[]) {
    await execute(`
      UPDATE ${productTableNames.variantImages} pvi
      INNER JOIN ${productTableNames.variants} pv ON pv.id = pvi.variant_id
      SET pvi.is_active = 0
      WHERE pv.product_id = ? AND pvi.is_active = 1
    `, [productId])
    await execute(`
      UPDATE ${productTableNames.variantAttributes} pva
      INNER JOIN ${productTableNames.variants} pv ON pv.id = pva.variant_id
      SET pva.is_active = 0
      WHERE pv.product_id = ? AND pva.is_active = 1
    `, [productId])
    await execute(`UPDATE ${productTableNames.variants} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])

    const variantIdByClientKey = new Map<string, string>()

    for (const variant of variants) {
      const variantId = randomUUID()
      variantIdByClientKey.set(variant.clientKey, variantId)

      await execute(
        `INSERT INTO ${productTableNames.variants} (id, product_id, sku, variant_name, price, cost_price, stock_quantity, opening_stock, weight, barcode, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [variantId, productId, variant.sku, variant.variantName, variant.price, variant.costPrice, variant.stockQuantity, variant.openingStock, variant.weight, variant.barcode, variant.isActive],
      )

      for (const image of variant.images) {
        await execute(
          `INSERT INTO ${productTableNames.variantImages} (id, variant_id, image_url, is_primary) VALUES (?, ?, ?, ?)`,
          [randomUUID(), variantId, image.imageUrl, image.isPrimary],
        )
      }

      for (const attribute of variant.attributes) {
        await execute(
          `INSERT INTO ${productTableNames.variantAttributes} (id, variant_id, attribute_name, attribute_value) VALUES (?, ?, ?, ?)`,
          [randomUUID(), variantId, attribute.attributeName, attribute.attributeValue],
        )
      }
    }

    return variantIdByClientKey
  }

  private async replacePrices(execute: SqlExecutor, productId: string, prices: ProductPriceInput[], variantIdByClientKey: Map<string, string>) {
    await execute(`UPDATE ${productTableNames.prices} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    for (const price of prices) {
      await execute(
        `INSERT INTO ${productTableNames.prices} (id, product_id, variant_id, mrp, selling_price, cost_price) VALUES (?, ?, ?, ?, ?, ?)`,
        [randomUUID(), productId, price.variantClientKey ? variantIdByClientKey.get(price.variantClientKey) ?? null : null, price.mrp, price.sellingPrice, price.costPrice],
      )
    }
  }

  private async replaceDiscounts(execute: SqlExecutor, productId: string, discounts: ProductDiscountInput[], variantIdByClientKey: Map<string, string>) {
    await execute(`UPDATE ${productTableNames.discounts} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    for (const discount of discounts) {
      await execute(
        `INSERT INTO ${productTableNames.discounts} (id, product_id, variant_id, discount_type, discount_value, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), productId, discount.variantClientKey ? variantIdByClientKey.get(discount.variantClientKey) ?? null : null, discount.discountType, discount.discountValue, discount.startDate, discount.endDate],
      )
    }
  }

  private async replaceOffers(execute: SqlExecutor, productId: string, offers: ProductOfferInput[]) {
    await execute(`UPDATE ${productTableNames.offers} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    for (const offer of offers) {
      await execute(
        `INSERT INTO ${productTableNames.offers} (id, product_id, title, description, offer_price, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), productId, offer.title, offer.description, offer.offerPrice, offer.startDate, offer.endDate],
      )
    }
  }

  private async replaceStockItems(execute: SqlExecutor, productId: string, stockItems: ProductStockItemInput[], variantIdByClientKey: Map<string, string>) {
    await execute(`UPDATE ${productTableNames.stockItems} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    for (const stockItem of stockItems) {
      await execute(
        `INSERT INTO ${productTableNames.stockItems} (id, product_id, variant_id, warehouse_id, quantity, reserved_quantity) VALUES (?, ?, ?, ?, ?, ?)`,
        [randomUUID(), productId, stockItem.variantClientKey ? variantIdByClientKey.get(stockItem.variantClientKey) ?? null : null, stockItem.warehouseId, stockItem.quantity, stockItem.reservedQuantity],
      )
    }
  }

  private async replaceStockMovements(execute: SqlExecutor, productId: string, stockMovements: ProductStockMovementInput[], variantIdByClientKey: Map<string, string>) {
    await execute(`UPDATE ${productTableNames.stockMovements} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    for (const movement of stockMovements) {
      await execute(
        `INSERT INTO ${productTableNames.stockMovements} (id, product_id, variant_id, warehouse_id, movement_type, quantity, reference_type, reference_id, movement_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), productId, movement.variantClientKey ? variantIdByClientKey.get(movement.variantClientKey) ?? null : null, movement.warehouseId, movement.movementType, movement.quantity, movement.referenceType, movement.referenceId, asDateTimeInput(movement.movementAt)],
      )
    }
  }

  private async replaceSeo(execute: SqlExecutor, productId: string, seo: ProductUpsertPayload['seo']) {
    await execute(`UPDATE ${productTableNames.seo} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    if (!seo) {
      return
    }
    await execute(
      `INSERT INTO ${productTableNames.seo} (id, product_id, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), productId, seo.metaTitle, seo.metaDescription, seo.metaKeywords],
    )
  }

  private async replaceTags(execute: SqlExecutor, first: SqlFirst, productId: string, tags: ProductTagInput[]) {
    await execute(`UPDATE ${productTableNames.tagMap} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    const uniqueNames = [...new Set(tags.map((tag) => tag.name.trim()).filter(Boolean))]

    for (const name of uniqueNames) {
      const existing = await first<ProductTagRow>(`SELECT * FROM ${productTableNames.tags} WHERE name = ? LIMIT 1`, [name])
      const tagId = existing?.id ?? randomUUID()

      if (existing) {
        await execute(`UPDATE ${productTableNames.tags} SET is_active = 1 WHERE id = ?`, [tagId])
      } else {
        await execute(`INSERT INTO ${productTableNames.tags} (id, name) VALUES (?, ?)`, [tagId, name])
      }

      await execute(`INSERT INTO ${productTableNames.tagMap} (id, product_id, tag_id) VALUES (?, ?, ?)`, [randomUUID(), productId, tagId])
    }
  }

  private async replaceReviews(execute: SqlExecutor, productId: string, reviews: ProductReviewInput[]) {
    await execute(`UPDATE ${productTableNames.reviews} SET is_active = 0 WHERE product_id = ? AND is_active = 1`, [productId])
    for (const review of reviews) {
      await execute(
        `INSERT INTO ${productTableNames.reviews} (id, product_id, user_id, rating, review, review_date) VALUES (?, ?, ?, ?, ?, ?)`,
        [randomUUID(), productId, review.userId, review.rating, review.review, asDateTimeInput(review.reviewDate)],
      )
    }
  }
}
