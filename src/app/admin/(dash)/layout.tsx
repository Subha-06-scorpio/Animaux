import type { Metadata } from "next";
import { Sidebar, type NavItem } from "@/components/admin/sidebar";
import { can, requirePage } from "@/lib/auth";
import { dataMode } from "@/lib/config";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · ANIMAUX Admin" }, robots: { index: false, follow: false } };

export default async function DashLayout({ children }: LayoutProps<"/admin">) {
  const user = await requirePage();
  const newEnquiries = can(user, "enquiries.read") ? (await repo().listEnquiries()).filter((e) => e.status === "new").length : 0;

  const items: (NavItem & { show: boolean })[] = [
    { href: "/admin", label: "Overview", icon: "LayoutDashboard", show: true },
    { href: "/admin/registrations", label: "Registrations", icon: "Ticket", show: can(user, "registrations.read") },
    { href: "/admin/enquiries", label: "Enquiries", icon: "MessageSquare", badge: newEnquiries, show: can(user, "enquiries.read") },
    { href: "/admin/events", label: "Events", icon: "PawPrint", show: can(user, "content.write") },
    { href: "/admin/team", label: "Team", icon: "Users", show: can(user, "content.write") },
    { href: "/admin/gallery", label: "Gallery", icon: "Images", show: can(user, "content.write") },
    { href: "/admin/schedule", label: "Schedule", icon: "CalendarRange", show: can(user, "content.write") },
    { href: "/admin/announcements", label: "Announcements", icon: "Megaphone", show: can(user, "content.write") },
    { href: "/admin/faqs", label: "FAQs", icon: "HelpCircle", show: can(user, "content.write") },
    { href: "/admin/sponsors", label: "Sponsors", icon: "Handshake", show: can(user, "content.write") },
    { href: "/admin/settings", label: "Festival settings", icon: "Settings", show: can(user, "settings.write") },
  ];

  return (
    <div className="min-h-screen bg-midnight">
      <Sidebar items={items.filter((i) => i.show).map(({ href, label, icon, badge }) => ({ href, label, icon, badge }))} user={user} mode={dataMode === "local" ? "local file (dev)" : "Supabase"} />
      <div className="lg:pl-60">
        {dataMode === "local" && (
          <div className="border-b border-gold/30 bg-gold/10 px-6 py-2 text-xs text-ivory/80">
            Development mode: data is stored in <code>.data/db.json</code> on this machine. Connect Supabase before going live (see docs/SETUP.md).
          </div>
        )}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
