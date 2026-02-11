import '@testing-library/jest-dom/vitest'

// Polyfill ResizeObserver for jsdom (required by Radix UI components like Slider)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
