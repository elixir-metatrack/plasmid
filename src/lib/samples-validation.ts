import { z } from "zod";

import type { samples } from "@/db/samples-schema";

export type Sample = typeof samples.$inferSelect;

const textField = z
  .string()
  .transform((value) => {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  })
  .pipe(z.string().nullable());

const numberField = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Number(value)), {
    message: "Must be a number",
  })
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(z.number().nullable());

const dateField = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Use the YYYY-MM-DD format",
  })
  .transform((value) => (value === "" ? null : value))
  .pipe(z.string().nullable());

export const sampleFormSchema = z.object({
  alias: z.string().trim().min(1, "Alias is required"),
  locality: textField,
  description: textField,
  latitude: numberField,
  latitudeUnit: textField,
  longitude: numberField,
  longitudeUnit: textField,
  physicalCoordinates: textField,
  countryCode: textField,
  higherGeography: textField,
  elevation: numberField,
  elevationUnit: textField,
  depth: numberField,
  depthUnit: textField,
  collectionDate: dateField,
  projectName: textField,
  samplingProtocol: textField,
  preparationType: textField,
  coreLength: numberField,
  coreLengthUnit: textField,
  storageLocation: textField,
  custodian: textField,
  collectedBy: textField,
  eventId: textField,
  recordedBy: textField,
  institutionCode: textField,
  ownerInstitutionCode: textField,
  age: numberField,
  ageUnit: textField,
  ageUncertainty: numberField,
  ageUncertaintyUnit: textField,
  basalAge14CBP: numberField,
  basalAge14CBPUnit: textField,
  basalAgeCalBP: numberField,
  basalAgeCalBPUnit: textField,
  oldestSampleAgeCalBP: numberField,
  oldestSampleAgeCalBPUnit: textField,
  bibliographicCitation: textField,
  associatedReferences: textField,
  occurrenceRemarks: textField,
  eventRemarks: textField,
  source: textField,
});

export type SampleFormValues = z.input<typeof sampleFormSchema>;
export type SampleData = z.output<typeof sampleFormSchema>;

export type SampleField = keyof SampleFormValues;

export const SAMPLE_FIELDS = Object.keys(
  sampleFormSchema.shape,
) as SampleField[];

export type SampleFieldKind = "text" | "number" | "date";

export const SAMPLE_FIELD_KINDS: Record<SampleField, SampleFieldKind> = {
  alias: "text",
  locality: "text",
  description: "text",
  latitude: "number",
  latitudeUnit: "text",
  longitude: "number",
  longitudeUnit: "text",
  physicalCoordinates: "text",
  countryCode: "text",
  higherGeography: "text",
  elevation: "number",
  elevationUnit: "text",
  depth: "number",
  depthUnit: "text",
  collectionDate: "date",
  projectName: "text",
  samplingProtocol: "text",
  preparationType: "text",
  coreLength: "number",
  coreLengthUnit: "text",
  storageLocation: "text",
  custodian: "text",
  collectedBy: "text",
  eventId: "text",
  recordedBy: "text",
  institutionCode: "text",
  ownerInstitutionCode: "text",
  age: "number",
  ageUnit: "text",
  ageUncertainty: "number",
  ageUncertaintyUnit: "text",
  basalAge14CBP: "number",
  basalAge14CBPUnit: "text",
  basalAgeCalBP: "number",
  basalAgeCalBPUnit: "text",
  oldestSampleAgeCalBP: "number",
  oldestSampleAgeCalBPUnit: "text",
  bibliographicCitation: "text",
  associatedReferences: "text",
  occurrenceRemarks: "text",
  eventRemarks: "text",
  source: "text",
};

function toFormValue(value: string | number | null): string {
  if (value === null) return "";
  return String(value);
}

export function sampleToFormValues(sample: Sample): SampleFormValues {
  return Object.fromEntries(
    SAMPLE_FIELDS.map((field) => [field, toFormValue(sample[field])]),
  ) as SampleFormValues;
}

export const EMPTY_SAMPLE_FORM_VALUES: SampleFormValues = Object.fromEntries(
  SAMPLE_FIELDS.map((field) => [field, ""]),
) as SampleFormValues;
