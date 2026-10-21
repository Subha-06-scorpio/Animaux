"use client";

import { CalendarRange, ExternalLink, Images, LayoutDashboard, LogOut, Megaphone, Menu, MessageSquare, Settings, Ticket, Users, HelpCircle, PawPrint, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

const ICONS = { LayoutDashboard, Ticket, PawPrint, Users, Images, CalendarRange, Megaphone, HelpCircle, MessageSquare, Settings };
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number };

export function Sidebar({ items, user, mode }: { items: NavItem[]; user: { email: string; role: string }; mode: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const nav = (
    <nav className="flex h-full flex-col" aria-label="Dashboard">
      <Link href="/admin" className="flex items-center gap-2 px-5 py-5">
        <PawPrint className="text-gold" size={20} />
        <span className="font-display text-lg tracking-widest">ANIMAUX</span>
        <span className="font-mono text-[0.6rem] text-gold">ADMIN</span>
      </Link>
      <ul className="flex-1 space-y-0.5 px-3">
        {items.map((it) => {
          const Icon = ICONS[it.icon];
          const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link href={it.href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", active ? "bg-gold/15 text-gold" : "text-ivory/75 hover:bg-ivory/5 hover:text-ivory")}>
                <Icon size={17} /> <span className="flex-1">{it.label}</span>
                {!!it.badge && <span className="rounded-full bg-ember px-2 text-[0.65rem] font-bold text-midnight">{it.badge}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-2 border-t border-ivory/10 p-4 text-xs">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-ivory/70 hover:text-gold"><ExternalLink size={14} /> View website</Link>
        <p className="truncate text-mist" title={user.email}>{user.email} · <span className="text-gold">{user.role}</span></p>
        <p className="font-mono text-[0.6rem] uppercase tracking-widest text-mist">Data: {mode}</p>
        <form action={logoutAction}><button className="flex items-center gap-2 text-ivory/70 hover:text-ember-bright"><LogOut size={14} /> Sign out</button></form>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-ivory/10 bg-night lg:block">{nav}</aside>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-ivory/10 bg-night/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-display tracking-widest">ANIMAUX <span className="font-mono text-[0.6rem] text-gold">ADMIN</span></span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-lg border border-ivory/20"><Menu size={18} /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-night/70 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-64 border-r border-ivory/10 bg-night" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute left-[15rem] top-3 grid h-9 w-9 place-items-center rounded-lg border border-ivory/20 bg-night"><X size={18} /></button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
