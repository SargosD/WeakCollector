import type { Reading } from '../../types/readings'
import { formatReading } from '../../utils/formatReading'

export function ReadingCard({ reading }: { reading: Reading }) {
  const { title, rows } = formatReading(reading)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <dl className="space-y-1 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3">
            <dt className="text-slate-600 dark:text-slate-400">{row.label}</dt>
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
