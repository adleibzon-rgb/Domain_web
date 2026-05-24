import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-zinc-300">Domain Scanner</p>
          <p className="mt-1 text-sm text-zinc-500">Self-hosted domain intelligence</p>
          <p className="mt-3">
            <Link
              href="https://github.com/andrey271192/Domain_web"
              className="text-sm text-violet-400 hover:underline"
            >
              GitHub
            </Link>
          </p>
        </div>

        <div
          data-telegram-bot-card
          className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur"
        >
          <p className="text-sm font-medium text-zinc-200">Telegram domain lookup</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Quick DNS/IP checks and list exports on the go — same idea as a scan, in chat.
          </p>
          <p className="mt-3 font-mono text-sm">
            <Link
              href="https://t.me/domain_searchPro_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              @domain_searchPro_bot
            </Link>
          </p>
          <Link
            href="https://t.me/domain_searchPro_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Open in Telegram
          </Link>
        </div>
      </div>
    </footer>
  );
}
