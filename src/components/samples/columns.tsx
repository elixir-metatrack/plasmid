"use client";

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { samples } from "@/db/samples-schema";

export type Sample = typeof samples.$inferSelect;

export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnVisibilityFeature,
});

const helper = createColumnHelper<typeof features, Sample>();

const EM_DASH = "—";

function formatText(value: string | null) {
  return value ?? EM_DASH;
}

function formatNumber(value: number | null, unit?: string | null) {
  if (value === null) return EM_DASH;
  return unit ? `${value} ${unit}` : String(value);
}

function formatDate(value: string | Date | null) {
  if (!value) return EM_DASH;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return EM_DASH;
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function sortableHeader(label: string) {
  return ({
    column,
  }: {
    column: {
      getIsSorted: () => false | "asc" | "desc";
      getToggleSortingHandler: () => ((event: unknown) => void) | undefined;
    };
  }) => {
    const sorted = column.getIsSorted();
    const icon =
      sorted === "asc"
        ? ArrowUp01Icon
        : sorted === "desc"
          ? ArrowDown01Icon
          : UnfoldMoreIcon;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2.5"
        onClick={column.getToggleSortingHandler()}
      >
        {label}
        <HugeiconsIcon icon={icon} strokeWidth={2} data-icon="inline-end" />
      </Button>
    );
  };
}

export const DEFAULT_HIDDEN_COLUMNS = [
  "description",
  "latitudeUnit",
  "longitudeUnit",
  "physicalCoordinates",
  "higherGeography",
  "elevation",
  "depth",
  "samplingProtocol",
  "preparationType",
  "coreLength",
  "storageLocation",
  "collectedBy",
  "eventId",
  "recordedBy",
  "institutionCode",
  "ownerInstitutionCode",
  "ageUncertainty",
  "basalAge14CBP",
  "basalAgeCalBP",
  "oldestSampleAgeCalBP",
  "bibliographicCitation",
  "associatedReferences",
  "occurrenceRemarks",
  "eventRemarks",
  "source",
  "createdAt",
  "updatedAt",
] as const;

export const columns = helper.columns([
  // Key subset (visible by default)
  helper.accessor("alias", {
    header: sortableHeader("Alias"),
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  helper.accessor("locality", {
    header: sortableHeader("Locality"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("countryCode", {
    header: sortableHeader("Country"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("latitude", {
    header: sortableHeader("Latitude"),
    cell: (info) => formatNumber(info.getValue()),
  }),
  helper.accessor("longitude", {
    header: sortableHeader("Longitude"),
    cell: (info) => formatNumber(info.getValue()),
  }),
  helper.accessor("collectionDate", {
    header: sortableHeader("Collection date"),
    cell: (info) => formatDate(info.getValue()),
  }),
  helper.accessor("projectName", {
    header: sortableHeader("Project"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("custodian", {
    header: sortableHeader("Custodian"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("age", {
    header: sortableHeader("Age"),
    cell: (info) => formatNumber(info.getValue(), info.row.original.ageUnit),
  }),
  // Remaining fields (hidden by default)
  helper.accessor("description", {
    header: sortableHeader("Description"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("latitudeUnit", {
    header: sortableHeader("Latitude unit"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("longitudeUnit", {
    header: sortableHeader("Longitude unit"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("physicalCoordinates", {
    header: sortableHeader("Physical coordinates"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("higherGeography", {
    header: sortableHeader("Higher geography"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("elevation", {
    header: sortableHeader("Elevation"),
    cell: (info) =>
      formatNumber(info.getValue(), info.row.original.elevationUnit),
  }),
  helper.accessor("depth", {
    header: sortableHeader("Depth"),
    cell: (info) => formatNumber(info.getValue(), info.row.original.depthUnit),
  }),
  helper.accessor("samplingProtocol", {
    header: sortableHeader("Sampling protocol"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("preparationType", {
    header: sortableHeader("Preparation type"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("coreLength", {
    header: sortableHeader("Core length"),
    cell: (info) =>
      formatNumber(info.getValue(), info.row.original.coreLengthUnit),
  }),
  helper.accessor("storageLocation", {
    header: sortableHeader("Storage location"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("collectedBy", {
    header: sortableHeader("Collected by"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("eventId", {
    header: sortableHeader("Event ID"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("recordedBy", {
    header: sortableHeader("Recorded by"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("institutionCode", {
    header: sortableHeader("Institution code"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("ownerInstitutionCode", {
    header: sortableHeader("Owner institution code"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("ageUncertainty", {
    header: sortableHeader("Age uncertainty"),
    cell: (info) =>
      formatNumber(info.getValue(), info.row.original.ageUncertaintyUnit),
  }),
  helper.accessor("basalAge14CBP", {
    header: sortableHeader("Basal age (14C BP)"),
    cell: (info) =>
      formatNumber(info.getValue(), info.row.original.basalAge14CBPUnit),
  }),
  helper.accessor("basalAgeCalBP", {
    header: sortableHeader("Basal age (cal BP)"),
    cell: (info) =>
      formatNumber(info.getValue(), info.row.original.basalAgeCalBPUnit),
  }),
  helper.accessor("oldestSampleAgeCalBP", {
    header: sortableHeader("Oldest sample age (cal BP)"),
    cell: (info) =>
      formatNumber(info.getValue(), info.row.original.oldestSampleAgeCalBPUnit),
  }),
  helper.accessor("bibliographicCitation", {
    header: sortableHeader("Bibliographic citation"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("associatedReferences", {
    header: sortableHeader("Associated references"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("occurrenceRemarks", {
    header: sortableHeader("Occurrence remarks"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("eventRemarks", {
    header: sortableHeader("Event remarks"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("source", {
    header: sortableHeader("Source"),
    cell: (info) => formatText(info.getValue()),
  }),
  helper.accessor("createdAt", {
    header: sortableHeader("Created at"),
    cell: (info) => formatDate(info.getValue()),
  }),
  helper.accessor("updatedAt", {
    header: sortableHeader("Updated at"),
    cell: (info) => formatDate(info.getValue()),
  }),
]);
