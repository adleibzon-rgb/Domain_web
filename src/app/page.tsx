import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <footer className="border-t border-white/5 py-12 text-center text-sm text-zinc-500">
        <p>Domain Scanner — self-hosted domain intelligence</p>
        <p className="mt-2">
          <a href="https://github.com/andrey271192/Domain_web" className="text-violet-400 hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </>
  );
}
