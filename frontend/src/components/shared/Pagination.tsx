import { Button } from '@/components/ui/button'

type PaginationProps = {
  start: number
  count: number
  total: number
  onPrev: () => void
  onNext: () => void
}

export function Pagination({ start, count, total, onPrev, onNext }: PaginationProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {start + 1}–{start + count} of {total}
      </span>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" disabled={start === 0} onClick={onPrev}>
          Prev
        </Button>
        <Button size="sm" variant="outline" disabled={start + count >= total} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
