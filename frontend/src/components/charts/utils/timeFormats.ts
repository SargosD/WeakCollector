import { TimeRange } from '@/types/graphql'

export const TickFormats: Record<TimeRange, Intl.DateTimeFormatOptions> = {
  [TimeRange.LastHour]: { hour: '2-digit', minute: '2-digit' },
  [TimeRange.LastDay]: { hour: '2-digit', minute: '2-digit' },
  [TimeRange.LastWeek]: { day: '2-digit', month: 'short', hour: '2-digit' },
  [TimeRange.LastMonth]: { day: '2-digit', month: 'short' },
}
