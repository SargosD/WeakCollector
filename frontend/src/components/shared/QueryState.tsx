import { AlertCircleIcon, InboxIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from 'cn'
import { Spinner } from '@/components/ui/spinner'

type QueryStateProps = {
  result: { data?: unknown; error?: unknown; fetching: boolean }
  isEmpty?: boolean
  messages: { error: string; loading: string; empty?: string }
  className?: string
  children: ReactNode
}

export function QueryState({
  result,
  isEmpty = false,
  messages,
  className,
  children,
}: QueryStateProps) {
  if (result.error) {
    return (
      <StateBox role="alert" className={cn('text-destructive', className)}>
        <AlertCircleIcon aria-hidden="true" className="size-5" />
        <span>{messages.error}</span>
      </StateBox>
    )
  }

  if (!result.data) {
    return result.fetching ? (
      <StateBox className={className}>
        <Spinner aria-label={messages.loading} className="size-5" />
      </StateBox>
    ) : null
  }

  if (isEmpty && messages.empty) {
    return (
      <StateBox className={className}>
        <InboxIcon aria-hidden="true" className="size-5" />
        <span>{messages.empty}</span>
      </StateBox>
    )
  }

  return children
}

function StateBox({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
