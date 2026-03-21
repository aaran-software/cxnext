import { cn } from '@/lib/utils'

type LookupOption = {
  value: string
  label: string
}

type AutocompleteLookupProps = {
  value: string
  onChange: (value: string) => void
  options: LookupOption[]
  placeholder?: string
  required?: boolean
  allowEmptyOption?: boolean
  emptyOptionLabel?: string
  onOptionsChange?: (options: LookupOption[]) => void
  onErrorChange?: (message: string) => void
  createOption?: (label: string) => Promise<LookupOption>
}

export function AutocompleteLookup({
  value,
  onChange,
  options,
  placeholder,
  allowEmptyOption,
  emptyOptionLabel = 'Select',
  onOptionsChange: _onOptionsChange,
  onErrorChange,
}: AutocompleteLookupProps) {
  const resolvedValue = value || (allowEmptyOption ? '__empty__' : '')

  return (
    <select
      value={resolvedValue}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
      )}
      onChange={(event) => {
        const nextValue = event.target.value
        onErrorChange?.('')
        onChange(nextValue === '__empty__' ? '' : nextValue)
      }}
    >
      {allowEmptyOption ? (
        <option value="__empty__">{emptyOptionLabel}</option>
      ) : (
        <option value="" disabled>
          {placeholder ?? 'Select option'}
        </option>
      )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
    </select>
  )
}
