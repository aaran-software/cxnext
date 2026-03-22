import type {
  CommonModuleKey,
  CommonModuleItem,
  Product,
  ProductAttributeInput,
  ProductAttributeValueInput,
  ProductDiscountInput,
  ProductImageInput,
  ProductOfferInput,
  ProductPriceInput,
  ProductReviewInput,
  ProductStockItemInput,
  ProductStockMovementInput,
  ProductTagInput,
  ProductUpsertPayload,
  ProductVariantAttributeInput,
  ProductVariantImageInput,
  ProductVariantInput,
} from '@shared/index'
import { useEffect, useState, type FormEvent, type PropsWithChildren } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { MediaImageField } from '@/components/forms/media-image-field'
import { AnimatedTabs, type AnimatedContentTab } from '@/components/ui/animated-tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AutocompleteLookup } from '@/components/lookups/AutocompleteLookup'
import { createFieldErrors, inputErrorClassName, isBlank, setFieldError, summarizeFieldErrors, type FieldErrors, warningCardClassName } from '@/shared/forms/validation'
import { createCommonLookupOption, toLookupOption } from '@/shared/forms/common-lookup'
import { showFailedActionToast, showSavedToast, showValidationToast } from '@/shared/notifications/toast'
import {
  createProduct,
  getProduct,
  HttpError,
  listCommonModuleItems,
  updateProduct,
} from '@/shared/api/client'

type ProductFormValues = ProductUpsertPayload

const storefrontDepartmentOptions = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'kids', label: 'Kids' },
  { value: 'accessories', label: 'Accessories' },
]

const createClientKey = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)

const emptyImage = (): ProductImageInput => ({ imageUrl: '', isPrimary: false, sortOrder: 0 })
const emptyAttribute = (): ProductAttributeInput => ({ clientKey: createClientKey(), name: '' })
const emptyAttributeValue = (attributeClientKey = ''): ProductAttributeValueInput => ({ clientKey: createClientKey(), attributeClientKey, value: '' })
const emptyVariantImage = (): ProductVariantImageInput => ({ imageUrl: '', isPrimary: false })
const emptyVariantAttribute = (): ProductVariantAttributeInput => ({ attributeName: '', attributeValue: '' })
const emptyVariant = (): ProductVariantInput => ({
  clientKey: createClientKey(),
  sku: '',
  variantName: '',
  price: 0,
  costPrice: 0,
  stockQuantity: 0,
  openingStock: 0,
  weight: null,
  barcode: null,
  isActive: true,
  images: [],
  attributes: [],
})
const emptyPrice = (): ProductPriceInput => ({ variantClientKey: null, mrp: 0, sellingPrice: 0, costPrice: 0 })
const emptyDiscount = (): ProductDiscountInput => ({ variantClientKey: null, discountType: 'percentage', discountValue: 0, startDate: null, endDate: null })
const emptyOffer = (): ProductOfferInput => ({ title: '', description: null, offerPrice: 0, startDate: null, endDate: null })
const emptyStockItem = (): ProductStockItemInput => ({ variantClientKey: null, warehouseId: '', quantity: 0, reservedQuantity: 0 })
const emptyStockMovement = (): ProductStockMovementInput => ({ variantClientKey: null, warehouseId: null, movementType: 'in', quantity: 0, referenceType: null, referenceId: null, movementAt: null })
const emptyTag = (): ProductTagInput => ({ name: '' })
const emptyReview = (): ProductReviewInput => ({ userId: null, rating: 5, review: null, reviewDate: null })
const createDefaultStorefront = () => ({
  department: 'women' as const,
  homeSliderEnabled: false,
  homeSliderOrder: 0,
  promoSliderEnabled: false,
  promoSliderOrder: 0,
  featureSectionEnabled: false,
  featureSectionOrder: 0,
  isNewArrival: false,
  isBestSeller: false,
  isFeaturedLabel: false,
  catalogBadge: null,
  fabric: null,
  fit: null,
  sleeve: null,
  occasion: null,
  shippingNote: null,
})

function createDefaultValues(): ProductFormValues {
  return {
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    brandId: '1',
    categoryId: '1',
    productGroupId: '1',
    productTypeId: '1',
    unitId: '1',
    hsnCodeId: '1',
    styleId: '1',
    sku: '',
    hasVariants: false,
    basePrice: 0,
    costPrice: 0,
    taxId: '1',
    isFeatured: false,
    isActive: true,
    images: [],
    variants: [],
    prices: [],
    discounts: [],
    offers: [],
    attributes: [],
    attributeValues: [],
    stockItems: [],
    stockMovements: [],
    seo: {
      metaTitle: null,
      metaDescription: null,
      metaKeywords: null,
    },
    storefront: createDefaultStorefront(),
    tags: [],
    reviews: [],
  }
}

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) return error.message
  if (error instanceof Error) return error.message
  return 'Failed to save product.'
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-[0.8rem] text-destructive">{message}</p> : null
}

function validateProduct(values: ProductFormValues) {
  const errors = createFieldErrors()

  if (isBlank(values.name)) setFieldError(errors, 'name', 'Name is required.')

  return errors
}

function Section({
  title,
  description,
  addLabel,
  onAdd,
  className,
  contentClassName,
  children,
}: PropsWithChildren<{
  title?: string
  description?: string
  addLabel?: string
  onAdd?: () => void
  className?: string
  contentClassName?: string
}>) {
  const headerAction = addLabel && onAdd ? (
    <Button type="button" variant="outline" size="sm" onClick={onAdd}>
      <Plus className="size-4" />
      {addLabel}
    </Button>
  ) : null
  const hasHeader = Boolean(title || description || headerAction)

  return (
    <Card className={className}>
      {hasHeader ? (
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {headerAction}
        </CardHeader>
      ) : null}
      <CardContent className={contentClassName ?? 'grid gap-4'}>{children}</CardContent>
    </Card>
  )
}

