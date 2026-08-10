"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { samples } from "@/db/samples-schema";
import { auth, type Session } from "@/lib/auth";
import {
  type SampleFormValues,
  sampleFormSchema,
} from "@/lib/samples-validation";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireAdmin(): Promise<Session | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}

function firstFieldErrors(
  error: z.ZodError,
): Record<string, string> | undefined {
  const flattened = z.flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const entries = Object.entries(flattened)
    .filter(([, messages]) => messages?.length)
    .map(([field, messages]) => [field, messages?.[0] ?? "Invalid value"]);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: string }).code;
  const message = (error as { message?: string }).message ?? "";
  return code === "23505" || message.includes("duplicate key");
}

const DUPLICATE_ALIAS_RESULT: ActionResult = {
  ok: false,
  error: "A sample with this alias already exists",
  fieldErrors: { alias: "A sample with this alias already exists" },
};

export async function createSample(
  input: SampleFormValues,
): Promise<ActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "You are not authorized to create samples" };
  }

  const parsed = sampleFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Some fields are invalid",
      fieldErrors: firstFieldErrors(parsed.error),
    };
  }

  try {
    await db.insert(samples).values(parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return DUPLICATE_ALIAS_RESULT;
    }
    return { ok: false, error: "Failed to create the sample" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateSample(
  id: string,
  input: Partial<SampleFormValues>,
): Promise<ActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "You are not authorized to update samples" };
  }

  const parsed = sampleFormSchema.partial().safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Some fields are invalid",
      fieldErrors: firstFieldErrors(parsed.error),
    };
  }

  if (Object.keys(parsed.data).length === 0) {
    return { ok: true };
  }

  try {
    const updated = await db
      .update(samples)
      .set(parsed.data)
      .where(eq(samples.id, id))
      .returning({ id: samples.id });
    if (updated.length === 0) {
      return { ok: false, error: "Sample not found" };
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return DUPLICATE_ALIAS_RESULT;
    }
    return { ok: false, error: "Failed to update the sample" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteSample(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "You are not authorized to delete samples" };
  }

  try {
    const deleted = await db
      .delete(samples)
      .where(eq(samples.id, id))
      .returning({ id: samples.id });
    if (deleted.length === 0) {
      return { ok: false, error: "Sample not found" };
    }
  } catch {
    return { ok: false, error: "Failed to delete the sample" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
