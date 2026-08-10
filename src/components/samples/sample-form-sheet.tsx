"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { z } from "zod";

import { createSample, updateSample } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  EMPTY_SAMPLE_FORM_VALUES,
  SAMPLE_FIELD_KINDS,
  type Sample,
  type SampleField,
  sampleFormSchema,
  sampleToFormValues,
} from "@/lib/samples-validation";

type FieldConfig = {
  name: SampleField;
  label: string;
  multiline?: boolean;
};

const SECTIONS: { title: string; fields: FieldConfig[] }[] = [
  {
    title: "Identity",
    fields: [
      { name: "alias", label: "Alias" },
      { name: "description", label: "Description", multiline: true },
      { name: "projectName", label: "Project name" },
      { name: "source", label: "Source" },
    ],
  },
  {
    title: "Location",
    fields: [
      { name: "locality", label: "Locality" },
      { name: "countryCode", label: "Country code" },
      { name: "higherGeography", label: "Higher geography" },
      { name: "latitude", label: "Latitude" },
      { name: "latitudeUnit", label: "Latitude unit" },
      { name: "longitude", label: "Longitude" },
      { name: "longitudeUnit", label: "Longitude unit" },
      { name: "physicalCoordinates", label: "Physical coordinates" },
      { name: "elevation", label: "Elevation" },
      { name: "elevationUnit", label: "Elevation unit" },
      { name: "depth", label: "Depth" },
      { name: "depthUnit", label: "Depth unit" },
    ],
  },
  {
    title: "Collection",
    fields: [
      { name: "collectionDate", label: "Collection date" },
      { name: "samplingProtocol", label: "Sampling protocol" },
      { name: "preparationType", label: "Preparation type" },
      { name: "coreLength", label: "Core length" },
      { name: "coreLengthUnit", label: "Core length unit" },
      { name: "eventId", label: "Event ID" },
      { name: "collectedBy", label: "Collected by" },
      { name: "recordedBy", label: "Recorded by" },
    ],
  },
  {
    title: "Ages",
    fields: [
      { name: "age", label: "Age" },
      { name: "ageUnit", label: "Age unit" },
      { name: "ageUncertainty", label: "Age uncertainty" },
      { name: "ageUncertaintyUnit", label: "Age uncertainty unit" },
      { name: "basalAge14CBP", label: "Basal age (14C BP)" },
      { name: "basalAge14CBPUnit", label: "Basal age (14C BP) unit" },
      { name: "basalAgeCalBP", label: "Basal age (cal BP)" },
      { name: "basalAgeCalBPUnit", label: "Basal age (cal BP) unit" },
      { name: "oldestSampleAgeCalBP", label: "Oldest sample age (cal BP)" },
      {
        name: "oldestSampleAgeCalBPUnit",
        label: "Oldest sample age (cal BP) unit",
      },
    ],
  },
  {
    title: "References",
    fields: [
      {
        name: "bibliographicCitation",
        label: "Bibliographic citation",
        multiline: true,
      },
      {
        name: "associatedReferences",
        label: "Associated references",
        multiline: true,
      },
      {
        name: "occurrenceRemarks",
        label: "Occurrence remarks",
        multiline: true,
      },
      { name: "eventRemarks", label: "Event remarks", multiline: true },
    ],
  },
  {
    title: "Storage",
    fields: [
      { name: "storageLocation", label: "Storage location" },
      { name: "custodian", label: "Custodian" },
      { name: "institutionCode", label: "Institution code" },
      { name: "ownerInstitutionCode", label: "Owner institution code" },
    ],
  },
];

function fieldInputType(name: SampleField) {
  return SAMPLE_FIELD_KINDS[name] === "date" ? "date" : "text";
}

function validateField(name: SampleField, value: string) {
  const schema = sampleFormSchema.shape[name] as z.ZodType<unknown, string>;
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function SampleFormSheet({
  sample,
  open,
  onOpenChange,
}: {
  sample: Sample | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const form = useForm({
    defaultValues: sample
      ? sampleToFormValues(sample)
      : EMPTY_SAMPLE_FORM_VALUES,
    onSubmit: async ({ value }) => {
      setServerErrors({});
      const result = sample
        ? await updateSample(sample.id, value)
        : await createSample(value);
      if (result.ok) {
        toast.add({
          title: sample ? "Sample updated" : "Sample created",
          type: "success",
        });
        onOpenChange(false);
      } else {
        setServerErrors(result.fieldErrors ?? {});
        toast.add({
          title: sample ? "Failed to update sample" : "Failed to create sample",
          description: result.error,
          type: "error",
        });
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{sample ? "Edit sample" : "Add sample"}</SheetTitle>
          <SheetDescription>
            {sample
              ? `Update the fields of ${sample.alias}.`
              : "Fill in the fields to create a new sample."}
          </SheetDescription>
        </SheetHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <FieldGroup>
              {SECTIONS.map((section) => (
                <FieldSet key={section.title}>
                  <FieldLegend>{section.title}</FieldLegend>
                  <FieldGroup className="gap-4">
                    {section.fields.map(({ name, label, multiline }) => (
                      <form.Field
                        key={name}
                        name={name}
                        validators={{
                          onBlur: ({ value }) => validateField(name, value),
                        }}
                      >
                        {(field) => {
                          const fieldErrors =
                            field.state.meta.isTouched &&
                            field.state.meta.errors.length
                              ? field.state.meta.errors.map((error) =>
                                  typeof error === "string"
                                    ? { message: error }
                                    : error,
                                )
                              : serverErrors[name]
                                ? [{ message: serverErrors[name] }]
                                : [];
                          const invalid = fieldErrors.length > 0;
                          return (
                            <Field data-invalid={invalid || undefined}>
                              <FieldLabel htmlFor={`sample-${name}`}>
                                {label}
                              </FieldLabel>
                              {multiline ? (
                                <Textarea
                                  id={`sample-${name}`}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  aria-invalid={invalid || undefined}
                                />
                              ) : (
                                <Input
                                  id={`sample-${name}`}
                                  type={fieldInputType(name)}
                                  inputMode={
                                    SAMPLE_FIELD_KINDS[name] === "number"
                                      ? "decimal"
                                      : undefined
                                  }
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  aria-invalid={invalid || undefined}
                                />
                              )}
                              <FieldError errors={fieldErrors} />
                            </Field>
                          );
                        }}
                      </form.Field>
                    ))}
                  </FieldGroup>
                </FieldSet>
              ))}
            </FieldGroup>
          </div>
          <SheetFooter className="border-t">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting && <Spinner data-icon="inline-start" />}
                  {sample ? "Save changes" : "Create sample"}
                </Button>
              )}
            </form.Subscribe>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