function Row({ children, onRemove }: PropsWithChildren<{ onRemove: () => void }>) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 p-4">
      <div className="mb-4 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>
      {children}
    </div>
  )
}

function LookupSelect({
  label,
  value,
  options,
  moduleKey,
  placeholder = '-',
  onItemsChange,
  onChange,
}: {
  label: string
  value: string | null
  options: CommonModuleItem[]
  moduleKey?: CommonModuleKey
  placeholder?: string
  onItemsChange?: (items: CommonModuleItem[]) => void
  onChange: (value: string | null) => void
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <AutocompleteLookup
        value={value ?? ''}
        onChange={(nextValue) => onChange(nextValue || null)}
        options={options.map(toLookupOption)}
        allowEmptyOption
        emptyOptionLabel={placeholder}
        placeholder={`Search ${label.toLowerCase()}`}
        createOption={moduleKey ? async (labelValue) => {
          const { item, option } = await createCommonLookupOption(moduleKey, labelValue)
          onItemsChange?.([...options, item])
          return option
        } : undefined}
      />
    </div>
  )
}

function VariantSelect({
  label,
  value,
  variants,
  onChange,
}: {
  label: string
  value: string | null
  variants: ProductVariantInput[]
  onChange: (value: string | null) => void
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <option value="">Product level</option>
        {variants.map((variant) => (
          <option key={variant.clientKey} value={variant.clientKey}>
            {variant.variantName || variant.sku || variant.clientKey}
          </option>
        ))}
      </select>
    </div>
  )
}

function toFormValues(product: Product): ProductFormValues {
  const variantClientKeyById = new Map<string, string>()
  const attributes = product.attributes.map((attribute) => ({
    clientKey: attribute.id,
    name: attribute.name,
  }))

  product.variants.forEach((variant) => {
    variantClientKeyById.set(variant.id, variant.id)
  })

  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    shortDescription: product.shortDescription ?? '',
    brandId: product.brandId ?? '1',
    categoryId: product.categoryId ?? '1',
    productGroupId: product.productGroupId ?? '1',
    productTypeId: product.productTypeId ?? '1',
    unitId: product.unitId ?? '1',
    hsnCodeId: product.hsnCodeId ?? '1',
    styleId: product.styleId ?? '1',
    sku: product.sku,
    hasVariants: product.hasVariants,
    basePrice: product.basePrice,
    costPrice: product.costPrice,
    taxId: product.taxId ?? '1',
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    images: product.images.map((image) => ({ imageUrl: image.imageUrl, isPrimary: image.isPrimary, sortOrder: image.sortOrder })),
    variants: product.variants.map((variant) => ({
      clientKey: variant.id,
      sku: variant.sku,
      variantName: variant.variantName,
      price: variant.price,
      costPrice: variant.costPrice,
      stockQuantity: variant.stockQuantity,
      openingStock: variant.openingStock,
      weight: variant.weight,
      barcode: variant.barcode,
      isActive: variant.isActive,
      images: variant.images.map((image) => ({ imageUrl: image.imageUrl, isPrimary: image.isPrimary })),
      attributes: variant.attributes.map((attribute) => ({ attributeName: attribute.attributeName, attributeValue: attribute.attributeValue })),
    })),
    prices: product.prices.map((price) => ({ variantClientKey: price.variantId ? variantClientKeyById.get(price.variantId) ?? null : null, mrp: price.mrp, sellingPrice: price.sellingPrice, costPrice: price.costPrice })),
    discounts: product.discounts.map((discount) => ({ variantClientKey: discount.variantId ? variantClientKeyById.get(discount.variantId) ?? null : null, discountType: discount.discountType, discountValue: discount.discountValue, startDate: discount.startDate, endDate: discount.endDate })),
    offers: product.offers.map((offer) => ({ title: offer.title, description: offer.description, offerPrice: offer.offerPrice, startDate: offer.startDate, endDate: offer.endDate })),
    attributes,
    attributeValues: product.attributeValues.map((value) => ({ clientKey: value.id, attributeClientKey: value.attributeId, value: value.value })),
    stockItems: product.stockItems.map((item) => ({ variantClientKey: item.variantId ? variantClientKeyById.get(item.variantId) ?? null : null, warehouseId: item.warehouseId, quantity: item.quantity, reservedQuantity: item.reservedQuantity })),
    stockMovements: product.stockMovements.map((movement) => ({ variantClientKey: movement.variantId ? variantClientKeyById.get(movement.variantId) ?? null : null, warehouseId: movement.warehouseId, movementType: movement.movementType, quantity: movement.quantity, referenceType: movement.referenceType, referenceId: movement.referenceId, movementAt: movement.movementAt.slice(0, 16) })),
    seo: product.seo ? { metaTitle: product.seo.metaTitle, metaDescription: product.seo.metaDescription, metaKeywords: product.seo.metaKeywords } : { metaTitle: null, metaDescription: null, metaKeywords: null },
    storefront: product.storefront ? {
      department: product.storefront.department,
      homeSliderEnabled: product.storefront.homeSliderEnabled,
      homeSliderOrder: product.storefront.homeSliderOrder,
      promoSliderEnabled: product.storefront.promoSliderEnabled,
      promoSliderOrder: product.storefront.promoSliderOrder,
      featureSectionEnabled: product.storefront.featureSectionEnabled,
      featureSectionOrder: product.storefront.featureSectionOrder,
      isNewArrival: product.storefront.isNewArrival,
      isBestSeller: product.storefront.isBestSeller,
      isFeaturedLabel: product.storefront.isFeaturedLabel,
      catalogBadge: product.storefront.catalogBadge,
      fabric: product.storefront.fabric,
      fit: product.storefront.fit,
      sleeve: product.storefront.sleeve,
      occasion: product.storefront.occasion,
      shippingNote: product.storefront.shippingNote,
    } : createDefaultStorefront(),
    tags: product.tags.map((tag) => ({ name: tag.name })),
    reviews: product.reviews.map((review) => ({ userId: review.userId, rating: review.rating, review: review.review, reviewDate: review.reviewDate.slice(0, 16) })),
  }
}

