import { Link, Outlet } from 'react-router-dom'
import { BrandMark } from '@/components/branding/brand-mark'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'

export function AuthLayout() {
  return (
    <div className="page-frame min-h-screen px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/">
            <BrandMark />
          </Link>
          <ThemeSwitcher />
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
