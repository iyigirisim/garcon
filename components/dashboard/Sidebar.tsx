"use client"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, ShoppingCart, Users, Receipt, BarChart3, Settings, Table2, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

const items = [
  { href: "/", icon: Home, label: "Ana Sayfa" },
  { href: "/tables", icon: LayoutGrid, label: "Masalar" },

  { href: "/products", icon: BarChart3, label: "Ürünler" },
  { href: "/customers", icon: Users, label: "Müşteriler" },
  { href: "/reports", icon: Table2, label: "Raporlar" },
  { href: "/expenses", icon: Receipt, label: "Harcamalar" },
  { href: "/settings", icon: Settings, label: "Ayarlar" },
]

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex h-full w-16 flex-col items-center gap-4 bg-background py-4 md:w-20 pt-40",
        className
      )}
    >
      <nav className="flex flex-1 flex-col items-center gap-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} aria-label={item.label} className="group relative flex items-center justify-center">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl [&_svg]:size-6">
                <Icon className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </Button>
              <span className="absolute left-14 z-50 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}