export function ProductFormPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const isEditMode = Boolean(productId)
  const [values, setValues] = useState<ProductFormValues>(createDefaultValues())
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(createFieldErrors())
  const [brands, setBrands] = useState<CommonModuleItem[]>([])
  const [categories, setCategories] = useState<CommonModuleItem[]>([])
  const [productGroups, setProductGroups] = useState<CommonModuleItem[]>([])
  const [productTypes, setProductTypes] = useState<CommonModuleItem[]>([])
  const [units, setUnits] = useState<CommonModuleItem[]>([])
  const [hsnCodes, setHsnCodes] = useState<CommonModuleItem[]>([])
  const [taxes, setTaxes] = useState<CommonModuleItem[]>([])
  const [styles, setStyles] = useState<CommonModuleItem[]>([])
  const [warehouses, setWarehouses] = useState<CommonModuleItem[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadLookups() {
      const [brandItems, categoryItems, productGroupItems, productTypeItems, unitItems, hsnItems, taxItems, styleItems, warehouseItems] = await Promise.all([
        listCommonModuleItems('brands', false),
        listCommonModuleItems('productCategories', false),
        listCommonModuleItems('productGroups', false),
        listCommonModuleItems('productTypes', false),
        listCommonModuleItems('units', false),
        listCommonModuleItems('hsnCodes', false),
        listCommonModuleItems('taxes', false),
        listCommonModuleItems('styles', false),
        listCommonModuleItems('warehouses', false),
      ])

      if (!cancelled) {
        setBrands(brandItems)
        setCategories(categoryItems)
        setProductGroups(productGroupItems)
        setProductTypes(productTypeItems)
        setUnits(unitItems)
        setHsnCodes(hsnItems)
        setTaxes(taxItems)
        setStyles(styleItems)
        setWarehouses(warehouseItems)
      }
    }

    void loadLookups()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      if (!productId) {
        return
      }

      setLoading(true)
      setErrorMessage(null)

      try {
        const product = await getProduct(productId)
        if (!cancelled) {
          setValues(toFormValues(product))
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(toErrorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProduct()
    return () => { cancelled = true }
  }, [productId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextFieldErrors = validateProduct(values)
    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) {
      setErrorMessage('Validation failed.')
      showValidationToast('product')
      return
    }
    setSaving(true)
    setErrorMessage(null)

    try {
      const savedProduct = productId
        ? await updateProduct(productId, values)
        : await createProduct(values)

      showSavedToast({
        entityLabel: 'product',
        recordName: savedProduct.name,
        referenceId: savedProduct.id,
        mode: productId ? 'update' : 'create',
      })

      void navigate('/dashboard/products')
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showFailedActionToast({
        entityLabel: 'product',
        action: productId ? 'update' : 'save',
        detail: message,
      })
    } finally {
      setSaving(false)
    }
  }

  const overviewTab: AnimatedContentTab = {
    label: 'Overview',
    value: 'overview',
    content: (
      <>
        <Section className="rounded-md" contentClassName="grid gap-4 pt-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid min-h-[4.75rem] gap-2"><Label className={fieldErrors.name ? 'text-destructive' : undefined}>Name</Label><Input className={inputErrorClassName(Boolean(fieldErrors.name))} value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} /><FieldError message={fieldErrors.name} /></div>
            <div className="grid gap-2"><Label>Slug</Label><Input value={values.slug} onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))} /></div>
            <div className="grid gap-2"><Label>SKU</Label><Input value={values.sku} onChange={(event) => setValues((current) => ({ ...current, sku: event.target.value }))} /></div>
            <LookupSelect label="Brand" value={values.brandId} options={brands} moduleKey="brands" onItemsChange={setBrands} onChange={(value) => setValues((current) => ({ ...current, brandId: value ?? '1' }))} />
            <LookupSelect label="Category" value={values.categoryId} options={categories} moduleKey="productCategories" onItemsChange={setCategories} onChange={(value) => setValues((current) => ({ ...current, categoryId: value ?? '1' }))} />
            <LookupSelect label="Product Group" value={values.productGroupId} options={productGroups} moduleKey="productGroups" onItemsChange={setProductGroups} onChange={(value) => setValues((current) => ({ ...current, productGroupId: value ?? '1' }))} />
            <LookupSelect label="Product Type" value={values.productTypeId} options={productTypes} moduleKey="productTypes" onItemsChange={setProductTypes} onChange={(value) => setValues((current) => ({ ...current, productTypeId: value ?? '1' }))} />
            <LookupSelect label="Unit" value={values.unitId} options={units} moduleKey="units" onItemsChange={setUnits} onChange={(value) => setValues((current) => ({ ...current, unitId: value ?? '1' }))} />
            <LookupSelect label="HSN Code" value={values.hsnCodeId} options={hsnCodes} moduleKey="hsnCodes" onItemsChange={setHsnCodes} onChange={(value) => setValues((current) => ({ ...current, hsnCodeId: value ?? '1' }))} />
            <LookupSelect label="Tax" value={values.taxId} options={taxes} moduleKey="taxes" onItemsChange={setTaxes} onChange={(value) => setValues((current) => ({ ...current, taxId: value ?? '1' }))} />
            <LookupSelect label="Style" value={values.styleId} options={styles} moduleKey="styles" onItemsChange={setStyles} onChange={(value) => setValues((current) => ({ ...current, styleId: value ?? '1' }))} />
            <div className="grid gap-2"><Label>Base Price</Label><Input type="number" step="0.01" value={values.basePrice} onChange={(event) => setValues((current) => ({ ...current, basePrice: Number(event.target.value || 0) }))} /></div>
            <div className="grid gap-2"><Label>Cost Price</Label><Input type="number" step="0.01" value={values.costPrice} onChange={(event) => setValues((current) => ({ ...current, costPrice: Number(event.target.value || 0) }))} /></div>
            <div className="grid gap-2 md:col-span-2"><Label>Short Description</Label><Input value={values.shortDescription} onChange={(event) => setValues((current) => ({ ...current, shortDescription: event.target.value }))} /></div>
            <div className="grid gap-2 md:col-span-2"><Label>Description</Label><Textarea rows={4} value={values.description} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} /></div>
            <label className="flex items-center gap-3"><Checkbox checked={values.hasVariants} onCheckedChange={(checked) => setValues((current) => ({ ...current, hasVariants: Boolean(checked) }))} /><span className="text-sm font-medium">Has variants</span></label>
            <label className="flex items-center gap-3"><Checkbox checked={values.isFeatured} onCheckedChange={(checked) => setValues((current) => ({ ...current, isFeatured: Boolean(checked) }))} /><span className="text-sm font-medium">Featured product</span></label>
            <label className="flex items-center gap-3 md:col-span-2"><Checkbox checked={values.isActive} onCheckedChange={(checked) => setValues((current) => ({ ...current, isActive: Boolean(checked) }))} /><span className="text-sm font-medium">Active product</span></label>
          </div>
        </Section>
        <Section title="Images" description="Product gallery and merchandising visuals." addLabel="Add Image" onAdd={() => setValues((current) => ({ ...current, images: [...current.images, emptyImage()] }))}>
          {values.images.map((image, index) => (
            <Row key={`image-${index}`} onRemove={() => setValues((current) => ({ ...current, images: current.images.filter((_, rowIndex) => rowIndex !== index) }))}>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <MediaImageField
                    label="Image"
                    value={image.imageUrl}
                    onChange={(value) => setValues((current) => ({
                      ...current,
                      images: current.images.map((entry, rowIndex) => rowIndex === index ? { ...entry, imageUrl: value } : entry),
                    }))}
                    description="Choose a public media asset or upload a new catalog image."
                  />
                </div>
                <div className="grid gap-2"><Label>Sort Order</Label><Input type="number" value={image.sortOrder} onChange={(event) => setValues((current) => ({ ...current, images: current.images.map((entry, rowIndex) => rowIndex === index ? { ...entry, sortOrder: Number(event.target.value || 0) } : entry) }))} /></div>
                <label className="flex items-center gap-3 md:col-span-3"><Checkbox checked={image.isPrimary} onCheckedChange={(checked) => setValues((current) => ({ ...current, images: current.images.map((entry, rowIndex) => rowIndex === index ? { ...entry, isPrimary: Boolean(checked) } : entry) }))} /><span className="text-sm font-medium">Primary image</span></label>
              </div>
            </Row>
          ))}
        </Section>
      </>
    ),
  }

  const attributesTab: AnimatedContentTab = {
    label: 'Attributes',
    value: 'attributes',
    content: (
      <Section title="Attributes" description="Catalog attributes and available values for this product." addLabel="Add Attribute" onAdd={() => setValues((current) => ({ ...current, attributes: [...current.attributes, emptyAttribute()] }))}>
        {values.attributes.map((attribute, index) => (
          <Row key={attribute.clientKey} onRemove={() => setValues((current) => ({ ...current, attributes: current.attributes.filter((entry) => entry.clientKey !== attribute.clientKey), attributeValues: current.attributeValues.filter((entry) => entry.attributeClientKey !== attribute.clientKey) }))}>
            <div className="grid gap-4">
              <div className="grid gap-2"><Label>Attribute Name</Label><Input value={attribute.name} onChange={(event) => setValues((current) => ({ ...current, attributes: current.attributes.map((entry, rowIndex) => rowIndex === index ? { ...entry, name: event.target.value } : entry) }))} /></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Attribute Values</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setValues((current) => ({ ...current, attributeValues: [...current.attributeValues, emptyAttributeValue(attribute.clientKey)] }))}>
                    <Plus className="size-4" />
                    Add Value
                  </Button>
                </div>
                {values.attributeValues.filter((entry) => entry.attributeClientKey === attribute.clientKey).map((value) => (
                  <div key={value.clientKey} className="flex gap-3">
                    <Input value={value.value} onChange={(event) => setValues((current) => ({ ...current, attributeValues: current.attributeValues.map((entry) => entry.clientKey === value.clientKey ? { ...entry, value: event.target.value } : entry) }))} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setValues((current) => ({ ...current, attributeValues: current.attributeValues.filter((entry) => entry.clientKey !== value.clientKey) }))}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Row>
        ))}
      </Section>
    ),
  }

  const variantsTab: AnimatedContentTab = {
    label: 'Variants',
    value: 'variants',
    content: (
      <Section title="Variants" description="Sellable variant rows, their media, and attribute labels." addLabel="Add Variant" onAdd={() => setValues((current) => ({ ...current, variants: [...current.variants, emptyVariant()] }))}>
        {values.variants.map((variant, index) => (
          <Row key={variant.clientKey} onRemove={() => setValues((current) => ({ ...current, variants: current.variants.filter((entry) => entry.clientKey !== variant.clientKey), prices: current.prices.map((entry) => entry.variantClientKey === variant.clientKey ? { ...entry, variantClientKey: null } : entry), discounts: current.discounts.map((entry) => entry.variantClientKey === variant.clientKey ? { ...entry, variantClientKey: null } : entry), stockItems: current.stockItems.map((entry) => entry.variantClientKey === variant.clientKey ? { ...entry, variantClientKey: null } : entry), stockMovements: current.stockMovements.map((entry) => entry.variantClientKey === variant.clientKey ? { ...entry, variantClientKey: null } : entry) }))}>
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2"><Label>Variant Name</Label><Input value={variant.variantName} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, variantName: event.target.value } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Variant SKU</Label><Input value={variant.sku} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, sku: event.target.value } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Barcode</Label><Input value={variant.barcode ?? ''} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, barcode: event.target.value || null } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Price</Label><Input type="number" step="0.01" value={variant.price} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, price: Number(event.target.value || 0) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Cost Price</Label><Input type="number" step="0.01" value={variant.costPrice} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, costPrice: Number(event.target.value || 0) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Weight</Label><Input type="number" step="0.01" value={variant.weight ?? ''} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, weight: event.target.value ? Number(event.target.value) : null } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Stock Quantity</Label><Input type="number" step="0.01" value={variant.stockQuantity} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, stockQuantity: Number(event.target.value || 0) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Opening Stock</Label><Input type="number" step="0.01" value={variant.openingStock} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, openingStock: Number(event.target.value || 0) } : entry) }))} /></div>
                <label className="flex items-center gap-3 pt-8"><Checkbox checked={variant.isActive} onCheckedChange={(checked) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, isActive: Boolean(checked) } : entry) }))} /><span className="text-sm font-medium">Active variant</span></label>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Variant Attributes</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, attributes: [...entry.attributes, emptyVariantAttribute()] } : entry) }))}>
                    <Plus className="size-4" />
                    Add Variant Attribute
                  </Button>
                </div>
                {variant.attributes.map((attribute, attributeIndex) => (
                  <div key={`${variant.clientKey}-attribute-${attributeIndex}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <Input placeholder="Attribute" value={attribute.attributeName} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, attributes: entry.attributes.map((attributeEntry, nestedIndex) => nestedIndex === attributeIndex ? { ...attributeEntry, attributeName: event.target.value } : attributeEntry) } : entry) }))} />
                    <Input placeholder="Value" value={attribute.attributeValue} onChange={(event) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, attributes: entry.attributes.map((attributeEntry, nestedIndex) => nestedIndex === attributeIndex ? { ...attributeEntry, attributeValue: event.target.value } : attributeEntry) } : entry) }))} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, attributes: entry.attributes.filter((_, nestedIndex) => nestedIndex !== attributeIndex) } : entry) }))}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Variant Images</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, images: [...entry.images, emptyVariantImage()] } : entry) }))}>
                    <Plus className="size-4" />
                    Add Variant Image
                  </Button>
                </div>
                {variant.images.map((image, imageIndex) => (
                  <div key={`${variant.clientKey}-image-${imageIndex}`} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                    <MediaImageField
                      label="Variant Image"
                      value={image.imageUrl}
                      onChange={(value) => setValues((current) => ({
                        ...current,
                        variants: current.variants.map((entry, rowIndex) => rowIndex === index ? {
                          ...entry,
                          images: entry.images.map((imageEntry, nestedIndex) => nestedIndex === imageIndex ? { ...imageEntry, imageUrl: value } : imageEntry),
                        } : entry),
                      }))}
                    />
                    <label className="flex items-center gap-3"><Checkbox checked={image.isPrimary} onCheckedChange={(checked) => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, images: entry.images.map((imageEntry, nestedIndex) => nestedIndex === imageIndex ? { ...imageEntry, isPrimary: Boolean(checked) } : imageEntry) } : entry) }))} /><span className="text-sm">Primary</span></label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setValues((current) => ({ ...current, variants: current.variants.map((entry, rowIndex) => rowIndex === index ? { ...entry, images: entry.images.filter((_, nestedIndex) => nestedIndex !== imageIndex) } : entry) }))}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Row>
        ))}
      </Section>
    ),
  }

  const commerceTab: AnimatedContentTab = {
    label: 'Commerce',
    value: 'commerce',
    content: (
      <>
        <Section title="Prices" description="List, sell, and cost price rows for product or variant scope." addLabel="Add Price" onAdd={() => setValues((current) => ({ ...current, prices: [...current.prices, emptyPrice()] }))}>
          {values.prices.map((price, index) => (
            <Row key={`price-${index}`} onRemove={() => setValues((current) => ({ ...current, prices: current.prices.filter((_, rowIndex) => rowIndex !== index) }))}>
              <div className="grid gap-4 md:grid-cols-4">
                <VariantSelect label="Variant Scope" value={price.variantClientKey} variants={values.variants} onChange={(value) => setValues((current) => ({ ...current, prices: current.prices.map((entry, rowIndex) => rowIndex === index ? { ...entry, variantClientKey: value } : entry) }))} />
                <div className="grid gap-2"><Label>MRP</Label><Input type="number" step="0.01" value={price.mrp} onChange={(event) => setValues((current) => ({ ...current, prices: current.prices.map((entry, rowIndex) => rowIndex === index ? { ...entry, mrp: Number(event.target.value || 0) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Selling Price</Label><Input type="number" step="0.01" value={price.sellingPrice} onChange={(event) => setValues((current) => ({ ...current, prices: current.prices.map((entry, rowIndex) => rowIndex === index ? { ...entry, sellingPrice: Number(event.target.value || 0) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Cost Price</Label><Input type="number" step="0.01" value={price.costPrice} onChange={(event) => setValues((current) => ({ ...current, prices: current.prices.map((entry, rowIndex) => rowIndex === index ? { ...entry, costPrice: Number(event.target.value || 0) } : entry) }))} /></div>
              </div>
            </Row>
          ))}
        </Section>
        <Section title="Discounts" description="Discount windows by product or variant scope." addLabel="Add Discount" onAdd={() => setValues((current) => ({ ...current, discounts: [...current.discounts, emptyDiscount()] }))}>
          {values.discounts.map((discount, index) => (
            <Row key={`discount-${index}`} onRemove={() => setValues((current) => ({ ...current, discounts: current.discounts.filter((_, rowIndex) => rowIndex !== index) }))}>
              <div className="grid gap-4 md:grid-cols-4">
                <VariantSelect label="Variant Scope" value={discount.variantClientKey} variants={values.variants} onChange={(value) => setValues((current) => ({ ...current, discounts: current.discounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, variantClientKey: value } : entry) }))} />
                <div className="grid gap-2"><Label>Discount Type</Label><Input value={discount.discountType} onChange={(event) => setValues((current) => ({ ...current, discounts: current.discounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, discountType: event.target.value } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Discount Value</Label><Input type="number" step="0.01" value={discount.discountValue} onChange={(event) => setValues((current) => ({ ...current, discounts: current.discounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, discountValue: Number(event.target.value || 0) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Start Date</Label><Input type="date" value={discount.startDate ?? ''} onChange={(event) => setValues((current) => ({ ...current, discounts: current.discounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, startDate: event.target.value || null } : entry) }))} /></div>
                <div className="grid gap-2"><Label>End Date</Label><Input type="date" value={discount.endDate ?? ''} onChange={(event) => setValues((current) => ({ ...current, discounts: current.discounts.map((entry, rowIndex) => rowIndex === index ? { ...entry, endDate: event.target.value || null } : entry) }))} /></div>
              </div>
            </Row>
          ))}
        </Section>
      </>
    ),
  }

  const inventoryTab: AnimatedContentTab = {
    label: 'Inventory',
    value: 'inventory',
    content: (
      <>
        <Section title="Inventory" description="Warehouse-level stock and stock movement records." addLabel="Add Stock Item" onAdd={() => setValues((current) => ({ ...current, stockItems: [...current.stockItems, emptyStockItem()] }))}>
          {values.stockItems.map((item, index) => (
            <Row key={`stock-item-${index}`} onRemove={() => setValues((current) => ({ ...current, stockItems: current.stockItems.filter((_, rowIndex) => rowIndex !== index) }))}>
              <div className="grid gap-4 md:grid-cols-4">
                <VariantSelect label="Variant Scope" value={item.variantClientKey} variants={values.variants} onChange={(value) => setValues((current) => ({ ...current, stockItems: current.stockItems.map((entry, rowIndex) => rowIndex === index ? { ...entry, variantClientKey: value } : entry) }))} />
                <LookupSelect label="Warehouse" value={item.warehouseId} options={warehouses} moduleKey="warehouses" onItemsChange={setWarehouses} placeholder="Select warehouse" onChange={(value) => setValues((current) => ({ ...current, stockItems: current.stockItems.map((entry, rowIndex) => rowIndex === index ? { ...entry, warehouseId: value ?? '' } : entry) }))} />
                <div className="grid gap-2"><Label>Quantity</Label><Input type="number" step="0.01" value={item.quantity} onChange={(event) => setValues((current) => ({ ...current, stockItems: current.stockItems.map((entry, rowIndex) => rowIndex === index ? { ...entry, quantity: Number(event.target.value || 0) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Reserved Quantity</Label><Input type="number" step="0.01" value={item.reservedQuantity} onChange={(event) => setValues((current) => ({ ...current, stockItems: current.stockItems.map((entry, rowIndex) => rowIndex === index ? { ...entry, reservedQuantity: Number(event.target.value || 0) } : entry) }))} /></div>
              </div>
            </Row>
          ))}
        </Section>
        <Section title="Stock Movements" description="Editable movement history records for this master setup increment." addLabel="Add Movement" onAdd={() => setValues((current) => ({ ...current, stockMovements: [...current.stockMovements, emptyStockMovement()] }))}>
          {values.stockMovements.map((movement, index) => (
            <Row key={`movement-${index}`} onRemove={() => setValues((current) => ({ ...current, stockMovements: current.stockMovements.filter((_, rowIndex) => rowIndex !== index) }))}>
              <div className="grid gap-4 md:grid-cols-4">
                <VariantSelect label="Variant Scope" value={movement.variantClientKey} variants={values.variants} onChange={(value) => setValues((current) => ({ ...current, stockMovements: current.stockMovements.map((entry, rowIndex) => rowIndex === index ? { ...entry, variantClientKey: value } : entry) }))} />
                <LookupSelect label="Warehouse" value={movement.warehouseId} options={warehouses} moduleKey="warehouses" onItemsChange={setWarehouses} onChange={(value) => setValues((current) => ({ ...current, stockMovements: current.stockMovements.map((entry, rowIndex) => rowIndex === index ? { ...entry, warehouseId: value } : entry) }))} />
                <div className="grid gap-2"><Label>Movement Type</Label><Input value={movement.movementType} onChange={(event) => setValues((current) => ({ ...current, stockMovements: current.stockMovements.map((entry, rowIndex) => rowIndex === index ? { ...entry, movementType: event.target.value } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Quantity</Label><Input type="number" step="0.01" value={movement.quantity} onChange={(event) => setValues((current) => ({ ...current, stockMovements: current.stockMovements.map((entry, rowIndex) => rowIndex === index ? { ...entry, quantity: Number(event.target.value || 0) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Reference Type</Label><Input value={movement.referenceType ?? ''} onChange={(event) => setValues((current) => ({ ...current, stockMovements: current.stockMovements.map((entry, rowIndex) => rowIndex === index ? { ...entry, referenceType: event.target.value || null } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Reference ID</Label><Input value={movement.referenceId ?? ''} onChange={(event) => setValues((current) => ({ ...current, stockMovements: current.stockMovements.map((entry, rowIndex) => rowIndex === index ? { ...entry, referenceId: event.target.value || null } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Movement Time</Label><Input type="datetime-local" value={movement.movementAt ?? ''} onChange={(event) => setValues((current) => ({ ...current, stockMovements: current.stockMovements.map((entry, rowIndex) => rowIndex === index ? { ...entry, movementAt: event.target.value || null } : entry) }))} /></div>
              </div>
            </Row>
          ))}
        </Section>
      </>
    ),
  }

  const publishingTab: AnimatedContentTab = {
    label: 'Publishing',
    value: 'publishing',
    content: (
      <>
        <Section title="Storefront Publishing" description="Backend merchandising, home placements, and storefront filter metadata.">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Department</Label>
              <select
                value={values.storefront?.department ?? 'women'}
                onChange={(event) => setValues((current) => ({
                  ...current,
                  storefront: {
                    ...(current.storefront ?? createDefaultStorefront()),
                    department: event.target.value as NonNullable<ProductFormValues['storefront']>['department'],
                  },
                }))}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {storefrontDepartmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Catalog Badge</Label>
              <Input value={values.storefront?.catalogBadge ?? ''} onChange={(event) => setValues((current) => ({
                ...current,
                storefront: { ...(current.storefront ?? createDefaultStorefront()), catalogBadge: event.target.value || null },
              }))} />
            </div>
            <div className="grid gap-2">
              <Label>Shipping Note</Label>
              <Input value={values.storefront?.shippingNote ?? ''} onChange={(event) => setValues((current) => ({
                ...current,
                storefront: { ...(current.storefront ?? createDefaultStorefront()), shippingNote: event.target.value || null },
              }))} />
            </div>
            <div className="grid gap-2">
              <Label>Fabric</Label>
              <Input value={values.storefront?.fabric ?? ''} onChange={(event) => setValues((current) => ({
                ...current,
                storefront: { ...(current.storefront ?? createDefaultStorefront()), fabric: event.target.value || null },
              }))} />
            </div>
            <div className="grid gap-2">
              <Label>Fit</Label>
              <Input value={values.storefront?.fit ?? ''} onChange={(event) => setValues((current) => ({
                ...current,
                storefront: { ...(current.storefront ?? createDefaultStorefront()), fit: event.target.value || null },
              }))} />
            </div>
            <div className="grid gap-2">
              <Label>Sleeve</Label>
              <Input value={values.storefront?.sleeve ?? ''} onChange={(event) => setValues((current) => ({
                ...current,
                storefront: { ...(current.storefront ?? createDefaultStorefront()), sleeve: event.target.value || null },
              }))} />
            </div>
            <div className="grid gap-2">
              <Label>Occasion</Label>
              <Input value={values.storefront?.occasion ?? ''} onChange={(event) => setValues((current) => ({
                ...current,
                storefront: { ...(current.storefront ?? createDefaultStorefront()), occasion: event.target.value || null },
              }))} />
            </div>
            <div className="grid gap-2">
              <Label>Home Slider Order</Label>
              <Input type="number" value={values.storefront?.homeSliderOrder ?? 0} onChange={(event) => setValues((current) => ({
                ...current,
                storefront: { ...(current.storefront ?? createDefaultStorefront()), homeSliderOrder: Number(event.target.value || 0) },
              }))} />
            </div>
            <div className="grid gap-2">
              <Label>Promo Slider Order</Label>
              <Input type="number" value={values.storefront?.promoSliderOrder ?? 0} onChange={(event) => setValues((current) => ({
                ...current,
                storefront: { ...(current.storefront ?? createDefaultStorefront()), promoSliderOrder: Number(event.target.value || 0) },
              }))} />
            </div>
            <div className="grid gap-2">
              <Label>Feature Section Order</Label>
              <Input type="number" value={values.storefront?.featureSectionOrder ?? 0} onChange={(event) => setValues((current) => ({
                ...current,
                storefront: { ...(current.storefront ?? createDefaultStorefront()), featureSectionOrder: Number(event.target.value || 0) },
              }))} />
            </div>
            <label className="flex items-center gap-3"><Checkbox checked={values.storefront?.homeSliderEnabled ?? false} onCheckedChange={(checked) => setValues((current) => ({
              ...current,
              storefront: { ...(current.storefront ?? createDefaultStorefront()), homeSliderEnabled: Boolean(checked) },
            }))} /><span className="text-sm font-medium">Home slider</span></label>
            <label className="flex items-center gap-3"><Checkbox checked={values.storefront?.promoSliderEnabled ?? false} onCheckedChange={(checked) => setValues((current) => ({
              ...current,
              storefront: { ...(current.storefront ?? createDefaultStorefront()), promoSliderEnabled: Boolean(checked) },
            }))} /><span className="text-sm font-medium">Promo slider</span></label>
            <label className="flex items-center gap-3"><Checkbox checked={values.storefront?.featureSectionEnabled ?? false} onCheckedChange={(checked) => setValues((current) => ({
              ...current,
              storefront: { ...(current.storefront ?? createDefaultStorefront()), featureSectionEnabled: Boolean(checked) },
            }))} /><span className="text-sm font-medium">Feature section</span></label>
            <label className="flex items-center gap-3"><Checkbox checked={values.storefront?.isNewArrival ?? false} onCheckedChange={(checked) => setValues((current) => ({
              ...current,
              storefront: { ...(current.storefront ?? createDefaultStorefront()), isNewArrival: Boolean(checked) },
            }))} /><span className="text-sm font-medium">New arrival</span></label>
            <label className="flex items-center gap-3"><Checkbox checked={values.storefront?.isBestSeller ?? false} onCheckedChange={(checked) => setValues((current) => ({
              ...current,
              storefront: { ...(current.storefront ?? createDefaultStorefront()), isBestSeller: Boolean(checked) },
            }))} /><span className="text-sm font-medium">Best seller</span></label>
            <label className="flex items-center gap-3"><Checkbox checked={values.storefront?.isFeaturedLabel ?? false} onCheckedChange={(checked) => setValues((current) => ({
              ...current,
              storefront: { ...(current.storefront ?? createDefaultStorefront()), isFeaturedLabel: Boolean(checked) },
            }))} /><span className="text-sm font-medium">Featured label</span></label>
          </div>
        </Section>
        <Section title="Offers" description="Promotional offers attached to the product." addLabel="Add Offer" onAdd={() => setValues((current) => ({ ...current, offers: [...current.offers, emptyOffer()] }))}>
          {values.offers.map((offer, index) => (
            <Row key={`offer-${index}`} onRemove={() => setValues((current) => ({ ...current, offers: current.offers.filter((_, rowIndex) => rowIndex !== index) }))}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2"><Label>Title</Label><Input value={offer.title} onChange={(event) => setValues((current) => ({ ...current, offers: current.offers.map((entry, rowIndex) => rowIndex === index ? { ...entry, title: event.target.value } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Offer Price</Label><Input type="number" step="0.01" value={offer.offerPrice} onChange={(event) => setValues((current) => ({ ...current, offers: current.offers.map((entry, rowIndex) => rowIndex === index ? { ...entry, offerPrice: Number(event.target.value || 0) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Start Date</Label><Input type="date" value={offer.startDate ?? ''} onChange={(event) => setValues((current) => ({ ...current, offers: current.offers.map((entry, rowIndex) => rowIndex === index ? { ...entry, startDate: event.target.value || null } : entry) }))} /></div>
                <div className="grid gap-2"><Label>End Date</Label><Input type="date" value={offer.endDate ?? ''} onChange={(event) => setValues((current) => ({ ...current, offers: current.offers.map((entry, rowIndex) => rowIndex === index ? { ...entry, endDate: event.target.value || null } : entry) }))} /></div>
                <div className="grid gap-2 md:col-span-2"><Label>Description</Label><Textarea rows={3} value={offer.description ?? ''} onChange={(event) => setValues((current) => ({ ...current, offers: current.offers.map((entry, rowIndex) => rowIndex === index ? { ...entry, description: event.target.value || null } : entry) }))} /></div>
              </div>
            </Row>
          ))}
        </Section>
        <Section title="SEO and Tags" description="Search metadata and tag assignments for discoverability." addLabel="Add Tag" onAdd={() => setValues((current) => ({ ...current, tags: [...current.tags, emptyTag()] }))}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2"><Label>Meta Title</Label><Input value={values.seo?.metaTitle ?? ''} onChange={(event) => setValues((current) => ({ ...current, seo: { metaTitle: event.target.value || null, metaDescription: current.seo?.metaDescription ?? null, metaKeywords: current.seo?.metaKeywords ?? null } }))} /></div>
            <div className="grid gap-2"><Label>Meta Keywords</Label><Input value={values.seo?.metaKeywords ?? ''} onChange={(event) => setValues((current) => ({ ...current, seo: { metaTitle: current.seo?.metaTitle ?? null, metaDescription: current.seo?.metaDescription ?? null, metaKeywords: event.target.value || null } }))} /></div>
            <div className="grid gap-2 md:col-span-2"><Label>Meta Description</Label><Textarea rows={3} value={values.seo?.metaDescription ?? ''} onChange={(event) => setValues((current) => ({ ...current, seo: { metaTitle: current.seo?.metaTitle ?? null, metaDescription: event.target.value || null, metaKeywords: current.seo?.metaKeywords ?? null } }))} /></div>
          </div>
          {values.tags.map((tag, index) => (
            <Row key={`tag-${index}`} onRemove={() => setValues((current) => ({ ...current, tags: current.tags.filter((_, rowIndex) => rowIndex !== index) }))}>
              <div className="grid gap-2"><Label>Tag</Label><Input value={tag.name} onChange={(event) => setValues((current) => ({ ...current, tags: current.tags.map((entry, rowIndex) => rowIndex === index ? { ...entry, name: event.target.value } : entry) }))} /></div>
            </Row>
          ))}
        </Section>
        <Section title="Reviews" description="Seed or maintain review records stored against this product." addLabel="Add Review" onAdd={() => setValues((current) => ({ ...current, reviews: [...current.reviews, emptyReview()] }))}>
          {values.reviews.map((review, index) => (
            <Row key={`review-${index}`} onRemove={() => setValues((current) => ({ ...current, reviews: current.reviews.filter((_, rowIndex) => rowIndex !== index) }))}>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2"><Label>User ID</Label><Input value={review.userId ?? ''} onChange={(event) => setValues((current) => ({ ...current, reviews: current.reviews.map((entry, rowIndex) => rowIndex === index ? { ...entry, userId: event.target.value || null } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Rating</Label><Input type="number" min="1" max="5" value={review.rating} onChange={(event) => setValues((current) => ({ ...current, reviews: current.reviews.map((entry, rowIndex) => rowIndex === index ? { ...entry, rating: Number(event.target.value || 5) } : entry) }))} /></div>
                <div className="grid gap-2"><Label>Review Time</Label><Input type="datetime-local" value={review.reviewDate ?? ''} onChange={(event) => setValues((current) => ({ ...current, reviews: current.reviews.map((entry, rowIndex) => rowIndex === index ? { ...entry, reviewDate: event.target.value || null } : entry) }))} /></div>
                <div className="grid gap-2 md:col-span-3"><Label>Review</Label><Textarea rows={3} value={review.review ?? ''} onChange={(event) => setValues((current) => ({ ...current, reviews: current.reviews.map((entry, rowIndex) => rowIndex === index ? { ...entry, review: event.target.value || null } : entry) }))} /></div>
              </div>
            </Row>
          ))}
        </Section>
      </>
    ),
  }

  const productTabs = [overviewTab, attributesTab, variantsTab, commerceTab, inventoryTab, publishingTab]

  if (loading) {
    return <Card><CardContent className="p-8 text-sm text-muted-foreground">Loading product...</CardContent></Card>
  }

  return (
    <form className="space-y-6 pt-2" onSubmit={(event) => { void handleSubmit(event) }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link to="/dashboard/products">
              <ArrowLeft className="size-4" />
              Back to products
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">Capture product identity, variants, pricing, stock, SEO, and catalog presentation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => { void navigate('/dashboard/products') }}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</Button>
        </div>
      </div>

      {errorMessage ? (
        <Card className={`${warningCardClassName} rounded-md`}>
          <CardContent className="rounded-md p-4 text-sm">
            <p className="font-medium">{errorMessage}</p>
            {Object.keys(fieldErrors).length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {summarizeFieldErrors(fieldErrors).map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <AnimatedTabs defaultTabValue="overview" tabs={productTabs} />




    </form>
  )
}
