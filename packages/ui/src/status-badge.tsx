interface StatusBadgeProps {
  status: 'foundation' | 'planned' | 'active'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status}`}>{status}</span>
}
