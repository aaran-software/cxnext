import { Orbit } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useBranding } from './branding-provider'

interface BrandMarkProps {
  compact?: boolean
  className?: string
}

interface BrandGlyphProps {
  className?: string
  iconClassName?: string
  shadowless?: boolean
}

export function BrandGlyph({ className, iconClassName, shadowless = false }: BrandGlyphProps) {
  const branding = useBranding()
  const [lightLogoFailed, setLightLogoFailed] = useState(false)
  const [darkLogoFailed, setDarkLogoFailed] = useState(false)

  useEffect(() => {
    setLightLogoFailed(false)
    setDarkLogoFailed(false)
  }, [branding.logoUrl, branding.logoDarkUrl])

  const showImageLogo = !lightLogoFailed || !darkLogoFailed

  return (
    <div
      className={cn(
        'flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground',
        !shadowless && 'shadow-lg shadow-primary/20',
        className,
      )}
    >
      {showImageLogo ? (
        <>
          {!lightLogoFailed ? (
            <img
              src={branding.logoUrl}
              alt={branding.brandName}
              className="block h-full w-full object-contain p-1 dark:hidden"
              loading="eager"
              decoding="async"
              onError={() => setLightLogoFailed(true)}
            />
          ) : null}
          {!darkLogoFailed ? (
            <img
              src={branding.logoDarkUrl}
              alt={branding.brandName}
              className="hidden h-full w-full object-contain p-1 dark:block"
              loading="eager"
              decoding="async"
              onError={() => setDarkLogoFailed(true)}
            />
          ) : null}
        </>
      ) : (
        <Orbit className={cn('size-5', iconClassName)} />
      )}
    </div>
  )
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  const branding = useBranding()

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <BrandGlyph />
      <div className={cn('leading-none', compact && 'hidden sm:block')}>
        <p className="text-xl font-semibold uppercase tracking-[0.22em] text-foreground sm:text-2xl">
          {branding.brandName}
        </p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{branding.tagline}</p>
      </div>
    </div>
  )
}
