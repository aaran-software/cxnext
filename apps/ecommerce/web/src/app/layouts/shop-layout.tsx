import MainLayout from "@/features/store/components/navigation/MainLayout"
import { StorefrontProvider } from "@/features/store/context/storefront-context"

export function ShopLayout() {
  return (
    <StorefrontProvider>
      <MainLayout />
    </StorefrontProvider>
  )
}

export default ShopLayout

