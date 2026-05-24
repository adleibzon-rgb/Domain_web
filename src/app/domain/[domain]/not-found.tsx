export default function DomainNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-32 text-center">
      <h1 className="text-2xl font-bold">No scan found</h1>
      <p className="mt-2 text-zinc-400">Run a scan from the dashboard first.</p>
      <a href="/dashboard" className="mt-6 inline-block text-violet-400 hover:underline">
        Go to dashboard
      </a>
    </div>
  );
}
