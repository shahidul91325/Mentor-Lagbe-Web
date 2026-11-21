import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/**
 * Public site shell: navbar on top, footer at the bottom.
 * Route group "(public)" keeps this chrome away from dashboard routes.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<header className="h-16 border-b border-border bg-surface/90" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
