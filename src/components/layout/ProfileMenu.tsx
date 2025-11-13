"use client"

import { type ComponentType } from "react"
import { useRouter } from "next/navigation"
import { Inbox, Settings, UserRound } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { UserRole } from "@/types"

const ROLE_TITLES: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  doctor: "Doctor",
  technician: "Technician",
  helper: "Helper",
  office: "Office",
}

type MenuTarget = "profile" | "settings" | "inbox"

const menuItems: Array<{
  key: MenuTarget
  label: string
  buildHref: (role: UserRole) => string
  icon: ComponentType<{ className?: string }>
}> = [
  {
    key: "profile",
    label: "Profile",
    icon: UserRound,
    buildHref: (role) => `/${role}/profile`,
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    buildHref: (role) => `/settings/${role}`,
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: Inbox,
    buildHref: (role) => `/${role}/inbox`,
  },
]

interface ProfileMenuProps {
  role: UserRole
  className?: string
}

const getInitials = (name?: string | null) => {
  if (!name) return "UX"
  const [first = "", second = ""] = name.split(" ")
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
}

/**
 * Renders the avatar control in the role header and provides quick navigation
 * to profile, settings, and inbox destinations for the active role.
 */
export const ProfileMenu = ({ role, className }: ProfileMenuProps) => {
  const { user } = useAuth()
  const router = useRouter()
  const initials = getInitials(user?.name)
  const subtitle = user?.department ?? `${ROLE_TITLES[role]} team`

  const handleNavigate = (target: MenuTarget) => {
    const menuConfig = menuItems.find((item) => item.key === target)
    if (!menuConfig) {
      return
    }
    const href = menuConfig.buildHref(role)
    try {
      router.push(href)
    } catch (error) {
      console.error(`Failed to navigate to ${target}`, error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn("role-hero__control role-profile-control", className)}
          aria-label="Open profile quick actions"
        >
          <span aria-hidden className="role-profile-avatar">
            {initials}
          </span>
          <span className="sr-only">Profile menu</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className={cn(
          "w-60 rounded-2xl border border-border/60 bg-card/95 p-2 text-sm shadow-xl backdrop-blur",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-90",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        )}
      >
        <DropdownMenuLabel className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 text-left text-sm font-medium text-foreground">
          <span className="role-profile-avatar role-profile-avatar--menu">
            {initials}
          </span>
          <span>
            <span className="block text-sm font-semibold">
              {user?.name ?? "Guest operator"}
            </span>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        {menuItems.map(({ key, label, icon: Icon }) => (
          <DropdownMenuItem
            key={key}
            onSelect={(e) => {
              e.preventDefault()
              handleNavigate(key)
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition focus:bg-primary/10 focus:text-primary"
          >
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileMenu
