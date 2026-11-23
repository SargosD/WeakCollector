import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

class ResizeObserverMock implements ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock

globalThis.IntersectionObserver = class {
  root = null
  rootMargin = ''
  thresholds = []

  observe() {}

  unobserve() {}

  disconnect() {}

  takeRecords() {
    return []
  }
} as unknown as typeof IntersectionObserver

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

afterEach(() => {
  vi.unstubAllGlobals()
})
