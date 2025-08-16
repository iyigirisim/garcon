"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Today’s Revenue</div>
          <div className="mt-1 text-3xl font-semibold">₺7,420</div>
          <Badge variant="highlight" className="mt-3">+₺540</Badge>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Open Tables</div>
          <div className="mt-1 text-3xl font-semibold">9</div>
          <Badge variant="highlight" className="mt-3">+2</Badge>
        </CardContent>
      </Card>
    </div>
  )
}


