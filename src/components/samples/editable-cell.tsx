"use client";

import { useState, useTransition } from "react";

import { updateSample } from "@/app/dashboard/actions";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  SAMPLE_FIELD_KINDS,
  type Sample,
  type SampleField,
} from "@/lib/samples-validation";
import { cn } from "@/lib/utils";

export function EditableCell({
  sample,
  field,
  display,
}: {
  sample: Sample;
  field: SampleField;
  display: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const kind = SAMPLE_FIELD_KINDS[field];
  const rawValue = sample[field] === null ? "" : String(sample[field]);

  function startEditing() {
    setDraft(rawValue);
    setEditing(true);
  }

  function commit(value: string) {
    setEditing(false);
    if (value === rawValue) return;
    startTransition(async () => {
      const result = await updateSample(sample.id, { [field]: value });
      if (result.ok) {
        toast.add({ title: "Sample updated", type: "success" });
      } else {
        toast.add({
          title: "Failed to update sample",
          description: result.fieldErrors?.[field] ?? result.error,
          type: "error",
        });
      }
    });
  }

  if (editing) {
    return (
      <Input
        autoFocus
        type={kind === "date" ? "date" : "text"}
        inputMode={kind === "number" ? "decimal" : undefined}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit(draft);
          } else if (event.key === "Escape") {
            event.preventDefault();
            setEditing(false);
          }
        }}
        className="h-7 min-w-32 px-2"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      disabled={isPending}
      className={cn(
        "-mx-2 flex w-full cursor-text rounded-md px-2 py-1 text-left hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
        isPending && "opacity-50",
      )}
    >
      {display}
    </button>
  );
}
