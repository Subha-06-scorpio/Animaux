import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { requirePage } from "@/lib/auth";
import { repo } from "@/lib/data";

export const metadata: Metadata = { title: "Festival settings" };

export default async function SettingsPage() {
  await requirePage("settings.write");
  const settings = await repo().getSettings();
  return (
    <div>
      <p className="eyebrow">Configuration</p>
      <h1 className="display mt-2 text-4xl">Festival settings</h1>
      <p className="mt-2 text-sm text-ivory/65">Dates, venue, contact details, social links, brochure and guidelines — used across the whole website.</p>
      <SettingsForm initial={settings} />
    </div>
  );
}
