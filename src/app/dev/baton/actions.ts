"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { seedDemoNetwork } from "@/lib/baton/demo";

/** Development only: seeds two demo users and eight demo tools with starter credits. */
export async function seedDemoAction() {
  if (process.env.NODE_ENV === "production") throw new Error("Not available in production.");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  await seedDemoNetwork(`${proto}://${host}`);
  revalidatePath("/dev/baton");
}
