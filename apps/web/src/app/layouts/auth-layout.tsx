import { Link, Outlet } from 'react-router-dom'
import { BrandMark } from '@/shared/branding/brand-mark'

export function AuthLayout() {
  return (
    <div className="page-frame min-h-screen px-4 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center">
        <div className="mb-8 flex justify-center">
          <Link to="/" className="inline-flex">
            <BrandMark className="flex-col items-center gap-4 text-center" />
          </Link>
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

