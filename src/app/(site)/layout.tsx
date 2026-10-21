import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getSettings } from "@/lib/queries";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <Navbar />
      <main id="main" className="overflow-x-clip">{children}</main>
      <Footer s={settings} />
    </>
  );
}
