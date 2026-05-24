import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { SiteFooter } from "@/components/layout/site-footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <SiteFooter />
    </>
  );
}
