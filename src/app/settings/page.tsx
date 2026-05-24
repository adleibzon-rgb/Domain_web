export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-24">
      <h1 className="text-4xl font-bold">Settings</h1>
      <p className="mt-4 text-zinc-400">
        Configure IPINFO_TOKEN, SCAN_RATE_LIMIT_PER_HOUR, and database URLs via environment
        variables on your server. Theme toggle is in the header.
      </p>
    </div>
  );
}
