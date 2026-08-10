"use client";

import {
  Delete02Icon,
  MoreVerticalIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";

import { deleteSample } from "@/app/dashboard/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import type { Sample } from "@/lib/samples-validation";

export function RowActions({
  sample,
  onEdit,
}: {
  sample: Sample;
  onEdit: (sample: Sample) => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteSample(sample.id);
      if (result.ok) {
        toast.add({ title: "Sample deleted", type: "success" });
        setDeleteOpen(false);
      } else {
        toast.add({
          title: "Failed to delete sample",
          description: result.error,
          type: "error",
        });
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm">
              <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
              <span className="sr-only">Open row actions</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(sample)}>
              <HugeiconsIcon
                icon={PencilEdit02Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sample</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the sample{" "}
              <span className="font-medium">{sample.alias}</span>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              render={<Button variant="destructive" />}
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting && <Spinner data-icon="inline-start" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
