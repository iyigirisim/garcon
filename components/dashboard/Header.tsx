"use client"
import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from "react"

dayjs.extend(advancedFormat)

export function NowBar() {
  const [now, setNow] = useState(dayjs())
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 1000 * 30)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="text-sm text-black font-semibold flex justify-end px-2 py-0.5" style={{ userSelect: "none" }}>
      {now.format("D MMM, ddd HH:mm")}
    </div>
  )
}

export function Header() {
  const range = `${dayjs().startOf("month").format("MMM D")} – ${dayjs().endOf("month").format("MMM D, YYYY")}`
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">POS Dashboard</h1>
          <p className="text-muted-foreground">{range}</p>
        </div>
        <Button className="rounded-full" size="icon" aria-label="New">
          <Plus />
        </Button>
      </div>
    </div>
  )
}


