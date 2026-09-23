"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-8 xl:max-w-[90rem] 2xl:max-w-[110rem]">
        {/* Brand logo & Desktop navigation */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-90"
          >
            <Image
              src="/a3gen.png"
              alt="A3GEN Logo"
              width={1800}
              height={225}
              priority
              className="h-7 w-auto object-contain dark:invert md:h-8"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop actions: Theme toggle & Auth */}
        <div className="hidden items-center gap-3 md:flex">
          <ModeToggle />
          {session ? (
            <div className="flex items-center gap-3">
              <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                {session.user.email}
              </span>
              <SignOutButton size="sm" />
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Admin sign in
            </Button>
          )}
        </div>

        {/* Mobile controls: Theme toggle & Hamburger menu */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
                </Button>
              }
            />
            <SheetContent side="right" className="flex flex-col gap-6 p-6">
              <SheetHeader className="p-0 text-left">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center py-1"
                >
                  <Image
                    src="/a3gen.png"
                    alt="A3GEN Logo"
                    width={1800}
                    height={225}
                    priority
                    className="h-7 w-auto object-contain dark:invert"
                  />
                </Link>
              </SheetHeader>

              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const active = isLinkActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "rounded-md px-3 py-2 text-base font-medium transition-colors",
                        active
                          ? "bg-accent text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto flex flex-col gap-3 border-t pt-4">
                {session ? (
                  <div className="flex flex-col gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      Signed in as{" "}
                      <span className="font-medium text-foreground">
                        {session.user.email}
                      </span>
                    </p>
                    <SignOutButton size="sm" className="w-full" />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    nativeButton={false}
                    onClick={() => setMobileMenuOpen(false)}
                    render={<Link href="/sign-in" />}
                  >
                    Admin sign in
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
