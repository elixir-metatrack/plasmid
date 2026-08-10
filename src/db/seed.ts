import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import { sql as drizzleSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { samples } from "./samples-schema";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema: { samples } });

type SampleInsert = typeof samples.$inferInsert;

type SkippedRow = {
  line: number;
  alias: string;
  reason: string;
};

function toText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toNumber(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  return Number.parseFloat(trimmed);
}

function toIsoDate(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
  if (!match) return null;
  const [, day, month, year] = match;
  const dayNum = Number.parseInt(day, 10);
  const monthNum = Number.parseInt(month, 10);
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;
  return `${year}-${month}-${day}`;
}

function mapRow(row: string[]): SampleInsert {
  return {
    alias: row[0].trim(),
    locality: toText(row[1]),
    description: toText(row[2]),
    latitude: toNumber(row[3]),
    latitudeUnit: toText(row[4]),
    longitude: toNumber(row[5]),
    longitudeUnit: toText(row[6]),
    physicalCoordinates: toText(row[7]),
    // row[8] footprintWKT — no schema column
    countryCode: toText(row[9]),
    higherGeography: toText(row[10]),
    elevation: toNumber(row[11]),
    depth: toNumber(row[12]),
    // row[13] year — no schema column
    collectionDate: toIsoDate(row[14]),
    projectName: toText(row[15]),
    samplingProtocol: toText(row[16]),
    preparationType: toText(row[17]),
    coreLength: toNumber(row[18]),
    storageLocation: toText(row[19]),
    custodian: toText(row[20]),
    collectedBy: toText(row[21]),
    eventId: toText(row[22]),
    recordedBy: toText(row[23]),
    institutionCode: toText(row[24]),
    ownerInstitutionCode: toText(row[25]),
    age: toNumber(row[26]),
    ageUncertainty: toNumber(row[27]),
    basalAge14CBP: toNumber(row[28]),
    basalAgeCalBP: toNumber(row[29]),
    oldestSampleAgeCalBP: toNumber(row[30]),
    bibliographicCitation: toText(row[31]),
    associatedReferences: toText(row[32]),
    occurrenceRemarks: toText(row[33]),
    eventRemarks: toText(row[34]),
    source: toText(row[35]),
  };
}

async function main() {
  const csvPath = resolve(process.cwd(), "sample_data.csv");
  const rows: string[][] = parse(readFileSync(csvPath, "utf8"), {
    relax_column_count: true,
  });

  const dataRows = rows.slice(2); // skip the two header rows
  const skipped: SkippedRow[] = [];
  const byAlias = new Map<string, SampleInsert>();
  const duplicates: string[] = [];

  dataRows.forEach((row, index) => {
    const line = index + 3; // 1-based line number in the CSV
    const alias = (row[0] ?? "").trim();
    if (!alias) {
      skipped.push({ line, alias, reason: "empty alias" });
      return;
    }
    if (alias.includes(",")) {
      skipped.push({ line, alias, reason: "multi-value alias" });
      return;
    }
    if (byAlias.has(alias)) {
      duplicates.push(alias);
    }
    byAlias.set(alias, mapRow(row));
  });

  const records = [...byAlias.values()];
  const batchSize = 100;
  let upserted = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await db
      .insert(samples)
      .values(batch)
      .onConflictDoUpdate({
        target: samples.alias,
        set: {
          locality: sqlExcluded("locality"),
          description: sqlExcluded("description"),
          latitude: sqlExcluded("latitude"),
          latitudeUnit: sqlExcluded("latitude_unit"),
          longitude: sqlExcluded("longitude"),
          longitudeUnit: sqlExcluded("longitude_unit"),
          physicalCoordinates: sqlExcluded("physical_coordinates"),
          countryCode: sqlExcluded("country_code"),
          higherGeography: sqlExcluded("higher_geography"),
          elevation: sqlExcluded("elevation"),
          depth: sqlExcluded("depth"),
          collectionDate: sqlExcluded("collection_date"),
          projectName: sqlExcluded("project_name"),
          samplingProtocol: sqlExcluded("sampling_protocol"),
          preparationType: sqlExcluded("preparation_type"),
          coreLength: sqlExcluded("core_length"),
          storageLocation: sqlExcluded("storage_location"),
          custodian: sqlExcluded("custodian"),
          collectedBy: sqlExcluded("collected_by"),
          eventId: sqlExcluded("event_id"),
          recordedBy: sqlExcluded("recorded_by"),
          institutionCode: sqlExcluded("institution_code"),
          ownerInstitutionCode: sqlExcluded("owner_institution_code"),
          age: sqlExcluded("age"),
          ageUncertainty: sqlExcluded("age_uncertainty"),
          basalAge14CBP: sqlExcluded('"basal_age_14C_BP"'),
          basalAgeCalBP: sqlExcluded('"basal_age_cal_BP"'),
          oldestSampleAgeCalBP: sqlExcluded('"oldest_sample_age_cal_BP"'),
          bibliographicCitation: sqlExcluded("bibliographic_citation"),
          associatedReferences: sqlExcluded("associated_references"),
          occurrenceRemarks: sqlExcluded("occurrence_remarks"),
          eventRemarks: sqlExcluded("event_remarks"),
          source: sqlExcluded("source"),
        },
      });
    upserted += batch.length;
    console.log(`Upserted ${upserted}/${records.length} rows...`);
  }

  console.log("\n--- Seed summary ---");
  console.log(`Total data rows processed: ${dataRows.length}`);
  console.log(`Upserted: ${upserted}`);
  console.log(`Skipped: ${skipped.length}`);
  for (const s of skipped) {
    console.log(
      `  line ${s.line}: ${s.reason}${s.alias ? ` ("${s.alias}")` : ""}`,
    );
  }
  if (duplicates.length > 0) {
    console.log(
      `Duplicate aliases in CSV (last occurrence wins): ${duplicates.join(", ")}`,
    );
  }
}

function sqlExcluded(column: string) {
  return drizzleSql.raw(`excluded.${column}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
