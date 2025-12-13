"use client"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Home, ShoppingCart, Users, Receipt, BarChart3, Settings, Table2, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

const items = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/tables", icon: LayoutGrid, label: "Tables" },
  { href: "/sales", icon: ShoppingCart, label: "Sales" },
  { href: "/products", icon: BarChart3, label: "Products" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/reports", icon: Table2, label: "Reports" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
  { href: "/settings", icon: Settings, label: "Settings" },
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
            <Link key={item.href} href={item.href} aria-label={item.label} title={item.label} className="group">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl [&_svg]:size-6">
                <Icon className="text-muted-foreground group-hover:text-foreground" />
              </Button>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}


