"use client";

import { useEffect, useState } from "react";
import { useApp, type Route } from "@/lib/store";
import { useStudioWorlds } from "@/lib/worlds-config";
import { getIdentity, setName as saveName } from "@/lib/identity";
import { Search, Upload, User, Home, Sparkles, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Nav() {
  const { route, navigate, searchOpen, setSearchOpen, fxReduced, setFxReduced } = useApp();
  const worlds = useStudioWorlds();
  const [ident, setIdent] = useState({ id: "", name: "" });
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      const i = getIdentity();
      setIdent(i);
      setNameDraft(i.name);
    }, 0);
    return () => clearTimeout(t);
  }, [route]);

  const onHome = route.view === "home";
  const world = route.view === "world" ? worlds.find((w) => w.id === route.world) : null;

  const go = (r: Route) => navigate(r);

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
          <button
            onClick={() => setFxReduced(!fxReduced)}
            className={`hidden items-center gap-1 rounded-md px-2 py-1.5 text-[12px] transition-colors md:flex ${fxReduced ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
            title={fxReduced ? "Effects reduced" : "Reduce motion & effects"}
            aria-pressed={fxReduced}
          >
            <Sparkles className={`h-4 w-4 ${fxReduced ? "opacity-40" : ""}`} />
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--w-accent)]"
                aria-label="Your profile"
              >
                <User className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 border-white/15 bg-black/90 p-3 backdrop-blur-xl">
              <p className="mb-1 text-[11px] uppercase tracking-widest text-white/40">Signed in as</p>
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="mb-2 border-white/20 bg-white/5 text-white"
                placeholder="Display name"
                maxLength={48}
                aria-label="Display name"
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 rounded-md bg-white/10 py-1.5 text-[12px] text-white hover:bg-white/20"
                  onClick={() => {
                    saveName(nameDraft.trim() || ident.name);
                    setIdent({ ...ident, name: nameDraft.trim() || ident.name });
                  }}
                >
                  Save name
                </button>
                <button
                  className="flex-1 rounded-md bg-white/10 py-1.5 text-[12px] text-white hover:bg-white/20"
                  onClick={() => go({ view: "profile" })}
                >
                  Profile & collection
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-white/35">
                No account needed — this device is your key. Likes, uploads and your dream journal are tied to it.
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
