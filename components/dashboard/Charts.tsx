"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export function DailySalesChart({ className }: { className?: string }) {
  // Simple SVG area/column hybrid inspired by the reference UI
  const bars = [80, 60, 70, 65, 90, 55, 58, 62, 30, 28, 40, 45]
  return (
    <div className={cn("rounded-2xl bg-accent/60 p-4", className)}>
      <div className="text-sm font-medium text-muted-foreground">Overview</div>
      <div className="text-xs text-muted-foreground">Today</div>
    </div>
  )
}

export function CategoryBar({ className }: { className?: string }) {
  const segments = [
    { color: "hsl(var(--chart-1))", value: 44, label: "Food" },
    { color: "hsl(var(--chart-2))", value: 28, label: "Drinks" },
    { color: "hsl(var(--chart-3))", value: 18, label: "Dessert" },
    { color: "hsl(var(--chart-4))", value: 10, label: "Other" },
  ]
  const total = segments.reduce((a, b) => a + b.value, 0)
  let acc = 0
  return (
    <div className={cn("rounded-xl border p-4", className)}>
      <div className="mb-2 text-sm font-medium">Category Mix</div>
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {segments.map((s, i) => {
          const w = `${(s.value / total) * 100}%`
          acc += s.value
          return <div key={i} style={{ width: w, background: s.color }} />
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-md bg-muted px-2 py-1">
            <span className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="text-muted-foreground">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}


