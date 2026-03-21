import { Orbit } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrandMarkProps {
  compact?: boolean
  className?: string
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
        <Orbit className="size-5" />
      </div>
      <div className={cn('leading-none', compact && 'hidden sm:block')}>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          CXNext
        </p>
        <p className="text-lg font-semibold text-foreground">Commerce OS</p>
      </div>
    </div>
  )
}
