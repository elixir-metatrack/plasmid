"use client";

import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Columns3,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type {
  ColumnVisibilityState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { filterFn_includesString, useTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import {
  buildColumns,
  DEFAULT_HIDDEN_COLUMNS,
  features,
  type Sample,
} from "@/components/samples/columns";
import { SampleFormSheet } from "@/components/samples/sample-form-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const INITIAL_COLUMN_VISIBILITY: ColumnVisibilityState = Object.fromEntries(
  DEFAULT_HIDDEN_COLUMNS.map((columnId) => [columnId, false]),
);

function columnLabel(columnId: string) {
  const label = columnId
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function SamplesTable({
  data,
  isAdmin = false,
}: {
  data: Sample[];
  isAdmin?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingSample, setEditingSample] = useState<Sample | "new" | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>(INITIAL_COLUMN_VISIBILITY);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(
    () =>
      buildColumns({
        editable: isAdmin,
        onEdit: (sample) => {
          setEditingSample(sample);
          setSheetOpen(true);
        },
      }),
    [isAdmin],
  );

  const table = useTable({
    features,
    columns,
    data,
    state: { sorting, globalFilter, columnVisibility, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    globalFilterFn: filterFn_includesString,
  });

  const pageCount = table.getPageCount();
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <SampleFormSheet
          key={
            editingSample === "new" || editingSample === null
              ? "new"
              : editingSample.id
          }
          sample={editingSample === "new" ? null : editingSample}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={globalFilter}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
              table.setPageIndex(0);
            }}
            placeholder="Search samples..."
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              onClick={() => {
                setEditingSample("new");
                setSheetOpen(true);
              }}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Add sample
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <HugeiconsIcon
                    icon={Columns3}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  Columns
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="max-h-96 w-56 overflow-y-auto"
            >
              <DropdownMenuGroup>
                {table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(checked) =>
                        column.toggleVisibility(checked)
                      }
                    >
                      {columnLabel(column.id)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {pagination.pageIndex + 1} of {Math.max(pageCount, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              data-icon="inline-end"
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
