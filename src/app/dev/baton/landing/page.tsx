import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Demo landing", robots: { index: false } };

/** Where demo tools send visitors, so the redirect and its `ref=baton` can be seen. */
export default async function DemoLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string; ref?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { tool, ref } = await searchParams;

  return (
    <main className="container-page py-12">
      <p className="text-eyebrow text-muted-foreground">Demo destination</p>
      <h1 className="mt-2 text-heading">{tool ?? "unknown tool"}</h1>
      <p className="mt-3 text-sm">
        Arrived with <code className="font-mono">ref={ref ?? "(none)"}</code>.
      </p>
      <Link href="/dev/baton" className="mt-6 inline-block text-sm underline underline-offset-4">
        Back to the playground
      </Link>
    </main>
  );
}
