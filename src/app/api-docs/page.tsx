import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-24">
      <h1 className="text-4xl font-bold">API</h1>
      <p className="mt-2 text-zinc-400">REST endpoints for domain scans and exports.</p>

      <div className="mt-8 space-y-4">
        {[
          {
            method: "POST",
            path: "/api/scan",
            body: '{ "domain": "example.com" }',
            desc: "Start a scan. Returns scan id.",
          },
          {
            method: "GET",
            path: "/api/scan/:id",
            desc: "Poll scan status and result.",
          },
          {
            method: "GET",
            path: "/api/scan/:id/stream",
            desc: "SSE stream for live progress.",
          },
          {
            method: "GET",
            path: "/api/export?id=&format=json|csv",
            desc: "Download completed scan.",
          },
          {
            method: "GET",
            path: "/api/health",
            desc: "Health check.",
          },
        ].map((ep) => (
          <Card key={ep.path}>
            <CardHeader>
              <CardTitle className="font-mono text-base">
                <span className="text-violet-400">{ep.method}</span> {ep.path}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400">
              <p>{ep.desc}</p>
              {ep.body && (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-zinc-300">
                  {ep.body}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
