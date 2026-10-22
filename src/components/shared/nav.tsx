"use client";

import { useEffect } from "react";
import { useApp, type Route } from "@/lib/store";
import { useStudioWorlds } from "@/lib/worlds-config";
import { Search, Upload, Home, Sparkles, ChevronDown, LogIn, LogOut, Wrench } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleOf, useSession } from "@/lib/session";

export function Nav() {
  const { route, navigate, searchOpen, setSearchOpen, fxReduced, setFxReduced } = useApp();
  const worlds = useStudioWorlds();
  const { user: sessionUser, refresh: refreshSession } = useSession();
  const isStaff = sessionUser?.role === "owner" || sessionUser?.role === "editor";
  const handle = handleOf(sessionUser);

  // Keep the account badge honest as the user moves around the museum.
  useEffect(() => {
    refreshSession().catch(() => {});
  }, [route, refreshSession]);

  const onHome = route.view === "home";
  const world = route.view === "world" ? worlds.find((w) => w.id === route.world) : null;

  const go = (r: Route) => navigate(r);

  const signOut = async () => {
    await fetch("/api/studio/auth", { method: "DELETE" }).catch(() => {});
    // Leaving the studio view? Reload so the portal card replaces the editor.
    if (route.view === "studio") {
      window.location.reload();
      return;
    }
    await refreshSession();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/55 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <button
          onClick={() => go({ view: "home" })}
          className="group flex items-center gap-2 rounded-md px-1 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--w-accent)]"
          aria-label="AESTHETICA home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2e88] via-[#7df2d8] to-[#9be8ff] text-[11px] font-black text-black shadow-[0_0_18px_-2px_rgba(255,46,136,0.8)]">
            Æ
          </span>
          <span className="text-[15px] font-bold tracking-[0.28em] text-white">
            AESTHETICA
          </span>
        </button>

        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Worlds">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[13px] text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--w-accent)]">
                All Worlds
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 border-white/15 bg-black/90 backdrop-blur-xl">
              {worlds.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => go({ view: "world", world: w.id })}
                  className="cursor-pointer gap-3 rounded-lg px-3 py-2.5 focus:bg-white/10"
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${w.grad[1]}, ${w.grad[2]})`,
                      boxShadow: `0 0 12px -2px ${w.grad[1]}`,
                    }}
                  />
                  <span>
                    <span className="block text-[13px] font-medium text-white">{w.name}</span>
                    <span className="block text-[11px] text-white/50">{w.epithet}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {world && (
            <span className="ml-2 hidden items-center gap-2 text-[13px] text-white/60 xl:flex">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: world.accent, boxShadow: `0 0 10px ${world.accent}` }}
              />
              {world.name} — {world.epithet}
            </span>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => go({ view: "home" })}
            className={`hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors sm:flex ${onHome ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
          >
            <Home className="h-4 w-4" />
            Portal
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--w-accent)]"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="ml-1 hidden rounded border border-white/20 bg-white/5 px-1 font-sans text-[10px] text-white/50 md:inline">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={() => go({ view: "upload" })}
            className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#ff2e88] to-[#7df2d8] px-3 py-1.5 text-[13px] font-semibold text-black shadow-[0_0_20px_-4px_rgba(255,46,136,0.7)] transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Add Artwork</span>
          </button>
          {sessionUser ? (
            <>
              <button
                onClick={() => go({ view: "profile" })}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] py-1 pl-1 pr-2.5 transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--w-accent)]"
                title={`${handle} — ${sessionUser.email}`}
                aria-label="Your account and collection"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#ff2e88] to-[#7df2d8] text-[11px] font-bold text-black">
                  {handle.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[140px] truncate text-[12.5px] font-medium text-white/90 md:inline">
                  {handle}
                </span>
              </button>
              {isStaff && (
                <button
                  onClick={() => go({ view: "studio" })}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                    route.view === "studio" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                  title="Open the Studio"
                >
                  <Wrench className="h-4 w-4" />
                  <span className="hidden lg:inline">Studio</span>
                </button>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--w-accent)]"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xl:inline">Sign out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => go({ view: "studio" })}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--w-accent)]"
              title="Sign in or create an account"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden lg:inline">Sign in</span>
            </button>
          )}
          <button
            onClick={() => setFxReduced(!fxReduced)}
            className={`hidden items-center gap-1 rounded-md px-2 py-1.5 text-[12px] transition-colors md:flex ${fxReduced ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
            title={fxReduced ? "Effects reduced" : "Reduce motion & effects"}
            aria-pressed={fxReduced}
          >
            <Sparkles className={`h-4 w-4 ${fxReduced ? "opacity-40" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
