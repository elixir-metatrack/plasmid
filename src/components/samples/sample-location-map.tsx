"use client";

import type { Feature, Point } from "geojson";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  // biome-ignore lint/suspicious/noShadowRestrictedNames: <Map here only refers to the mapcn component>
  Map,
  MapClusterLayer,
  MapControls,
  MapPopup,
} from "@/components/ui/map";
import {
  createSampleMapData,
  type SampleMapProperties,
} from "@/lib/sample-map-data";
import { useSampleSelectionStore } from "@/lib/sample-selection-store";

export function SampleLocationMap() {
  const selectedSamples = useSampleSelectionStore(
    (state) => state.selectedSamples,
  );
  const { data, samplesById } = useMemo(
    () => createSampleMapData(selectedSamples),
    [selectedSamples],
  );
  const [activeSample, setActiveSample] = useState<{
    sampleId: string;
    coordinates: [number, number];
  } | null>(null);
  const sample = activeSample
    ? samplesById.get(activeSample.sampleId)
    : undefined;

  useEffect(() => {
    if (activeSample && !samplesById.has(activeSample.sampleId)) {
      setActiveSample(null);
    }
  }, [activeSample, samplesById]);

  const handlePointClick = useCallback(
    (
      feature: Feature<Point, SampleMapProperties>,
      coordinates: [number, number],
    ) => {
      setActiveSample({ sampleId: feature.properties.sampleId, coordinates });
    },
    [],
  );
  const handlePopupClose = useCallback(() => setActiveSample(null), []);
  return (
    <Card className="h-120 p-0 overflow-hidden">
      <Map center={[-2, 67]} zoom={4}>
        <MapClusterLayer data={data} onPointClick={handlePointClick} />
        {sample && activeSample ? (
          <MapPopup
            key={sample.id}
            longitude={
              sample.longitude +
              360 *
                Math.round(
                  (activeSample.coordinates[0] - sample.longitude) / 360,
                )
            }
            latitude={sample.latitude}
            onClose={handlePopupClose}
            closeOnClick={false}
            closeButton
          >
            <div className="flex flex-col gap-1">
              <p className="text-foreground font-medium">{sample.alias}</p>
              <p className="text-muted-foreground text-xs">
                ({sample.latitude.toFixed(4)}, {sample.longitude.toFixed(4)})
              </p>
              <p className="text-muted-foreground text-xs">{sample.locality}</p>
              <p className="text-muted-foreground text-xs">{sample.source}</p>
              {sample.countryCode ? (
                <p className="text-muted-foreground text-xs">
                  {sample.countryCode}
                </p>
              ) : null}
              {sample.collectionDate ? (
                <p className="text-muted-foreground text-xs">
                  {sample.collectionDate}
                </p>
              ) : null}
            </div>
          </MapPopup>
        ) : null}
        <MapControls />
      </Map>
    </Card>
  );
}
