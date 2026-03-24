import type { ProductSummary } from '@shared/index'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EditIcon, MoreHorizontalIcon, PowerIcon } from 'lucide-react'
import { CommonList } from '@/components/forms/CommonList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ActiveStatusBadge, StatusBadge } from '@/components/ui/status-badge'
import { deactivateProduct, HttpError, listProducts, restoreProduct } from '@/shared/api/client'
import { showFailedActionToast, showStatusChangeToast } from '@/shared/notifications/toast'

function toErrorMessage(error: unknown) {
  if (error instanceof HttpError) return error.message
  if (error instanceof Error) return error.message
  return 'Failed to load products.'
}

type PublishingFilterKey =
  | 'homeSliderEnabled'
  | 'promoSliderEnabled'
  | 'featureSectionEnabled'
  | 'isNewArrival'
  | 'isBestSeller'
  | 'isFeaturedLabel'

export function ProductListPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [publishingFilters, setPublishingFilters] = useState<Record<PublishingFilterKey, boolean>>({
    homeSliderEnabled: false,
    promoSliderEnabled: false,
    featureSectionEnabled: false,
    isNewArrival: false,
    isBestSeller: false,
    isFeaturedLabel: false,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setErrorMessage(null)
      try {
        const products = await listProducts()
        if (!cancelled) {
          setItems(products)
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

    void load()
    return () => { cancelled = true }
  }, [])

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()
    return items.filter((item) => {
      const matchesSearch = normalizedSearch.length === 0 || [
        item.name,
        item.slug,
        item.sku,
        item.shortDescription,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedSearch))

      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' && item.isActive)
        || (statusFilter === 'inactive' && !item.isActive)

      const matchesPublishing = Object.entries(publishingFilters).every(([key, enabled]) => {
        if (!enabled) {
          return true
        }

        return Boolean(item[key as PublishingFilterKey])
      })

      return matchesSearch && matchesStatus && matchesPublishing
    })
  }, [items, publishingFilters, searchValue, statusFilter])

  const publishingFilterLabels: Record<PublishingFilterKey, string> = {
    homeSliderEnabled: 'Home slider',
    promoSliderEnabled: 'Promo slider',
    featureSectionEnabled: 'Feature section',
    isNewArrival: 'New arrival',
    isBestSeller: 'Best seller',
    isFeaturedLabel: 'Featured label',
  }

  const activePublishingFilters = Object.entries(publishingFilters)
    .filter(([, enabled]) => enabled)
    .map(([key]) => ({
      key,
      label: 'Publishing',
      value: publishingFilterLabels[key as PublishingFilterKey],
    }))

  const totalRecords = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedItems = filteredItems.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize)

  async function handleToggleActive(item: ProductSummary) {
    setErrorMessage(null)

    try {
      if (item.isActive) await deactivateProduct(item.id)
      else await restoreProduct(item.id)

      setItems((current) => current.map((entry) => (
        entry.id === item.id ? { ...entry, isActive: !entry.isActive } : entry
      )))
      showStatusChangeToast({
        entityLabel: 'product',
        recordName: item.name,
        referenceId: item.id,
        action: item.isActive ? 'deactivate' : 'restore',
      })
    } catch (error) {
      const message = toErrorMessage(error)
      setErrorMessage(message)
      showFailedActionToast({
        entityLabel: 'product',
        action: item.isActive ? 'deactivate' : 'restore',
        detail: message,
      })
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage ? <Card><CardContent className="p-4 text-sm text-destructive">{errorMessage}</CardContent></Card> : null}

      <CommonList
        header={{
          pageTitle: 'Products',
          pageDescription: 'Manage product masters, variants, pricing, inventory references, SEO, and tags.',
          addLabel: 'New Product',
          onAddClick: () => {
            void navigate('/admin/dashboard/products/new')
          },
        }}
        search={{
          value: searchValue,
          onChange: (value) => {
            setSearchValue(value)
            setCurrentPage(1)
          },
          placeholder: 'Search products',
        }}
        filters={{
          buttonLabel: 'Product filters',
          options: [
            {
              key: 'all',
              label: 'All products',
              isActive: statusFilter === 'all',
              onSelect: () => {
                setStatusFilter('all')
                setCurrentPage(1)
              },
              onCheckedChange: () => {
                setStatusFilter('all')
                setCurrentPage(1)
              },
            },
            {
              key: 'active',
              label: 'Active only',
              isActive: statusFilter === 'active',
              onSelect: () => {
                setStatusFilter('active')
                setCurrentPage(1)
              },
              onCheckedChange: (checked) => {
                setStatusFilter(checked ? 'active' : 'all')
                setCurrentPage(1)
              },
            },
            {
              key: 'inactive',
              label: 'Inactive only',
              isActive: statusFilter === 'inactive',
              onSelect: () => {
                setStatusFilter('inactive')
                setCurrentPage(1)
              },
              onCheckedChange: (checked) => {
                setStatusFilter(checked ? 'inactive' : 'all')
                setCurrentPage(1)
              },
            },
            ...Object.entries(publishingFilterLabels).map(([key, label]) => ({
              key,
              label,
              isActive: publishingFilters[key as PublishingFilterKey],
              onSelect: () => {
                setPublishingFilters((current) => ({
                  ...current,
                  [key]: !current[key as PublishingFilterKey],
                }))
                setCurrentPage(1)
              },
              onCheckedChange: (checked: boolean) => {
                setPublishingFilters((current) => ({
                  ...current,
                  [key]: checked,
                }))
                setCurrentPage(1)
              },
            })),
          ],
          activeFilters: [
            ...(statusFilter === 'all' ? [] : [{ key: 'status', label: 'Status', value: statusFilter === 'active' ? 'Active' : 'Inactive' }]),
            ...activePublishingFilters,
          ],
          onRemoveFilter: (key) => {
            if (key === 'status') {
              setStatusFilter('all')
              return
            }

            if (key in publishingFilters) {
              setPublishingFilters((current) => ({
                ...current,
                [key]: false,
              }))
            }
          },
          onClearAllFilters: () => {
            setStatusFilter('all')
            setPublishingFilters({
              homeSliderEnabled: false,
              promoSliderEnabled: false,
              featureSectionEnabled: false,
              isNewArrival: false,
              isBestSeller: false,
              isFeaturedLabel: false,
            })
            setCurrentPage(1)
          },
        }}
        table={{
          columns: [
            { id: 'serial', header: 'Sl.No', cell: (item) => ((safeCurrentPage - 1) * pageSize) + paginatedItems.findIndex((entry) => entry.id === item.id) + 1, className: 'w-12 min-w-12 px-2 text-center', headerClassName: 'w-12 min-w-12 px-2 text-center', sticky: 'left' },
            {
              id: 'name',
              header: 'Product',
              sortable: true,
              accessor: (item) => item.name,
              cell: (item) => (
                <div>
                  <Link to={`/admin/dashboard/products/${item.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.shortDescription ?? item.slug}</p>
                </div>
              ),
            },
            {
              id: 'sku',
              header: 'SKU',
              sortable: true,
              accessor: (item) => item.sku,
              cell: (item) => <span>{item.sku}</span>,
            },
            {
              id: 'pricing',
              header: 'Pricing',
              accessor: (item) => item.basePrice,
              cell: (item) => (
                <div>
                  <p>{item.basePrice.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Cost {item.costPrice.toFixed(2)}</p>
                </div>
              ),
            },
            {
              id: 'variants',
              header: 'Variants',
              accessor: (item) => item.variantCount,
              cell: (item) => (
                <div>
                  <p>{item.variantCount}</p>
                  <p className="text-sm text-muted-foreground">{item.hasVariants ? 'Variant product' : 'Single SKU'}</p>
                </div>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (item) => item.isActive,
              cell: (item) => (
                <div className="flex items-center gap-2">
                  <ActiveStatusBadge isActive={item.isActive} />
                  {item.isFeatured ? <StatusBadge tone="featured">Featured</StatusBadge> : null}
                </div>
              ),
            },
            {
              id: 'publishing',
              header: 'Publishing',
              cell: (item) => (
                <div className="flex flex-wrap gap-1.5">
                  {item.homeSliderEnabled ? <StatusBadge tone="home">Home</StatusBadge> : null}
                  {item.promoSliderEnabled ? <StatusBadge tone="promo">Promo</StatusBadge> : null}
                  {item.featureSectionEnabled ? <StatusBadge tone="publishing">Feature</StatusBadge> : null}
                  {item.isNewArrival ? <StatusBadge tone="new">New</StatusBadge> : null}
                  {item.isBestSeller ? <StatusBadge tone="best">Best</StatusBadge> : null}
                  {item.isFeaturedLabel ? <StatusBadge tone="label">Label</StatusBadge> : null}
                  {!item.homeSliderEnabled && !item.promoSliderEnabled && !item.featureSectionEnabled && !item.isNewArrival && !item.isBestSeller && !item.isFeaturedLabel ? (
                    <span className="text-sm text-muted-foreground">Standard</span>
                  ) : null}
                </div>
              ),
            },
            {
              id: 'actions',
              header: 'Actions',
              className: 'w-12 min-w-12 px-2 text-center',
              headerClassName: 'w-12 min-w-12 px-2 text-center',
              sticky: 'right',
              cell: (item) => (
                <div className="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" size="icon-sm" variant="ghost">
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/dashboard/products/${item.id}/edit`}>
                          <EditIcon className="size-4" />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void handleToggleActive(item)}>
                        <PowerIcon className="size-4" />
                        <span>{item.isActive ? 'Deactivate' : 'Restore'}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            },
          ],
          data: paginatedItems,
          loading,
          loadingMessage: 'Loading products...',
          emptyMessage: errorMessage ?? 'No products found.',
          rowKey: (item) => item.id,
        }}
        footer={{
          content: (
            <div className="flex flex-wrap items-center gap-4">
              <span>Total records: <span className="font-medium text-foreground">{totalRecords}</span></span>
              <span>Active records: <span className="font-medium text-foreground">{filteredItems.filter((item) => item.isActive).length}</span></span>
              <span>Featured records: <span className="font-medium text-foreground">{filteredItems.filter((item) => item.isFeatured).length}</span></span>
              <span>Published records: <span className="font-medium text-foreground">{filteredItems.filter((item) => item.homeSliderEnabled || item.promoSliderEnabled || item.featureSectionEnabled || item.isNewArrival || item.isBestSeller || item.isFeaturedLabel).length}</span></span>
            </div>
          ),
        }}
        pagination={{
          currentPage: safeCurrentPage,
          pageSize,
          totalRecords,
          onPageChange: setCurrentPage,
          onPageSizeChange: (value) => {
            setPageSize(value)
            setCurrentPage(1)
          },
        }}
      />
    </div>
  )
}

