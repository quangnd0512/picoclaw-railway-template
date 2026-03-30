import { useState, useEffect } from 'react'

export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  muted: '#6b7280',
  grid: { light: '#e5e7eb', dark: '#374151' },
  text: { light: '#374151', dark: '#d1d5db' },
  bg: { light: '#ffffff', dark: '#111827' },
}

export function isDark(): boolean {
  return document.documentElement.classList.contains('dark')
}

export function useChartTheme() {
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return {
    dark,
    gridColor: dark ? CHART_COLORS.grid.dark : CHART_COLORS.grid.light,
    textColor: dark ? CHART_COLORS.text.dark : CHART_COLORS.text.light,
    bgColor: dark ? CHART_COLORS.bg.dark : CHART_COLORS.bg.light,
  }
}
