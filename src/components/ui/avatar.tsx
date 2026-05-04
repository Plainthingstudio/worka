import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export type AvatarColorKey =
  | "blue"
  | "indigo"
  | "red"
  | "pink"
  | "purple"
  | "cyan"
  | "teal"
  | "green"
  | "yellow"
  | "orange"
  | "default"

export const AVATAR_COLOR_PALETTE: Record<AvatarColorKey, { bg: string; text: string }> = {
  blue:    { bg: "#DBEAFE", text: "#155DFC" },
  indigo:  { bg: "#E0E7FF", text: "#4F39F6" },
  red:     { bg: "#FFE4E6", text: "#EC003F" },
  pink:    { bg: "#FCE7F3", text: "#E60076" },
  purple:  { bg: "#F3E8FF", text: "#9810FA" },
  cyan:    { bg: "#CEFAFE", text: "#0092B8" },
  teal:    { bg: "#CBFBF1", text: "#009689" },
  green:   { bg: "#D0FAE5", text: "#00A63E" },
  yellow:  { bg: "#FEF9C2", text: "#D08700" },
  orange:  { bg: "#FFEDD4", text: "#F54900" },
  default: { bg: "#F3F4F6", text: "#4A5565" },
}

const AUTO_COLOR_KEYS: AvatarColorKey[] = [
  "blue",
  "indigo",
  "red",
  "pink",
  "purple",
  "cyan",
  "teal",
  "green",
  "yellow",
  "orange",
]

export const getAvatarColorFor = (seed: string | undefined | null): AvatarColorKey => {
  if (!seed) return "default"
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return AUTO_COLOR_KEYS[Math.abs(hash) % AUTO_COLOR_KEYS.length]
}

export const getAvatarInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

export type InitialAvatarSize = 24 | 32

interface InitialAvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  name: string
  size?: InitialAvatarSize
  color?: AvatarColorKey
}

const InitialAvatar = React.forwardRef<HTMLDivElement, InitialAvatarProps>(
  ({ name, size = 24, color, className, style, ...props }, ref) => {
    const resolvedColor = color ?? getAvatarColorFor(name)
    const { bg, text } = AVATAR_COLOR_PALETTE[resolvedColor]
    const fontSize = size === 24 ? 11 : 12
    const lineHeight = size === 24 ? 14 : 18
    const letterSpacing = size === 24 ? "0.02em" : "0.01em"

    return (
      <div
        ref={ref}
        title={name}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border border-card font-normal",
          className
        )}
        style={{
          width: size,
          height: size,
          backgroundColor: bg,
          color: text,
          fontSize,
          lineHeight: `${lineHeight}px`,
          letterSpacing,
          ...style,
        }}
        {...props}
      >
        {getAvatarInitials(name)}
      </div>
    )
  }
)
InitialAvatar.displayName = "InitialAvatar"

export { Avatar, AvatarImage, AvatarFallback, InitialAvatar }
