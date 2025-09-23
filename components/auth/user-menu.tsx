"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth";
import type { User } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DarkModeToggleButton } from "../ui/dark-mode-toggle";

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (user.role === "admin") return <Badge variant="secondary">Admin</Badge>;
    if (user.approved) return <Badge variant="default">Approved</Badge>;
    return <Badge variant="outline">Pending Approval</Badge>;
  };

  return (
<DropdownMenu>
  {/* Trigger */}
  <DropdownMenuTrigger asChild>
    <button className="h-10 w-10 rounded-full flex items-center justify-center border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow-md transition">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.photo_url || ""} alt={user.name || ""} />
        <AvatarFallback className="text-sm font-semibold">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
    </button>
  </DropdownMenuTrigger>

  {/* Menu Content */}
  <DropdownMenuContent
    className="w-60 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-900 p-2"
    align="end"
    forceMount
  >
    {/* User Info */}
    <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-700">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.photo_url || ""} alt={user.name || ""} />
        <AvatarFallback className="text-sm font-semibold">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col space-y-1 leading-none">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {user.name || "User"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-40">
          {user.email}
        </p>
        <div className="pt-1">{getStatusBadge()}</div>
      </div>
    </div>

    <DropdownMenuSeparator className="my-1" />

    {/* Menu Links */}
    <DropdownMenuItem asChild>
      <Link href="/profile" legacyBehavior prefetch={true}>
        <a className="w-full block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          Profile
        </a>
      </Link>
    </DropdownMenuItem>

    <DropdownMenuItem asChild>
      <Link href="/submissions" legacyBehavior prefetch={true}>
        <a className="w-full block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          My Submissions
        </a>
      </Link>
    </DropdownMenuItem>

    {user.role === "admin" && (
      <DropdownMenuItem asChild>
        <Link href="/admin" legacyBehavior prefetch={true}>
          <a className="w-full block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            Admin Dashboard
          </a>
        </Link>
      </DropdownMenuItem>
    )}

    <DropdownMenuSeparator className="my-1" />

    {/* Sign Out */}
    <DropdownMenuItem
      onClick={handleSignOut}
      disabled={isLoading}
      className="px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
  );
}
