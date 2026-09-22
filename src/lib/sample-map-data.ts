import type { FeatureCollection, Point } from "geojson";

type SampleLocation = {
  id: string;
  longitude: number | null;
  latitude: number | null;
};

export type SampleMapProperties = { sampleId: string };

export function hasValidSampleCoordinates<T extends SampleLocation>(
  sample: T,
): sample is T & { longitude: number; latitude: number } {
  return (
    typeof sample.longitude === "number" &&
    Number.isFinite(sample.longitude) &&
    sample.longitude >= -180 &&
    sample.longitude <= 180 &&
    typeof sample.latitude === "number" &&
    Number.isFinite(sample.latitude) &&
    sample.latitude >= -90 &&
    sample.latitude <= 90
  );
}

export function createSampleMapData<T extends SampleLocation>(
  samples: readonly T[],
) {
  const data: FeatureCollection<Point, SampleMapProperties> = {
    type: "FeatureCollection",
    features: [],
  };
  const samplesById = new Map<
    string,
    T & { longitude: number; latitude: number }
  >();

  for (const sample of samples) {
    if (!hasValidSampleCoordinates(sample)) continue;
    samplesById.set(sample.id, sample);
    data.features.push({
      type: "Feature",
      id: sample.id,
      geometry: {
        type: "Point",
        coordinates: [sample.longitude, sample.latitude],
      },
      properties: { sampleId: sample.id },
    });
  }

  return { data, samplesById };
}
