"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "@/components/ui/Skeleton";
import { MoveRight } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { data: user, isPending } = useCurrentUser();

  return (
    <header className="flex justify-between p-5">
      <Link href="/" aria-label="SOUT Home">
        <img src="/logo.svg" alt="SOUT" className="h-8 w-auto object-contain" />
      </Link>

      <nav aria-label="Primary navigation">
        <ul className="flex items-center gap-3">
          {isPending ? (
            <>
              <li>
                <Skeleton className="w-20 h-10" />
              </li>
              <li>
                <Skeleton className="w-20 h-10" />
              </li>
            </>
          ) : !user ? (
            <>
              <li>
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40 transition-all duration-200"
                >
                  Get Started
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-500/40 transition-all duration-200"
              >
                Chat now <MoveRight className="w-4 h-4" />
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
