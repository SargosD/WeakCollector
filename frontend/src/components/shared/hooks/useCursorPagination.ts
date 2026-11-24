import { useCallback, useState } from 'react'

type Page = { after?: string; before?: string; start: number }

type PageInfo = { startCursor?: string | null; endCursor?: string | null }

export function useCursorPagination(pageSize: number) {
  const [page, setPage] = useState<Page>({ start: 0 })

  const variables = page.before
    ? { last: pageSize, before: page.before }
    : { first: pageSize, after: page.after }

  const next = (pageInfo?: PageInfo | null) =>
    setPage({ after: pageInfo?.endCursor ?? undefined, start: page.start + pageSize })

  const prev = (pageInfo?: PageInfo | null) =>
    setPage({
      before: pageInfo?.startCursor ?? undefined,
      start: Math.max(0, page.start - pageSize),
    })

  const reset = useCallback(() => setPage({ start: 0 }), [])

  return { start: page.start, variables, next, prev, reset }
}
