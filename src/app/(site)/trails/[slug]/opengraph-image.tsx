import { ogSize } from "@/lib/seo/og-image";
import { renderTrailOgImage } from "@/lib/trails/og";
import { getTrail, trailParams } from "@/lib/trails/trails";

export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = trailParams;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const trail = await getTrail((await params).slug);
  return renderTrailOgImage(
    trail ?? {
      title: "Trails",
      promise: "Routes between free tools.",
      from: "idea",
      to: "website",
      steps: [],
    },
  );
}
