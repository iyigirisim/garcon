import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
}

function Avatar({ className, src, alt = "", ...props }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex size-8 items-center justify-center rounded-full bg-secondary", className)} {...props}>
      {src ? (
        <Image src={src} alt={alt} fill className="rounded-full object-cover" />
      ) : (
        <span className="text-xs text-muted-foreground">POS</span>
      )}
    </div>
  )
}

export { Avatar }


