import { Orbit } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrandMarkProps {
  compact?: boolean
  className?: string
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <Orbit className="size-5" />
      </div>
      <div className={cn('leading-none', compact && 'hidden sm:block')}>
        <p className="text-xl font-semibold uppercase tracking-[0.22em] text-foreground sm:text-2xl">
          CODEXSUN
        </p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">Software Made Simple</p>
      </div>
    </div>
  )
}
